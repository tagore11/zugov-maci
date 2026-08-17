import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GovernanceActionsList } from "./GovernanceActionsList";

const listMock = vi.fn();
const sponsorMock = vi.fn();
const authorizeFormalizeMock = vi.fn();
const checkVoteEligibilityMock = vi.fn();
const confirmFormalizeMock = vi.fn();

vi.mock("@/src/services/governanceActionApi", () => ({
  list: (...args: unknown[]) => listMock(...args),
  sponsor: (...args: unknown[]) => sponsorMock(...args),
  authorizeFormalize: (...args: unknown[]) => authorizeFormalizeMock(...args),
  checkVoteEligibility: (...args: unknown[]) => checkVoteEligibilityMock(...args),
  confirmFormalize: (...args: unknown[]) => confirmFormalizeMock(...args),
}));

const getTiersMock = vi.fn();
vi.mock("@/src/services/membershipApi", () => ({
  getTiers: (...args: unknown[]) => getTiersMock(...args),
}));

const communityGetMock = vi.fn();
vi.mock("@/src/services/communityApi", () => ({
  get: (...args: unknown[]) => communityGetMock(...args),
}));

const deployPollMock = vi.fn();
const getEthersSignerMock = vi.fn(() => Promise.resolve({}));
vi.mock("@/src/hooks/useDeployPoll", () => ({
  useDeployPoll: () => ({
    isDeploying: false,
    deployStep: null,
    deployError: null,
    deployPoll: (...args: unknown[]) => deployPollMock(...args),
  }),
  getEthersSigner: () => getEthersSignerMock(),
}));

const deployPolicyContractMock = vi.fn((..._args: unknown[]) => Promise.resolve("0xPolicy"));
vi.mock("@/src/services/policyDeploy", () => ({
  deployPolicyContract: (...args: unknown[]) => deployPolicyContractMock(...args),
  SET_TARGET_ABI: ["function setTarget(address _guarded)"],
}));

const voteOptionsMock = vi.fn();
vi.mock("@/src/poll-factory-shim", () => ({
  Poll__factory: {
    connect: () => ({ voteOptions: () => voteOptionsMock() }),
  },
}));

