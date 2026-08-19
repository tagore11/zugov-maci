import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VoteModal } from "./VoteModal";
import type { SubgraphPoll } from "@/src/services/subgraph";

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0xVoter" }),
}));

const castVoteMock = vi.fn();
vi.mock("@/src/hooks/useVote", () => ({
  useVote: () => ({ isVoting: false, voteError: null, castVote: castVoteMock }),
}));

// Fixed clock so poll active/inactive status is deterministic in tests.
const NOW_MS = 1_700_000_000_000;
vi.mock("@/src/hooks/useNow", () => ({
  useNow: () => NOW_MS,
}));

vi.mock("@/src/context/MaciContext", () => ({
  useMaci: () => ({ maciKeypair: { publicKey: { raw: [1n, 2n] } } }),
}));

const fetchHasVotedMock = vi.fn();
vi.mock("@/src/services/subgraph", () => ({
  fetchHasVoted: (...args: unknown[]) => fetchHasVotedMock(...args),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const NOW_SEC = NOW_MS / 1000;

const BASE_POLL: SubgraphPoll = {
  id: "0xPoll",
  pollId: "0",
  name: "Test Poll",
  metadata: "desc",
  startDate: (NOW_SEC - 3600).toString(),
  endDate: (NOW_SEC + 3600).toString(),
  voteOptions: "2",
  options: ["Fund the greenhouse", "Fund the library"],
  mode: "1",
  policyType: "",
  policy: "",
};

beforeEach(() => {
  castVoteMock.mockReset();
  fetchHasVotedMock.mockReset();
  fetchHasVotedMock.mockResolvedValue(false);
});

describe("VoteModal", () => {
  it("renders the real option labels instead of generated placeholders", async () => {
    renderWithProviders(
      <VoteModal
        poll={BASE_POLL}
        maciAddress="0xMaci"
        rpcUrl="http://rpc"
        subgraphUrl="http://subgraph"
        governanceType="maci"
        onClose={() => {}}
        onSuccess={() => {}}
      />,
    );

    expect(screen.getByText("Fund the greenhouse")).toBeInTheDocument();
    expect(screen.getByText("Fund the library")).toBeInTheDocument();
    expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
  });

  it("disables Cast Vote when the poll hasn't started yet", async () => {
    renderWithProviders(
      <VoteModal
        poll={{ ...BASE_POLL, startDate: (NOW_SEC + 3600).toString() }}
        maciAddress="0xMaci"
        rpcUrl="http://rpc"
        subgraphUrl="http://subgraph"
        governanceType="maci"
        onClose={() => {}}
        onSuccess={() => {}}
      />,
    );

    expect(screen.getByText("Voting hasn't opened for this poll yet.")).toBeInTheDocument();
    expect(screen.getByText("Cast Vote")).toBeDisabled();
  });

  it("disables Cast Vote when the poll has closed", async () => {
    renderWithProviders(
      <VoteModal
        poll={{ ...BASE_POLL, endDate: (NOW_SEC - 60).toString() }}
        maciAddress="0xMaci"
        rpcUrl="http://rpc"
        subgraphUrl="http://subgraph"
        governanceType="maci"
        onClose={() => {}}
        onSuccess={() => {}}
      />,
    );

    expect(screen.getByText("Voting has closed for this poll.")).toBeInTheDocument();
    expect(screen.getByText("Cast Vote")).toBeDisabled();
  });

  it("shows the already-voted indicator when fetchHasVoted resolves true", async () => {
    fetchHasVotedMock.mockResolvedValue(true);

    renderWithProviders(
      <VoteModal
        poll={BASE_POLL}
        maciAddress="0xMaci"
        rpcUrl="http://rpc"
        subgraphUrl="http://subgraph"
        governanceType="maci"
        onClose={() => {}}
        onSuccess={() => {}}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("You already cast a vote on this poll. You can recast it below.")).toBeInTheDocument(),
    );
    expect(screen.getByText("Recast Vote")).toBeInTheDocument();
    expect(fetchHasVotedMock).toHaveBeenCalledWith("http://subgraph", "maci", "0xPoll", 1n, 2n);
  });
});
