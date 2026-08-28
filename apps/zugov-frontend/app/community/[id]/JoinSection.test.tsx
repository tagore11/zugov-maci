import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { JoinSection } from "./JoinSection";
import * as membershipApi from "@/src/services/membershipApi";
import { HttpError } from "@/src/services/httpClient";

// formalize-communities epic, Child G (/plan-eng-review 2026-08-25) — JoinSection now calls
// useConnect() directly for the disconnected-visitor connect prompt (D1).
const connectMock = vi.fn();
vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  return {
    ...actual,
    useConnect: () => ({ connectors: [{ id: "injected" }], connect: connectMock, isPending: false }),
  };
});

const joinMock = vi.fn();
const leaveMock = vi.fn();
const getMembershipStatusMock = vi.fn();
vi.mock("@/src/services/membershipApi", () => ({
  join: (...args: unknown[]) => joinMock(...args),
  leave: (...args: unknown[]) => leaveMock(...args),
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

// Investigation fix (2026-08-21) — the ungoverned join button is now gated behind SiweGate (this
// page previously never established a SIWE session at all, so Join could hit a bare
// "Authentication required" with no recovery). Defaults to authenticated so the existing
// join-flow tests below don't need to click through a sign-in gate first; the dedicated gating
// tests further down override this.
const mockSiwe = {
  isAuthenticated: true,
  isSigning: false,
  error: null as string | null,
  signIn: vi.fn(),
  signOut: vi.fn(),
};
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => mockSiwe,
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
  connectMock.mockReset();
  joinMock.mockReset();
  leaveMock.mockReset();
  signupToMaciMock.mockReset();
  getMembershipStatusMock.mockReset();
  getMembershipStatusMock.mockResolvedValue({ status: "none" });
  maciKeypairMock = null;
  getStateIndexMock.mockReset();
  maciFactoryConnectMock.mockClear();
  mockSiwe.isAuthenticated = true;
  mockSiwe.isSigning = false;
  mockSiwe.error = null;
  mockSiwe.signIn.mockReset();
  mockSiwe.signOut.mockReset();
});

describe("JoinSection", () => {
  // formalize-communities epic, Child G (/plan-eng-review 2026-08-25, D1/D3) — this used to
  // render nothing at all for a disconnected visitor. Now shows a connect prompt instead.
  describe("disconnected visitor (Child G)", () => {
    it("shows a connect-wallet prompt instead of rendering nothing", () => {
      renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress="0xabc"
          connected={false}
          status="disconnected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );
      expect(screen.getByText(/Connect your wallet to join/)).toBeInTheDocument();
      expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
    });

    it("calls connect() with the first available connector on click", () => {
      renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress="0xabc"
          connected={false}
          status="disconnected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );
      fireEvent.click(screen.getByText("Connect Wallet"));
      expect(connectMock).toHaveBeenCalledWith({ connector: { id: "injected" } });
    });

    // D3 — reconnect-flash guard: must come before the plain disconnected check so a returning
    // user with an already-connected wallet never sees a false "Connect Wallet" prompt.
    it.each(["connecting", "reconnecting"] as const)(
      "shows a loading state, not the connect prompt, while %s",
      (status) => {
        renderWithProviders(
          <JoinSection
            communityId="0xabc"
            contractAddress="0xabc"
            connected={false}
            status={status}
            rpcUrl="http://localhost:8545"
            isCreator={false}
          />,
        );
        expect(screen.getByText("Loading…")).toBeInTheDocument();
        expect(screen.queryByText("Connect Wallet")).not.toBeInTheDocument();
      },
    );
  });

  it("shows a Join button when connected", () => {
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress="0xabc"
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
    );
    expect(screen.getByText("Join")).toBeInTheDocument();
  });

  // Bug fix (2026-08-28) — governance being configured (contractAddress set) is independent of
  // allowJoin; a community can deploy governance and later pause new joins. This branch used to
  // ignore allowJoin entirely and always render a clickable Join button.
  it("shows a not-accepting-members message instead of a Join button when allowJoin is false, governed community", () => {
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress="0xabc"
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
        allowJoin={false}
      />,
    );
    expect(screen.getByText("This community is not currently accepting new members.")).toBeInTheDocument();
    expect(screen.queryByText("Join")).not.toBeInTheDocument();
  });

  it("still shows a pending request's status when allowJoin is false, governed community", async () => {
    getMembershipStatusMock.mockResolvedValue({ status: "pending" });
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress="0xabc"
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
        allowJoin={false}
      />,
    );
    await waitFor(() => expect(screen.getByText(/pending admin review/)).toBeInTheDocument());
  });

  it("signs up on-chain and records backend membership after a successful join", async () => {
    signupToMaciMock.mockResolvedValue(undefined);
    joinMock.mockResolvedValue({ status: "approved", tierLabel: "Regular" });
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress="0xabc"
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
    );

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() => expect(screen.getByText(/Signed up/)).toBeInTheDocument());
    expect(signupToMaciMock).toHaveBeenCalledWith("0xabc");
    expect(joinMock).toHaveBeenCalledWith("0xabc");
  });

  it("still succeeds cleanly, with no error shown, when the backend join fails with 'already a member' after a successful on-chain signup", async () => {
    signupToMaciMock.mockResolvedValue(undefined);
    joinMock.mockRejectedValue(
      new membershipApi.DuplicateJoinError("Already a member or already have a pending request for this community"),
    );
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress="0xabc"
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
    );

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() => expect(screen.getByText(/Signed up/)).toBeInTheDocument());
    expect(
      screen.queryByText("Already a member or already have a pending request for this community"),
    ).not.toBeInTheDocument();
  });

  // /plan-eng-review (2026-08-23) — the actual reported gap: this catch used to swallow EVERY
  // error unconditionally, including a 401 from an expired/missing session. On-chain signup
  // succeeds independently of backend bookkeeping, so a user could see "Signed up" with zero
  // indication their membership row was never created. Only "already a member" is legitimately
  // silent; everything else — including auth failures — must surface.
  it("surfaces a non-duplicate backend join error (e.g. an expired session) alongside the on-chain success, not silently", async () => {
    signupToMaciMock.mockResolvedValue(undefined);
    joinMock.mockRejectedValue(new Error("Authentication required"));
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress="0xabc"
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
    );

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() => expect(screen.getByText(/Signed up/)).toBeInTheDocument());
    expect(screen.getByText("Authentication required")).toBeInTheDocument();
    // A generic Error (not an HttpError 401) must not trigger a sign-out.
    expect(mockSiwe.signOut).not.toHaveBeenCalled();
  });

  // /plan-eng-review (2026-08-23) -- found during a post-rollout re-verification: this call site
  // was never wrapped in withAuthDetect across any of the 4 batches (it already surfaced errors
  // correctly from the 2026-08-21 fix above, so it wasn't flagged as a "swallowing" landmine --
  // but nobody had actually wired in the sign-out-on-401 behavior the rollout exists to provide).
  it("signs the wallet out when the backend join fails with a real expired session (401)", async () => {
    signupToMaciMock.mockResolvedValue(undefined);
    joinMock.mockRejectedValue(new HttpError(401, "Authentication required. Please sign in with Ethereum."));
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress="0xabc"
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
    );

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(mockSiwe.signOut).toHaveBeenCalledTimes(1);
  });

  it("shows the joined state (not an enabled Join button) when already registered on-chain, e.g. after a remount", async () => {
    maciKeypairMock = { publicKey: { hash: () => "hash123" } };
    getStateIndexMock.mockResolvedValue(1n);
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress="0xabc"
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
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
      <JoinSection
        communityId="0xabc"
        contractAddress="0xabc"
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
    );

    await waitFor(() => expect(screen.getByText(/Signed up/)).toBeInTheDocument());
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows a Join button when the on-chain state index is 0 (not yet registered)", async () => {
    maciKeypairMock = { publicKey: { hash: () => "hash123" } };
    getStateIndexMock.mockResolvedValue(0n);
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress="0xabc"
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
    );

    await waitFor(() => expect(getStateIndexMock).toHaveBeenCalled());
    expect(screen.getByText("Join")).toBeInTheDocument();
  });

  // Create-community wizard fix (2026-08-21): a governance-less community must still be
  // joinable — this used to hide the Join button entirely behind a "not yet configured" message,
  // blocking every non-creator from ever joining an ungoverned community (the reported bug).
  it("shows a Join button (not just a not-configured message) when governance isn't set up yet", () => {
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress={null}
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
    );
    expect(screen.getByText(/Governance not yet configured/)).toBeInTheDocument();
    expect(screen.getByText("Join")).toBeInTheDocument();
  });

  // Bug fix (2026-08-28) — allowJoin was fetched by the parent but never threaded down, so this
  // used to say "you can still join" and render a clickable Join button even when the community
  // had joining disabled; only a click (which then round-tripped to the backend's
  // JoinNotAllowedError) revealed the truth. Now proactive.
  it("shows a not-accepting-members message instead of a Join button when allowJoin is false, ungoverned community", () => {
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress={null}
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
        allowJoin={false}
      />,
    );
    expect(
      screen.getByText("Eligibility, Governance and Join not yet configured for this community."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/but you can still join/)).not.toBeInTheDocument();
    expect(screen.queryByText("Join")).not.toBeInTheDocument();
  });

  it("still shows an existing member's own status when allowJoin is false, ungoverned community", async () => {
    getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Regular" });
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress={null}
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
        allowJoin={false}
      />,
    );
    await waitFor(() => expect(screen.getByText(/You're a member/)).toBeInTheDocument());
  });

  it("joins via the backend only (no on-chain signup attempted) when governance isn't configured", async () => {
    joinMock.mockResolvedValue({ status: "approved", tierLabel: "Regular" });
    getMembershipStatusMock
      .mockResolvedValueOnce({ status: "none" })
      .mockResolvedValueOnce({ status: "member", tierLabel: "Regular" });
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress={null}
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
    );

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() => expect(screen.getByText(/You're a member/)).toBeInTheDocument());
    expect(joinMock).toHaveBeenCalledWith("0xabc");
    expect(signupToMaciMock).not.toHaveBeenCalled();
  });

  it("shows 'pending admin review' instead of a Join button when a request is already pending, ungoverned community", async () => {
    getMembershipStatusMock.mockResolvedValue({ status: "pending" });
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress={null}
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
    );
    await waitFor(() => expect(screen.getByText(/pending admin review/)).toBeInTheDocument());
    expect(screen.queryByText("Join")).not.toBeInTheDocument();
  });

  // Bug fix (2026-08-28) — a requester waiting on approval previously only saw it reflected after
  // a manual reload; membershipStatus now polls every 15s while pending, and stops once resolved.
  it("polls membershipStatus while a request is pending, and stops polling once it's approved", async () => {
    vi.useFakeTimers();
    try {
      getMembershipStatusMock.mockResolvedValue({ status: "pending" });
      renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress={null}
          connected={true}
          status="connected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );
      await vi.waitFor(() => expect(getMembershipStatusMock).toHaveBeenCalledTimes(1));

      getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Regular" });
      await vi.advanceTimersByTimeAsync(15_000);
      await vi.waitFor(() => expect(getMembershipStatusMock).toHaveBeenCalledTimes(2));

      const callsAfterResolved = getMembershipStatusMock.mock.calls.length;
      await vi.advanceTimersByTimeAsync(30_000);
      expect(getMembershipStatusMock).toHaveBeenCalledTimes(callsAfterResolved);
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows a join error inline when the backend join call fails, ungoverned community", async () => {
    joinMock.mockRejectedValue(new Error("Does not meet this community's eligibility requirements"));
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress={null}
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
    );

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() =>
      expect(screen.getByText("Does not meet this community's eligibility requirements")).toBeInTheDocument(),
    );
    expect(mockSiwe.signOut).not.toHaveBeenCalled();
  });

  // /plan-eng-review (2026-08-23) -- same post-rollout miss as handleJoin's own 401 test above,
  // for the ungoverned/backend-only join path.
  it("signs the wallet out when the ungoverned backend-only join fails with an expired session (401)", async () => {
    joinMock.mockRejectedValue(new HttpError(401, "Authentication required. Please sign in with Ethereum."));
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress={null}
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
    );

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() =>
      expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
    );
    expect(mockSiwe.signOut).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when the on-chain signup fails", async () => {
    signupToMaciMock.mockRejectedValue(new Error("Wallet not connected"));
    renderWithProviders(
      <JoinSection
        communityId="0xabc"
        contractAddress="0xabc"
        connected={true}
        status="connected"
        rpcUrl="http://localhost:8545"
        isCreator={false}
      />,
    );

    fireEvent.click(screen.getByText("Join"));

    await waitFor(() => expect(screen.getByText("Wallet not connected")).toBeInTheDocument());
    expect(joinMock).not.toHaveBeenCalled();
  });

  // Investigation fix (2026-08-21) — the actual reported bug: a connected wallet with no SIWE
  // session could see the "Join" button, click it, and hit a bare "Authentication required" from
  // the backend with no way to recover, because this page never established (or offered to
  // establish) a SIWE session itself. Gating the ungoverned join button behind SiweGate fixes the
  // dead-end: an unauthenticated click now surfaces a real "Sign in with Ethereum" affordance
  // instead of silently failing.
  // /plan-eng-review Phase B (2026-08-23) — the actual reported gap: this governed-community
  // Join button used to be completely ungated, unlike its ungoverned sibling above, even though
  // handleJoin's backend half (membershipApi.join()) needs a SIWE session too.
  describe("governed join — SIWE gating", () => {
    it("shows a 'Sign in with Ethereum' prompt instead of the Join button when not yet SIWE-authenticated", () => {
      mockSiwe.isAuthenticated = false;
      renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress="0xabc"
          connected={true}
          status="connected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );

      expect(screen.getByText("Sign in to join this community")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in with ethereum/i })).toBeInTheDocument();
      expect(screen.queryByText("Join")).not.toBeInTheDocument();
    });

    it("establishing a SIWE session reveals the real Join button, which then signs up on-chain", async () => {
      mockSiwe.isAuthenticated = false;
      signupToMaciMock.mockResolvedValue(undefined);
      joinMock.mockResolvedValue({ status: "approved", tierLabel: "Regular" });
      const { rerender } = renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress="0xabc"
          connected={true}
          status="connected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));
      mockSiwe.isAuthenticated = true;

      rerender(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <MemoryRouter>
            <JoinSection
              communityId="0xabc"
              contractAddress="0xabc"
              connected={true}
              status="connected"
              rpcUrl="http://localhost:8545"
              isCreator={false}
            />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const joinButton = await screen.findByRole("button", { name: "Join" });
      fireEvent.click(joinButton);
      await waitFor(() => expect(signupToMaciMock).toHaveBeenCalledWith("0xabc"));
    });
  });

  describe("ungoverned join — SIWE gating", () => {
    it("shows a 'Sign in with Ethereum' prompt instead of the Join button when not yet SIWE-authenticated", () => {
      mockSiwe.isAuthenticated = false;
      renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress={null}
          connected={true}
          status="connected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );

      expect(screen.getByText("Sign in to join this community")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in with ethereum/i })).toBeInTheDocument();
      expect(screen.queryByText("Join")).not.toBeInTheDocument();
    });

    it("establishing a SIWE session reveals the real Join button, which then joins successfully", async () => {
      mockSiwe.isAuthenticated = false;
      mockSiwe.signIn.mockImplementation(async () => {
        mockSiwe.isAuthenticated = true;
      });
      joinMock.mockResolvedValue({ status: "approved", tierLabel: "Regular" });
      const { rerender } = renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress={null}
          connected={true}
          status="connected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));
      await waitFor(() => expect(mockSiwe.signIn).toHaveBeenCalledTimes(1));

      rerender(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <MemoryRouter>
            <JoinSection
              communityId="0xabc"
              contractAddress={null}
              connected={true}
              status="connected"
              rpcUrl="http://localhost:8545"
              isCreator={false}
            />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const joinButton = await screen.findByRole("button", { name: "Join" });
      fireEvent.click(joinButton);
      await waitFor(() => expect(joinMock).toHaveBeenCalledWith("0xabc"));
    });
  });

  // formalize-communities epic, Child F (/plan-eng-review 2026-08-25) — Leave is scoped to fully
  // ungoverned communities only (contractAddress === null), members only, and never the creator
  // (D1) — the backend enforces all three; this is the matching client-side visibility.
  describe("Leave community", () => {
    it("does not show a Leave option when governance is configured (contractAddress set)", async () => {
      maciKeypairMock = { publicKey: { hash: () => "hash123" } };
      getStateIndexMock.mockResolvedValue(1n);
      renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress="0xabc"
          connected={true}
          status="connected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );
      await waitFor(() => expect(screen.getByText(/Signed up/)).toBeInTheDocument());
      expect(screen.queryByText("Leave community")).not.toBeInTheDocument();
    });

    it("does not show a Leave option for a non-member", () => {
      renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress={null}
          connected={true}
          status="connected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );
      expect(screen.queryByText("Leave community")).not.toBeInTheDocument();
    });

    it("does not show a Leave option for the community's creator, even though they're a member (D1)", async () => {
      getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Regular" });
      renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress={null}
          connected={true}
          status="connected"
          rpcUrl="http://localhost:8545"
          isCreator={true}
        />,
      );
      await waitFor(() => expect(screen.getByText(/You're a member/)).toBeInTheDocument());
      expect(screen.queryByText("Leave community")).not.toBeInTheDocument();
    });

    it("shows a Leave option for a non-creator member of an ungoverned community", async () => {
      getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Regular" });
      renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress={null}
          connected={true}
          status="connected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );
      await waitFor(() => expect(screen.getByText("Leave community")).toBeInTheDocument());
    });

    it("shows an inline confirm (not a browser confirm) before leaving, and cancel dismisses it", async () => {
      getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Regular" });
      renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress={null}
          connected={true}
          status="connected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );
      fireEvent.click(await screen.findByText("Leave community"));

      expect(screen.getByText("Leave this community?")).toBeInTheDocument();
      expect(leaveMock).not.toHaveBeenCalled();

      fireEvent.click(screen.getByText("Never mind"));
      expect(screen.queryByText("Leave this community?")).not.toBeInTheDocument();
      expect(screen.getByText("Leave community")).toBeInTheDocument();
    });

    it("leaves successfully on confirm, reverting to the Join button", async () => {
      leaveMock.mockResolvedValue(undefined);
      getMembershipStatusMock
        .mockResolvedValueOnce({ status: "member", tierLabel: "Regular" })
        .mockResolvedValueOnce({ status: "none" });
      renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress={null}
          connected={true}
          status="connected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );
      fireEvent.click(await screen.findByText("Leave community"));
      fireEvent.click(screen.getByText("Confirm"));

      await waitFor(() => expect(leaveMock).toHaveBeenCalledWith("0xabc"));
      await waitFor(() => expect(screen.getByText("Join")).toBeInTheDocument());
    });

    it("shows an error inline, without signing out, when leave fails with a non-auth error", async () => {
      getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Regular" });
      leaveMock.mockRejectedValue(new Error("Not a member of this community"));
      renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress={null}
          connected={true}
          status="connected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );
      fireEvent.click(await screen.findByText("Leave community"));
      fireEvent.click(screen.getByText("Confirm"));

      await waitFor(() => expect(screen.getByText("Not a member of this community")).toBeInTheDocument());
      expect(mockSiwe.signOut).not.toHaveBeenCalled();
    });

    it("signs out when leave fails with an expired session (401)", async () => {
      getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Regular" });
      leaveMock.mockRejectedValue(new HttpError(401, "Authentication required. Please sign in with Ethereum."));
      renderWithProviders(
        <JoinSection
          communityId="0xabc"
          contractAddress={null}
          connected={true}
          status="connected"
          rpcUrl="http://localhost:8545"
          isCreator={false}
        />,
      );
      fireEvent.click(await screen.findByText("Leave community"));
      fireEvent.click(screen.getByText("Confirm"));

      await waitFor(() =>
        expect(screen.getByText("Authentication required. Please sign in with Ethereum.")).toBeInTheDocument(),
      );
      expect(mockSiwe.signOut).toHaveBeenCalledTimes(1);
    });
  });
});
