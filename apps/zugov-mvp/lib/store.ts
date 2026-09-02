import { randomBytes } from "node:crypto";
import { pool, ensureSchema } from "./db";
import type { GroundingReport, Id, MechanismId, Option, PreferenceVector } from "./core/types";

/**
 * Postgres-backed store, same shape as the file-backed one it replaced.
 *
 * The exported functions are unchanged from the original JSON version on
 * purpose: every route and page in this app calls listDecisions, getDecision,
 * saveDecision, upsertPreference, newId, newSalt and nothing else, so swapping
 * the file for a database touches only this file, exactly as the README said
 * it would.
 */

export interface Decision {
  id: Id;
  /** The community this decision belongs to, from the governance backend. */
  communityId: Id;
  title: string;
  body: string;
  options: Option[];
  mechanismId: MechanismId;
  createdAt: string;
  closesAt: string | null;
  grounding: GroundingReport | null;
  preferences: PreferenceVector[];
  /**
   * Per-decision salt for the receipt's voter hashes. Generated when the
   * decision is opened, so a hash from one decision cannot be tested against
   * another. Published with the receipt; see lib/core/receipt.ts.
   */
  salt: string;
}

interface Row {
  id: string;
  community_id: string;
  title: string;
  body: string;
  options: Option[];
  mechanism_id: MechanismId;
  created_at: string;
  closes_at: string | null;
  grounding: GroundingReport | null;
  preferences: PreferenceVector[];
  salt: string;
}

function fromRow(row: Row): Decision {
  return {
    id: row.id,
    communityId: row.community_id,
    title: row.title,
    body: row.body,
    options: row.options,
    mechanismId: row.mechanism_id,
    createdAt: row.created_at,
    closesAt: row.closes_at,
    grounding: row.grounding,
    preferences: row.preferences,
    salt: row.salt,
  };
}

export async function listDecisions(communityId?: Id): Promise<Decision[]> {
  await ensureSchema();
  const { rows } = communityId
    ? await pool.query<Row>(
        "SELECT * FROM mvp_decisions WHERE community_id = $1 ORDER BY created_at DESC",
        [communityId],
      )
    : await pool.query<Row>("SELECT * FROM mvp_decisions ORDER BY created_at DESC");
  return rows.map(fromRow);
}

export async function getDecision(id: Id): Promise<Decision | null> {
  await ensureSchema();
  const { rows } = await pool.query<Row>("SELECT * FROM mvp_decisions WHERE id = $1", [id]);
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function saveDecision(decision: Decision): Promise<Decision> {
  await ensureSchema();
  await pool.query(
    `INSERT INTO mvp_decisions
       (id, community_id, title, body, options, mechanism_id, created_at, closes_at, grounding, preferences, salt)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (id) DO UPDATE SET
       community_id = EXCLUDED.community_id,
       title = EXCLUDED.title,
       body = EXCLUDED.body,
       options = EXCLUDED.options,
       mechanism_id = EXCLUDED.mechanism_id,
       created_at = EXCLUDED.created_at,
       closes_at = EXCLUDED.closes_at,
       grounding = EXCLUDED.grounding,
       preferences = EXCLUDED.preferences,
       salt = EXCLUDED.salt`,
    [
      decision.id,
      decision.communityId,
      decision.title,
      decision.body,
      JSON.stringify(decision.options),
      decision.mechanismId,
      decision.createdAt,
      decision.closesAt,
      decision.grounding ? JSON.stringify(decision.grounding) : null,
      JSON.stringify(decision.preferences),
      decision.salt,
    ],
  );
  return decision;
}

export async function upsertPreference(decisionId: Id, vector: PreferenceVector): Promise<Decision> {
  const decision = await getDecision(decisionId);
  if (!decision) throw new Error(`Karar bulunamadı: ${decisionId}`);
  const index = decision.preferences.findIndex((p) => p.subjectId === vector.subjectId);
  if (index >= 0) decision.preferences[index] = vector;
  else decision.preferences.push(vector);
  return saveDecision(decision);
}

export function newId(prefix: string): Id {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function newSalt(): string {
  return randomBytes(16).toString("hex");
}
