/**
 * Refuses to run the suite against a database that is not a test database.
 *
 * Every test file here clears shared tables in its own beforeEach and afterAll,
 * against whatever DATABASE_URL points at. That is a reasonable design for a
 * throwaway database and a data-loss incident for any other one. LOCAL_DEV.md
 * hands developers a single zugov_dev database for both running the app and
 * running the tests, so the first `pnpm test` silently wipes the seed data the
 * same document told them to create. The same command with a staging URL
 * exported in the shell would wipe staging, with nothing to stop it.
 *
 * The rule: the database name must look like a test database. Anything else has
 * to be opted into explicitly, per run, by someone who has read this.
 */

const ALLOWED_NAME = /(^|[_-])test(s)?$/i;
const OVERRIDE = "ZUGOV_ALLOW_DESTRUCTIVE_TESTS";

export function assertTestDatabase(source: NodeJS.ProcessEnv = process.env): void {
  const url = source.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not set. The test suite needs a throwaway Postgres database.");
  }

  if (source[OVERRIDE] === "1") return;

  let name: string;
  try {
    name = new URL(url).pathname.replace(/^\//, "");
  } catch {
    throw new Error(`DATABASE_URL is not a valid URL: ${url}`);
  }

  if (ALLOWED_NAME.test(name)) return;

  throw new Error(
    [
      "",
      `Refusing to run the test suite against the database "${name}".`,
      "",
      "These tests clear shared tables. Every row in that database would be lost.",
      "Point DATABASE_URL at a database whose name ends in _test:",
      "",
      "  createdb zugov_test",
      '  DATABASE_URL="postgres://user@localhost:5432/zugov_test" pnpm exec drizzle-kit migrate',
      '  DATABASE_URL="postgres://user@localhost:5432/zugov_test" pnpm test',
      "",
      `If the destruction is intended, set ${OVERRIDE}=1 for the run.`,
      "",
    ].join("\n"),
  );
}

assertTestDatabase();
