import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PollDeployConfig } from "@/src/config";
import { CreateGovernanceActionModal } from "./CreateGovernanceActionModal";

const getTiersMock = vi.fn();
vi.mock("@/src/services/membershipApi", () => ({
  getTiers: (...args: unknown[]) => getTiersMock(...args),
}));

const createDraftMock = vi.fn();
const authorizeDirectMock = vi.fn();
const confirmDirectMock = vi.fn();
vi.mock("@/src/services/governanceActionApi", () => ({
  createDraft: (...args: unknown[]) => createDraftMock(...args),
  authorizeDirect: (...args: unknown[]) => authorizeDirectMock(...args),
  confirmDirect: (...args: unknown[]) => confirmDirectMock(...args),
}));

vi.mock("wagmi", () => ({
  useChainId: () => 11155111,
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

const POLL_DEPLOY_CONFIG: PollDeployConfig = {
  coordinatorPublicKey: "macipk.842ada068e4156f836e02336160ae0172f0dd9b43280edeb4572c57793068dd3",
  treeDepths: { tallyProcessingStateTreeDepth: 1, voteOptionTreeDepth: 2, stateTreeDepth: 6 },
  messageBatchSize: 20,
  freeForAllPolicyFactory: "0x4dF289F131b388bC805995adBB1006471e2cEedD",
  freeForAllChecker: "0xa87fCEB0064f064b6a5Fa54AF85014a24ce99162",
  constantVoiceCreditProxyFactory: "0xF49949D519f0A321bb08b0ca94dEF40E98b663eF",
  initialVoiceCreditAmount: 100,
};

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

async function fillCommonFields() {
  fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "Fund the garden" } });
  fireEvent.change(screen.getByLabelText(/Description/), { target: { value: "Details here" } });
}

beforeEach(() => {
  getTiersMock.mockReset();
  createDraftMock.mockReset();
  authorizeDirectMock.mockReset();
  confirmDirectMock.mockReset();
  deployPollMock.mockReset();
  getTiersMock.mockResolvedValue([
    { id: "tier-voter", label: "Voter", canVote: true, isDefault: false },
    { id: "tier-guest", label: "Guest", canVote: false, isDefault: true },
  ]);
});

