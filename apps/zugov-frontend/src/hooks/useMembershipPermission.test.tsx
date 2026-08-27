import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useIsCommunityAdmin } from "./useMembershipPermission";

// New (community page redesign, /plan-eng-review 2026-08-26, D7) — this hook previously had zero
// unit test coverage of its own. The only test that ever exercised its canManageMembership-tier
// resolution was settings/page.test.tsx's "grants access to a non-creator wallet with a
// canManageMembership tier" case, driven through settings/page.tsx's own hand-rolled duplicate of
// this exact logic. That duplicate is deleted as part of the community-page redesign's settings
// dedup — this file closes the gap directly on the hook instead of losing the coverage.
const getMembershipStatusMock = vi.fn();
const getTiersMock = vi.fn();
vi.mock("@/src/services/membershipApi", () => ({
  getMembershipStatus: (...args: unknown[]) => getMembershipStatusMock(...args),
  getTiers: (...args: unknown[]) => getTiersMock(...args),
}));

const ADMIN_TIER = {
  id: "tier-admin",
  label: "Admin",
  canCreateProposals: true,
  canVote: true,
  canManageMembership: true,
  isDefault: false,
  canCreateEvents: true,
};
const REGULAR_TIER = { ...ADMIN_TIER, id: "tier-regular", label: "Regular", canManageMembership: false };

beforeEach(() => {
  getMembershipStatusMock.mockReset();
  getTiersMock.mockReset();
});

function renderIsCommunityAdmin(communityId: string, connected: boolean) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderHook(() => useIsCommunityAdmin(communityId, connected), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  });
}

describe("useIsCommunityAdmin", () => {
  it("returns false without firing any query when disconnected", () => {
    const { result } = renderIsCommunityAdmin("community-1", false);

    expect(result.current).toBe(false);
    expect(getMembershipStatusMock).not.toHaveBeenCalled();
    expect(getTiersMock).not.toHaveBeenCalled();
  });

  it("returns false for a non-member wallet", async () => {
    getMembershipStatusMock.mockResolvedValue({ status: "none" });
    getTiersMock.mockResolvedValue([ADMIN_TIER]);

    const { result } = renderIsCommunityAdmin("community-1", true);

    await waitFor(() => expect(getMembershipStatusMock).toHaveBeenCalled());
    expect(result.current).toBe(false);
  });

  it("returns false for a member whose tier lacks canManageMembership", async () => {
    getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Regular" });
    getTiersMock.mockResolvedValue([REGULAR_TIER]);

    const { result } = renderIsCommunityAdmin("community-1", true);

    await waitFor(() => expect(result.current).toBe(false));
  });

  // The exact scenario settings/page.test.tsx used to cover via its own hand-rolled duplicate —
  // now tested directly on the hook every consumer (CommunityLayout, settings, ProposalsList)
  // actually shares.
  it("returns true for a member whose tier grants canManageMembership", async () => {
    getMembershipStatusMock.mockResolvedValue({ status: "member", tierLabel: "Admin" });
    getTiersMock.mockResolvedValue([ADMIN_TIER]);

    const { result } = renderIsCommunityAdmin("community-1", true);

    await waitFor(() => expect(result.current).toBe(true));
  });
});
