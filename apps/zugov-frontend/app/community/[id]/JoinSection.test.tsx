import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { JoinSection } from "./JoinSection";

const joinMock = vi.fn();
const getMembershipStatusMock = vi.fn();
vi.mock("@/src/services/membershipApi", () => ({
  join: (...args: unknown[]) => joinMock(...args),
  getMembershipStatus: (...args: unknown[]) => getMembershipStatusMock(...args),
  DuplicateJoinError: class DuplicateJoinError extends Error {},
}));

const signupToMaciMock = vi.fn();
vi.mock("@/src/hooks/useSignup", () => ({
  useSignup: () => ({
    isSigningUp: false,
    signupError: null,
    signupToMaci: (...args: unknown[]) => signupToMaciMock(...args),
  }),
}));

let maciKeypairMock: { publicKey: { hash: () => string } } | null = null;
vi.mock("@/src/context/MaciContext", () => ({
  useMaci: () => ({ maciKeypair: maciKeypairMock }),
}));

const getStateIndexMock = vi.fn();
const maciFactoryConnectMock = vi.fn((..._args: unknown[]) => ({ getStateIndex: getStateIndexMock }));
vi.mock("@/src/poll-factory-shim", () => ({
  MACI__factory: { connect: (...args: unknown[]) => maciFactoryConnectMock(...args) },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  joinMock.mockReset();
  signupToMaciMock.mockReset();
  getMembershipStatusMock.mockReset();
  getMembershipStatusMock.mockResolvedValue({ status: "none" });
  maciKeypairMock = null;
  getStateIndexMock.mockReset();
  maciFactoryConnectMock.mockClear();
});

describe("JoinSection", () => {
  it("renders nothing when the wallet isn't connected", () => {
    const { container } = renderWithProviders(
      <JoinSection communityId="0xabc" contractAddress="0xabc" connected={false} rpcUrl="http://localhost:8545" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a Join button when connected", () => {
    renderWithProviders(
      <JoinSection communityId="0xabc" contractAddress="0xabc" connected={true} rpcUrl="http://localhost:8545" />,
    );
    expect(screen.getByText("Join")).toBeInTheDocument();
  });

  it("signs up on-chain and records backend membership after a successful join", async () => {
    signupToMaciMock.mockResolvedValue(undefined);
    joinMock.mockResolvedValue({ status: "approved", tierLabel: "Regular" });
    renderWithProviders(
      <JoinSection communityId="0xabc" contractAddress="0xabc" connected={true} rpcUrl="http://localhost:8545" />,
    );

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() => expect(screen.getByText(/Signed up/)).toBeInTheDocument());
    expect(signupToMaciMock).toHaveBeenCalledWith("0xabc");
    expect(joinMock).toHaveBeenCalledWith("0xabc");
  });

  it("still succeeds if the backend join fails after a successful on-chain signup", async () => {
    signupToMaciMock.mockResolvedValue(undefined);
    joinMock.mockRejectedValue(new Error("Already a member or already have a pending request for this community"));
    renderWithProviders(
      <JoinSection communityId="0xabc" contractAddress="0xabc" connected={true} rpcUrl="http://localhost:8545" />,
    );

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() => expect(screen.getByText(/Signed up/)).toBeInTheDocument());
  });

  it("shows the joined state (not an enabled Join button) when already registered on-chain, e.g. after a remount", async () => {
    maciKeypairMock = { publicKey: { hash: () => "hash123" } };
    getStateIndexMock.mockResolvedValue(1n);
    renderWithProviders(
      <JoinSection communityId="0xabc" contractAddress="0xabc" connected={true} rpcUrl="http://localhost:8545" />,
    );

    await waitFor(() => expect(screen.getByText(/Signed up/)).toBeInTheDocument());
    expect(screen.queryByText("Join")).not.toBeInTheDocument();
    expect(getStateIndexMock).toHaveBeenCalledWith("hash123");
  });

  it("renders the member's role/tier label alongside the signed-up status (specs/010 US2, FR-008)", async () => {
    maciKeypairMock = { publicKey: { hash: () => "hash123" } };
    getStateIndexMock.mockResolvedValue(1n);
    getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Admin" });
    renderWithProviders(
      <JoinSection communityId="0xabc" contractAddress="0xabc" connected={true} rpcUrl="http://localhost:8545" />,
    );

    await waitFor(() => expect(screen.getByText(/Signed up/)).toBeInTheDocument());
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows a Join button when the on-chain state index is 0 (not yet registered)", async () => {
    maciKeypairMock = { publicKey: { hash: () => "hash123" } };
    getStateIndexMock.mockResolvedValue(0n);
    renderWithProviders(
      <JoinSection communityId="0xabc" contractAddress="0xabc" connected={true} rpcUrl="http://localhost:8545" />,
    );

    await waitFor(() => expect(getStateIndexMock).toHaveBeenCalled());
    expect(screen.getByText("Join")).toBeInTheDocument();
  });

  // Create-community wizard fix (2026-08-21): a governance-less community must still be
  // joinable — this used to hide the Join button entirely behind a "not yet configured" message,
  // blocking every non-creator from ever joining an ungoverned community (the reported bug).
  it("shows a Join button (not just a not-configured message) when governance isn't set up yet", () => {
    renderWithProviders(
      <JoinSection communityId="0xabc" contractAddress={null} connected={true} rpcUrl="http://localhost:8545" />,
    );
    expect(screen.getByText(/Governance not yet configured/)).toBeInTheDocument();
    expect(screen.getByText("Join")).toBeInTheDocument();
  });

  it("joins via the backend only (no on-chain signup attempted) when governance isn't configured", async () => {
    joinMock.mockResolvedValue({ status: "approved", tierLabel: "Regular" });
    getMembershipStatusMock
      .mockResolvedValueOnce({ status: "none" })
      .mockResolvedValueOnce({ status: "member", tierLabel: "Regular" });
    renderWithProviders(
      <JoinSection communityId="0xabc" contractAddress={null} connected={true} rpcUrl="http://localhost:8545" />,
    );

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() => expect(screen.getByText(/You're a member/)).toBeInTheDocument());
    expect(joinMock).toHaveBeenCalledWith("0xabc");
    expect(signupToMaciMock).not.toHaveBeenCalled();
  });

  it("shows 'pending admin review' instead of a Join button when a request is already pending, ungoverned community", async () => {
    getMembershipStatusMock.mockResolvedValue({ status: "pending" });
    renderWithProviders(
      <JoinSection communityId="0xabc" contractAddress={null} connected={true} rpcUrl="http://localhost:8545" />,
    );
    await waitFor(() => expect(screen.getByText(/pending admin review/)).toBeInTheDocument());
    expect(screen.queryByText("Join")).not.toBeInTheDocument();
  });

  it("shows a join error inline when the backend join call fails, ungoverned community", async () => {
    joinMock.mockRejectedValue(new Error("Does not meet this community's eligibility requirements"));
    renderWithProviders(
      <JoinSection communityId="0xabc" contractAddress={null} connected={true} rpcUrl="http://localhost:8545" />,
    );

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() =>
      expect(screen.getByText("Does not meet this community's eligibility requirements")).toBeInTheDocument(),
    );
  });

  it("shows an error message when the on-chain signup fails", async () => {
    signupToMaciMock.mockRejectedValue(new Error("Wallet not connected"));
    renderWithProviders(
      <JoinSection communityId="0xabc" contractAddress="0xabc" connected={true} rpcUrl="http://localhost:8545" />,
    );

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() => expect(screen.getByText("Wallet not connected")).toBeInTheDocument());
    expect(joinMock).not.toHaveBeenCalled();
  });
});
