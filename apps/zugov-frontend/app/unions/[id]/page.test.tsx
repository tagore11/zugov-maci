import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UnionDetailPage from "./page";
import type { GetUnionResponse } from "@/src/services/communityApi";

const getUnionMock = vi.fn();
const inviteToUnionMock = vi.fn();
const respondToUnionInviteMock = vi.fn();
const leaveUnionMock = vi.fn();

vi.mock("@/src/services/communityApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
  return {
    ...actual,
    getUnion: (...args: unknown[]) => getUnionMock(...args),
    inviteToUnion: (...args: unknown[]) => inviteToUnionMock(...args),
    respondToUnionInvite: (...args: unknown[]) => respondToUnionInviteMock(...args),
    leaveUnion: (...args: unknown[]) => leaveUnionMock(...args),
  };
});

const mockSignOut = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ signOut: mockSignOut }),
}));

// Header -> WalletConnectButton calls useAccount()/useConnect()/useDisconnect() directly.
vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  return {
    ...actual,
    useAccount: () => ({ address: undefined, status: "disconnected" }),
    useConnect: () => ({ connectors: [], connect: vi.fn(), isPending: false, error: null }),
    useDisconnect: () => ({ disconnect: vi.fn() }),
  };
});

function baseUnion(overrides: Partial<GetUnionResponse> = {}): GetUnionResponse {
  return {
    union: {
      id: "union-1",
      displayName: "Alliance",
      description: null,
      logo: null,
      creatorAddress: "0xabc",
      createdAt: 0,
    },
    members: [],
    myActiveCommunityIds: [],
    myPendingCommunityIds: [],
    ...overrides,
  };
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/unions/union-1"]}>
        <Routes>
          <Route path="/unions/:id" element={<UnionDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getUnionMock.mockReset();
  inviteToUnionMock.mockReset();
  respondToUnionInviteMock.mockReset();
  leaveUnionMock.mockReset();
  mockSignOut.mockReset();
});

// community page redesign (/plan-eng-review 2026-08-26) — this page previously had zero test
// coverage of any kind; closing that gap directly as part of adding Your Actions.
describe("UnionDetailPage", () => {
  it("shows a not-found state for a nonexistent union", async () => {
    getUnionMock.mockResolvedValue(null);
    renderPage();

    await waitFor(() => expect(screen.getByText("Union not found.")).toBeInTheDocument());
  });

  it("renders identity and member communities with no Your Actions section for a non-participant", async () => {
    getUnionMock.mockResolvedValue(
      baseUnion({
        members: [{ communityId: "c1", displayName: "Founder Co", logo: null, status: "active" }],
      }),
    );
    renderPage();

    await screen.findByText("Alliance");
    expect(screen.getByText("Founder Co")).toBeInTheDocument();
    expect(screen.queryByText("Invite a community")).not.toBeInTheDocument();
    expect(screen.queryByText("Leave union")).not.toBeInTheDocument();
    expect(screen.queryByText("Accept")).not.toBeInTheDocument();
  });

  it("shows Invite/Leave directly for a single active match, no picker", async () => {
    getUnionMock.mockResolvedValue(
      baseUnion({
        members: [{ communityId: "c1", displayName: "My Community", logo: null, status: "active" }],
        myActiveCommunityIds: ["c1"],
      }),
    );
    renderPage();

    await screen.findByText("Invite a community");
    expect(screen.getByText("Leave union")).toBeInTheDocument();
    expect(screen.queryByText("Acting as")).not.toBeInTheDocument();
  });

  it("shows Accept/Decline directly for a single pending match, no picker", async () => {
    getUnionMock.mockResolvedValue(
      baseUnion({
        members: [{ communityId: "c1", displayName: "Invited Co", logo: null, status: "pending" }],
        myPendingCommunityIds: ["c1"],
      }),
    );
    renderPage();

    await screen.findByText("Accept");
    expect(screen.getByText("Decline")).toBeInTheDocument();
    expect(screen.queryByText("Responding as")).not.toBeInTheDocument();
  });

  it("shows a picker when multiple active communities match, and switches acting community", async () => {
    getUnionMock.mockResolvedValue(
      baseUnion({
        members: [
          { communityId: "c1", displayName: "Community One", logo: null, status: "active" },
          { communityId: "c2", displayName: "Community Two", logo: null, status: "active" },
        ],
        myActiveCommunityIds: ["c1", "c2"],
      }),
    );
    renderPage();

    await screen.findByText("Acting as");
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("c1");
    expect(screen.getByText("Your community: Community One")).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "c2" } });
    expect(screen.getByText("Your community: Community Two")).toBeInTheDocument();
  });

  it("shows both active and pending action sections simultaneously with independent pickers", async () => {
    getUnionMock.mockResolvedValue(
      baseUnion({
        members: [
          { communityId: "c1", displayName: "Active Co", logo: null, status: "active" },
          { communityId: "c2", displayName: "Pending Co", logo: null, status: "pending" },
        ],
        myActiveCommunityIds: ["c1"],
        myPendingCommunityIds: ["c2"],
      }),
    );
    renderPage();

    await screen.findByText("Invite a community");
    expect(screen.getByText("Accept")).toBeInTheDocument();
    expect(screen.getByText("Decline")).toBeInTheDocument();
  });

  it("clicking Leave calls leaveUnion with the acting community id", async () => {
    getUnionMock.mockResolvedValueOnce(
      baseUnion({
        members: [{ communityId: "c1", displayName: "My Community", logo: null, status: "active" }],
        myActiveCommunityIds: ["c1"],
      }),
    );
    leaveUnionMock.mockResolvedValue(undefined);
    renderPage();

    await screen.findByText("Leave union");
    getUnionMock.mockResolvedValueOnce(baseUnion());
    fireEvent.click(screen.getByText("Leave union"));

    await waitFor(() => expect(leaveUnionMock).toHaveBeenCalledWith("union-1", { communityId: "c1" }));
  });

  it("clicking Accept calls respondToUnionInvite with the pending acting community id", async () => {
    getUnionMock.mockResolvedValue(
      baseUnion({
        members: [{ communityId: "c1", displayName: "Invited Co", logo: null, status: "pending" }],
        myPendingCommunityIds: ["c1"],
      }),
    );
    respondToUnionInviteMock.mockResolvedValue(undefined);
    renderPage();

    fireEvent.click(await screen.findByText("Accept"));

    await waitFor(() =>
      expect(respondToUnionInviteMock).toHaveBeenCalledWith("union-1", { communityId: "c1", accept: true }),
    );
  });

  it("shows pending invites section only alongside active members, unaffected by Your Actions", async () => {
    getUnionMock.mockResolvedValue(
      baseUnion({
        members: [
          { communityId: "c1", displayName: "Active Co", logo: null, status: "active" },
          { communityId: "c2", displayName: "Other Pending Co", logo: null, status: "pending" },
        ],
      }),
    );
    renderPage();

    await screen.findByText("Active Co");
    expect(screen.getByText("Pending invites")).toBeInTheDocument();
    expect(screen.getByText("Other Pending Co")).toBeInTheDocument();
  });
});
