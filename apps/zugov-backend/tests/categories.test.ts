import { describe, it, expect, vi } from "vitest";

process.env.CORS_ORIGIN ??= "http://localhost:5173"; // pre-existing bug, see specs/003 research.md

// Real @pcd/zuauth fails to load under Vitest's Node ESM loader (see tests/membership.test.ts) —
// importing `app` pulls in routes/credentials.ts -> zupassAdapter.ts -> @pcd/zuauth transitively.
vi.mock("@pcd/zuauth", () => ({
  default: {
    authenticate: vi.fn(),
    ETHBERLIN04: [],
  },
}));

const { app } = await import("../src/app.js");

// Categories are seeded once by the migration that introduces the table (Child C1,
// /plan-eng-review 2026-08-24), not per-test — this endpoint has no auth requirement, matching
// the existing GET /api/communities convention for public reads.
describe("GET /api/categories", () => {
  it("returns the 6 seeded category values as {id, label} pairs", async () => {
    const res = await app.request("/api/categories");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { categories: { id: string; label: string }[] };
    const ids = body.categories.map((c) => c.id).sort();
    expect(ids).toEqual(["dao", "network_state", "pop_up_city", "regional", "residency", "social"]);
    expect(body.categories.find((c) => c.id === "pop_up_city")?.label).toBe("Pop-up City");
  });
});
