import { Pool } from "pg";
import os from "node:os";

/**
 * The Postgres connection decisions live in now.
 *
 * Same DATABASE_URL convention apps/zugov-backend uses, same physical database
 * by default (zugov_dev): identity and membership already come from there over
 * HTTP, and a decision without a subject worth deciding on is not a decision,
 * so putting decisions in a second store was the thing DEVAM.md called a koku.
 * Defaults to this machine's local zugov_dev so `npm run dev` keeps working
 * with zero setup beyond what LOCAL_DEV.md already has a person do for the
 * backend; set DATABASE_URL to point anywhere else.
 */
const connectionString = process.env.DATABASE_URL?.trim() || `postgres://${os.userInfo().username}@localhost:5432/zugov_dev`;

export const pool = new Pool({ connectionString });

let ready: Promise<void> | null = null;

/** Idempotent, run once per process. No separate migration tool for one table. */
export function ensureSchema(): Promise<void> {
  ready ??= pool.query(`
    CREATE TABLE IF NOT EXISTS mvp_decisions (
      id text PRIMARY KEY,
      community_id text NOT NULL,
      title text NOT NULL,
      body text NOT NULL,
      options jsonb NOT NULL,
      mechanism_id text NOT NULL,
      created_at text NOT NULL,
      closes_at text,
      grounding jsonb,
      preferences jsonb NOT NULL DEFAULT '[]'::jsonb,
      salt text NOT NULL
    );
    CREATE INDEX IF NOT EXISTS mvp_decisions_community_id_idx ON mvp_decisions (community_id);
  `).then(() => undefined);
  return ready;
}