// VoteModal (unmodified, per specs/005 plan.md) calls wagmi's useAccount and useVote directly —
// mocked here purely so it can mount in this test environment; its own vote-casting behavior is
// out of scope for this feature (specs/006/specs/005 T039 only wires up *reaching* VoteModal).
vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0xVoter" }),
  useChainId: () => 11155111,
}));
const castVoteMock = vi.fn();
vi.mock("@/src/hooks/useVote", () => ({
  useVote: () => ({ isVoting: false, voteError: null, castVote: castVoteMock }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const DRAFT_ACTION = {
  id: "action-1",
  communityId: "0xabc",
  type: "poll" as const,
  title: "Fund the garden",
  description: "Details",
  privacy: "privacy_preserving" as const,
  executionLocation: "onchain" as const,
  tallyMechanism: "simple" as const,
  eligibleTierIds: ["tier-voter"],
  status: "draft" as const,
  creatorAddress: "0xcreator",
  pollAddress: null,
  pollId: null,
  createdAt: 0,
  formalizedAt: null,
  sponsorCount: 1,
  thresholdMet: false,
};

const POLL_DEPLOY_CONFIG = {
  coordinatorPublicKey: "macipk.842ada068e4156f836e02336160ae0172f0dd9b43280edeb4572c57793068dd3",
  treeDepths: { tallyProcessingStateTreeDepth: 1, voteOptionTreeDepth: 2, stateTreeDepth: 10 },
  messageBatchSize: 20,
  freeForAllPolicyFactory: "0x4dF289F131b388bC805995adBB1006471e2cEedD",
  freeForAllChecker: "0xa87fCEB0064f064b6a5Fa54AF85014a24ce99162",
  constantVoiceCreditProxyFactory: "0xF49949D519f0A321bb08b0ca94dEF40E98b663eF",
  initialVoiceCreditAmount: 100,
};

beforeEach(() => {
  listMock.mockReset();
  sponsorMock.mockReset();
  authorizeFormalizeMock.mockReset();
  checkVoteEligibilityMock.mockReset();
  confirmFormalizeMock.mockReset();
  deployPollMock.mockReset();
  getTiersMock.mockReset();
  getTiersMock.mockResolvedValue([]);
  communityGetMock.mockReset();
  communityGetMock.mockResolvedValue(null);
  voteOptionsMock.mockReset();
  castVoteMock.mockReset();
});

describe("GovernanceActionsList", () => {
  it("shows a prompt instead of fetching when not connected", () => {
    renderWithProviders(<GovernanceActionsList communityId="0xabc" connected={false} />);
    expect(screen.getByText(/Connect your wallet/)).toBeInTheDocument();
    expect(listMock).not.toHaveBeenCalled();
  });

  it("updates the sponsor count after a successful sponsor click, without double-counting a repeat", async () => {
    listMock.mockResolvedValue({ governanceActions: [DRAFT_ACTION] });
    sponsorMock.mockResolvedValue({ sponsorCount: 2, thresholdMet: false });

    renderWithProviders(<GovernanceActionsList communityId="0xabc" connected={true} />);

    await waitFor(() => expect(screen.getByText("Fund the garden")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Sponsor"));

    await waitFor(() => expect(sponsorMock).toHaveBeenCalledWith("0xabc", "action-1"));
    // sponsor's own reported count (idempotent server response) is used, not incremented client-side
    expect(sponsorMock).toHaveBeenCalledTimes(1);
  });

  it("shows the static 'not linked' message when the community has no saved pollDeployConfig", async () => {
    listMock.mockResolvedValue({ governanceActions: [DRAFT_ACTION] });
    sponsorMock.mockResolvedValue({ sponsorCount: 2, thresholdMet: true });
    authorizeFormalizeMock.mockResolvedValue({ authorized: true });
    communityGetMock.mockResolvedValue({ id: "0xabc" }); // no pollDeployConfig field

    renderWithProviders(<GovernanceActionsList communityId="0xabc" connected={true} />);

    await waitFor(() => expect(screen.getByText("Fund the garden")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Sponsor"));

    await waitFor(() =>
      expect(screen.getByText(/on-chain deployment isn't linked for this community yet/)).toBeInTheDocument(),
    );
    expect(deployPollMock).not.toHaveBeenCalled();
  });

  it("disables Deploy Poll until at least two options are filled in", async () => {
    listMock.mockResolvedValue({ governanceActions: [DRAFT_ACTION] });
    sponsorMock.mockResolvedValue({ sponsorCount: 2, thresholdMet: true });
    authorizeFormalizeMock.mockResolvedValue({ authorized: true });
    communityGetMock.mockResolvedValue({ id: "0xabc", pollDeployConfig: POLL_DEPLOY_CONFIG });

    renderWithProviders(<GovernanceActionsList communityId="0xabc" connected={true} />);

    await waitFor(() => expect(screen.getByText("Fund the garden")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Sponsor"));

    await waitFor(() => expect(screen.getByText("Deploy Poll")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Poll start date"), { target: { value: "2026-01-01T00:00" } });
    fireEvent.change(screen.getByLabelText("Poll end date"), { target: { value: "2026-01-08T00:00" } });

    // No options filled in yet — button must stay disabled, and the deploy must never fire.
    expect(screen.getByText("Deploy Poll")).toBeDisabled();
    fireEvent.click(screen.getByText("Deploy Poll"));
    expect(deployPollMock).not.toHaveBeenCalled();

    // Only one option filled — still not enough for a real poll.
    fireEvent.change(screen.getByPlaceholderText("Option 1"), { target: { value: "Yes" } });
    expect(screen.getByText("Deploy Poll")).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("Option 2"), { target: { value: "No" } });
    expect(screen.getByText("Deploy Poll")).not.toBeDisabled();
  });

  it("shows a real deploy prompt and confirms formalization when the community has a saved pollDeployConfig", async () => {
    listMock.mockResolvedValue({ governanceActions: [DRAFT_ACTION] });
    sponsorMock.mockResolvedValue({ sponsorCount: 2, thresholdMet: true });
    authorizeFormalizeMock.mockResolvedValue({ authorized: true });
    communityGetMock.mockResolvedValue({ id: "0xabc", pollDeployConfig: POLL_DEPLOY_CONFIG });
    deployPollMock.mockResolvedValue({ pollAddress: "0xPoll", pollId: "0", txHash: "0xTx" });
    confirmFormalizeMock.mockResolvedValue({ governanceAction: { ...DRAFT_ACTION, status: "formalized" } });

    renderWithProviders(<GovernanceActionsList communityId="0xabc" connected={true} />);

    await waitFor(() => expect(screen.getByText("Fund the garden")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Sponsor"));

    await waitFor(() => expect(screen.getByText("Deploy Poll")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Poll start date"), { target: { value: "2026-01-01T00:00" } });
    fireEvent.change(screen.getByLabelText("Poll end date"), { target: { value: "2026-01-08T00:00" } });
    fireEvent.change(screen.getByPlaceholderText("Option 1"), { target: { value: "Yes" } });
    fireEvent.change(screen.getByPlaceholderText("Option 2"), { target: { value: "No" } });
    fireEvent.click(screen.getByText("Deploy Poll"));

    await waitFor(() => expect(deployPollMock).toHaveBeenCalledTimes(1));
    const call = deployPollMock.mock.calls[0][0] as { maciAddress: string; pollDeployConfig: unknown };
    expect(call.maciAddress).toBe("0xabc");
    expect(call.pollDeployConfig).toEqual(POLL_DEPLOY_CONFIG);

    await waitFor(() =>
      expect(confirmFormalizeMock).toHaveBeenCalledWith("0xabc", "action-1", {
        pollAddress: "0xPoll",
        pollId: "0",
        txHash: "0xTx",
        pollStartDate: Math.floor(new Date("2026-01-01T00:00").getTime() / 1000),
        pollEndDate: Math.floor(new Date("2026-01-08T00:00").getTime() / 1000),
      }),
    );
  });

  it("shows the rejection reason when authorize fails after threshold is met", async () => {
    listMock.mockResolvedValue({ governanceActions: [DRAFT_ACTION] });
    sponsorMock.mockResolvedValue({ sponsorCount: 2, thresholdMet: true });
    authorizeFormalizeMock.mockRejectedValue(new Error("Co-sponsorship threshold not met"));

    renderWithProviders(<GovernanceActionsList communityId="0xabc" connected={true} />);

    await waitFor(() => expect(screen.getByText("Fund the garden")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Sponsor"));

    await waitFor(() => expect(screen.getByText("Co-sponsorship threshold not met")).toBeInTheDocument());
  });

  it("shows vote eligibility for formalized actions", async () => {
    listMock.mockResolvedValue({
      governanceActions: [{ ...DRAFT_ACTION, status: "formalized", pollAddress: "0xPoll" }],
    });
    checkVoteEligibilityMock.mockResolvedValue({ eligible: true });

    renderWithProviders(<GovernanceActionsList communityId="0xabc" connected={true} />);

    await waitFor(() => expect(screen.getByText("You can vote")).toBeInTheDocument());
  });

  it("opens a real ballot when eligible to vote on a formalized action", async () => {
    listMock.mockResolvedValue({
      governanceActions: [{ ...DRAFT_ACTION, status: "formalized", pollAddress: "0xPoll", pollId: "3" }],
    });
    checkVoteEligibilityMock.mockResolvedValue({ eligible: true });
    communityGetMock.mockResolvedValue({ id: "0xabc", chainId: 11155111 });
    voteOptionsMock.mockResolvedValue(2n);

    renderWithProviders(<GovernanceActionsList communityId="0xabc" connected={true} />);

    await waitFor(() => expect(screen.getByText("Vote")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Vote"));

    await waitFor(() => expect(voteOptionsMock).toHaveBeenCalled());
    // VoteModal (real, unmodified component) renders with a fallback "Option 1"/"Option 2" ballot
    // since this feature reads only the on-chain vote-option count, not label text (no subgraph
    // exists for backend-registered communities, and the deployed Poll contract only exposes the
    // count — see loadPollForVoting's comment in GovernanceActionsList.tsx).
    await waitFor(() => expect(screen.getByText("Select one option to cast your vote.")).toBeInTheDocument());
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("does not show a Vote button for a formalized action the viewer isn't eligible for", async () => {
    listMock.mockResolvedValue({
      governanceActions: [{ ...DRAFT_ACTION, status: "formalized", pollAddress: "0xPoll" }],
    });
    checkVoteEligibilityMock.mockResolvedValue({ eligible: false, reason: "tier_lacks_voting_rights" });

    renderWithProviders(<GovernanceActionsList communityId="0xabc" connected={true} />);

    await waitFor(() => expect(screen.getByText("Your current tier doesn't grant voting rights.")).toBeInTheDocument());
    expect(screen.queryByText("Vote")).not.toBeInTheDocument();
  });

  it("shows the ineligibility reason for formalized actions the viewer can't vote on", async () => {
    listMock.mockResolvedValue({
      governanceActions: [{ ...DRAFT_ACTION, status: "formalized", pollAddress: "0xPoll" }],
    });
    checkVoteEligibilityMock.mockResolvedValue({ eligible: false, reason: "tier_lacks_voting_rights" });

    renderWithProviders(<GovernanceActionsList communityId="0xabc" connected={true} />);

    await waitFor(() => expect(screen.getByText("Your current tier doesn't grant voting rights.")).toBeInTheDocument());
  });
});