describe("CreateGovernanceActionModal", () => {
  it("renders non-executable axis options as visible but disabled", async () => {
    renderWithProviders(<CreateGovernanceActionModal isOpen={true} onClose={() => {}} communityId="0xabc" />);

    await waitFor(() => expect(screen.getByText(/Every voting-capable tier/)).toBeInTheDocument());

    const publicRadio = screen.getByText("Public").closest("div")!.parentElement!.querySelector("input")!;
    expect(publicRadio).toBeDisabled();

    const offchainRadio = screen.getByText("Offchain").closest("div")!.parentElement!.querySelector("input")!;
    expect(offchainRadio).toBeDisabled();
    const hybridRadio = screen.getByText("Hybrid").closest("div")!.parentElement!.querySelector("input")!;
    expect(hybridRadio).toBeDisabled();

    const weightedOption = screen.getByRole("option", { name: /Weighted/ }) as HTMLOptionElement;
    expect(weightedOption.disabled).toBe(true);

    // only voting-capable tiers are mentioned as eligible
    expect(screen.queryByText("Guest")).not.toBeInTheDocument();
  });

  it("auto-derives eligibleTierIds from every voting-capable tier, without a manual picker (specs/010 US7, FR-014)", async () => {
    createDraftMock.mockResolvedValue({ governanceAction: {} });
    renderWithProviders(<CreateGovernanceActionModal isOpen={true} onClose={() => {}} communityId="0xabc" />);

    await waitFor(() => expect(screen.getByText("Voter", { exact: false })).toBeInTheDocument());
    // No checkbox/tier picker exists — only voting-tier data appears as read-only explanatory text.
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    await fillCommonFields();
    fireEvent.click(screen.getByText("Create Draft"));

    await waitFor(() => expect(createDraftMock).toHaveBeenCalled());
    expect(createDraftMock).toHaveBeenCalledWith("0xabc", expect.objectContaining({ eligibleTierIds: ["tier-voter"] }));
  });

  it("surfaces a 403 rejection instead of silently succeeding", async () => {
    createDraftMock.mockRejectedValue(new Error("Not authorized to create governance actions"));
    renderWithProviders(<CreateGovernanceActionModal isOpen={true} onClose={() => {}} communityId="0xabc" />);

    await waitFor(() => expect(screen.getByText(/Every voting-capable tier/)).toBeInTheDocument());

    await fillCommonFields();
    fireEvent.click(screen.getByText("Create Draft"));

    await waitFor(() => expect(screen.getByText("Not authorized to create governance actions")).toBeInTheDocument());
  });

  describe("direct deployment mode (specs/007 US2)", () => {
    // No community prop is passed in these tests, so allowedPolicyTypes is empty and the
    // eligibility policy picker falls back to "FreeForAll", which needs no extra parameter
    // fields, matching this mode's replacement of the old tier checkboxes.
    async function fillDirectModeFields() {
      fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "Fund the garden" } });
      fireEvent.change(screen.getByLabelText(/Description/), { target: { value: "Details here" } });
      fireEvent.change(screen.getByLabelText(/Start Date/), { target: { value: "2026-01-01T00:00" } });
      fireEvent.change(screen.getByLabelText(/End Date/), { target: { value: "2026-01-02T00:00" } });
      const optionInputs = screen.getAllByPlaceholderText(/Option \d/);
      fireEvent.change(optionInputs[0]!, { target: { value: "Yes" } });
      fireEvent.change(optionInputs[1]!, { target: { value: "No" } });
    }

    it("renders deploy-time fields and calls authorizeDirect → deployPoll → confirmDirect in order", async () => {
      authorizeDirectMock.mockResolvedValue({ authorized: true });
      deployPollMock.mockResolvedValue({ pollAddress: "0xPoll", pollId: "0", txHash: "0xTx" });
      confirmDirectMock.mockResolvedValue({ governanceAction: {} });

      renderWithProviders(
        <CreateGovernanceActionModal
          isOpen={true}
          onClose={() => {}}
          communityId="0xabc"
          directDeploymentEnabled={true}
          pollDeployConfig={POLL_DEPLOY_CONFIG}
        />,
      );

      await waitFor(() => expect(screen.getByLabelText(/Title/)).toBeInTheDocument());
      await fillDirectModeFields();
      fireEvent.click(screen.getByText("Deploy Poll"));

      await waitFor(() => expect(confirmDirectMock).toHaveBeenCalled());
      expect(authorizeDirectMock).toHaveBeenCalled();
      expect(deployPollMock).toHaveBeenCalled();

      const authorizeOrder = authorizeDirectMock.mock.invocationCallOrder[0]!;
      const deployOrder = deployPollMock.mock.invocationCallOrder[0]!;
      const confirmOrder = confirmDirectMock.mock.invocationCallOrder[0]!;
      expect(authorizeOrder).toBeLessThan(deployOrder);
      expect(deployOrder).toBeLessThan(confirmOrder);
    });

    it("surfaces an authorizeDirect 403 and never calls deployPoll", async () => {
      authorizeDirectMock.mockRejectedValue(new Error("Not authorized to create governance actions"));

      renderWithProviders(
        <CreateGovernanceActionModal
          isOpen={true}
          onClose={() => {}}
          communityId="0xabc"
          directDeploymentEnabled={true}
          pollDeployConfig={POLL_DEPLOY_CONFIG}
        />,
      );

      await waitFor(() => expect(screen.getByLabelText(/Title/)).toBeInTheDocument());
      await fillDirectModeFields();
      fireEvent.click(screen.getByText("Deploy Poll"));

      await waitFor(() => expect(screen.getByText("Not authorized to create governance actions")).toBeInTheDocument());
      expect(deployPollMock).not.toHaveBeenCalled();
    });

    it("renders the pollDeployConfig-missing fallback and never calls authorizeDirect", async () => {
      renderWithProviders(
        <CreateGovernanceActionModal
          isOpen={true}
          onClose={() => {}}
          communityId="0xabc"
          directDeploymentEnabled={true}
          pollDeployConfig={null}
        />,
      );

      expect(screen.getByText(/on-chain deployment isn't linked/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/Title/)).not.toBeInTheDocument();
      expect(authorizeDirectMock).not.toHaveBeenCalled();
    });
  });
});
