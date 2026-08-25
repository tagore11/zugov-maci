import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./page";

vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  return {
    ...actual,
    useAccount: () => ({ address: undefined, status: "disconnected" }),
    useConnect: () => ({ connectors: [], connect: vi.fn(), isPending: false, error: null }),
    useDisconnect: () => ({ disconnect: vi.fn() }),
  };
});

vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ isAuthenticated: false, isSigning: false, error: null, signIn: vi.fn(), signOut: vi.fn() }),
}));

// AuthModal transitively imports @pcd/pod (via useCredentialScan), which fails to load under
// Vitest's Node ESM loader with a CJS/ESM named-export interop error on blakejs — unrelated to
// this test's concern (fetch sequencing), matches the same workaround already used for
// @pcd/zuauth elsewhere (see tests/membership.test.ts on the backend).
vi.mock("@/app/components/AuthModal", () => ({
  AuthModal: () => null,
}));

const listMock = vi.fn();
const listCategoriesMock = vi.fn();
const listAllUnionsMock = vi.fn();

vi.mock("@/src/services/communityApi", async () => {
  const actual = await vi.importActual<typeof import("@/src/services/communityApi")>("@/src/services/communityApi");
  return {
    ...actual,
    list: (...args: unknown[]) => listMock(...args),
    listCategories: (...args: unknown[]) => listCategoriesMock(...args),
    listAllUnions: (...args: unknown[]) => listAllUnionsMock(...args),
  };
});

function renderHome() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  listMock.mockReset();
  listCategoriesMock.mockReset();
  listAllUnionsMock.mockReset();
  listMock.mockResolvedValue({ communities: [], total: 0, hasMore: false });
  listAllUnionsMock.mockResolvedValue({ unions: [] });
});

// Ship-time coverage audit finding, 2026-08-25 — fetchCommunities was a useCallback depending
// on categoryLabels (derived from the new GET /api/categories query). categoryLabels started
// as {} on mount and got a new object reference once categories resolved, giving
// fetchCommunities a new identity and re-firing the useEffect([fetchCommunities]) that calls
// it — a real double-fetch of page 1 on every landing-page load. Fixed by gating the initial
// fetch on the categories query having settled first.
describe("Home (landing page) — categories/communities fetch sequencing", () => {
  it("fetches communities exactly once, even after the categories query resolves after mount", async () => {
    // Categories resolve on a later tick than the initial render, matching the real race this
    // bug depended on (both queries fire in parallel on mount; the failure mode requires
    // categories to settle strictly after the first render, not before).
    listCategoriesMock.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([{ id: "residency", label: "Residency" }]), 10)),
    );

    renderHome();

    await waitFor(() => expect(listMock).toHaveBeenCalled());
    // Give the categories promise time to resolve and any (buggy) re-fetch effect time to fire.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(listMock).toHaveBeenCalledTimes(1);
    expect(listAllUnionsMock).toHaveBeenCalledTimes(1);
  });

  it("still fetches communities exactly once when categories are already cached (staleTime: Infinity, warm cache)", async () => {
    listCategoriesMock.mockResolvedValue([{ id: "residency", label: "Residency" }]);

    renderHome();

    await waitFor(() => expect(listMock).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(listMock).toHaveBeenCalledTimes(1);
  });
});
