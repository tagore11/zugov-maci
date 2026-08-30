/**
 * Environment validation, in one place, failing loudly.
 *
 * Both DATABASE_URL and CORS_ORIGIN used to be read with a non-null assertion at
 * the point of use. A missing CORS_ORIGIN did not report a missing CORS_ORIGIN;
 * it threw `Cannot read properties of undefined (reading 'split')` from a line
 * that mentions neither the variable nor how to set it. The assertion told the
 * type checker the value was there and told the operator nothing.
 */

export class MissingEnvironmentError extends Error {
  constructor(missing: string[]) {
    super(
      [
        `Missing required environment variable${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`,
        "",
        "Set them in apps/zugov-backend/.env.local, or inline for a one-off run:",
        "",
        '  DATABASE_URL="postgres://user@localhost:5432/zugov_dev" \\',
        '  CORS_ORIGIN="http://localhost:5173" \\',
        "  pnpm run dev",
        "",
        "CORS_ORIGIN is a comma-separated list of allowed frontend origins.",
        "See LOCAL_DEV.md for the full setup.",
      ].join("\n"),
    );
    this.name = "MissingEnvironmentError";
  }
}

/**
 * Validated per consumer, never all at once.
 *
 * The database client needs DATABASE_URL and has no opinion about CORS. A
 * single all-or-nothing check would make every test that touches the database
 * also have to set an unrelated variable, which is how a validation helper
 * turns into a tax.
 */
export function requireDatabaseUrl(source: NodeJS.ProcessEnv = process.env): string {
  const value = source.DATABASE_URL?.trim();
  if (!value) throw new MissingEnvironmentError(["DATABASE_URL"]);
  return value;
}

export function requireCorsOrigins(source: NodeJS.ProcessEnv = process.env): string[] {
  const raw = source.CORS_ORIGIN?.trim();
  if (!raw) throw new MissingEnvironmentError(["CORS_ORIGIN"]);

  const origins = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (origins.length === 0) throw new MissingEnvironmentError(["CORS_ORIGIN"]);
  return origins;
}

export function readPort(source: NodeJS.ProcessEnv = process.env): number {
  return Number(source.PORT ?? 3001);
}
