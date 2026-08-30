import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Tests never depend on a running model. The local-inference path is
    // exercised with a stubbed fetch; everything else must pass with the
    // endpoint unreachable, which is also how the app behaves for a user who
    // has not installed one.
    env: { ZUGOV_MODEL_URL: "http://127.0.0.1:9/v1" },
  },
});
