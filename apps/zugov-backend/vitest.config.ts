import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Runs before anything imports the db client. See tests/setup/guardDatabase.ts:
    // this suite deletes rows, so it refuses to start against a database that is
    // not named like a test database.
    setupFiles: ["tests/setup/guardDatabase.ts"],
    include: ["tests/**/*.test.ts"],
    globals: true,
    // All test files share one real Postgres DB with no per-file schema isolation; each file's
    // own beforeEach/afterAll clears shared tables, so files must not race each other.
    fileParallelism: false,
    // Real DB + real SIWE signature recovery per request means several multi-request tests
    // already run 4-6s — close enough to the 5s default that DB-backed sessions (one extra
    // round-trip per authenticated request) tips some over into flaky timeouts.
    testTimeout: 10000,
  },
});
