import { promises as fs } from "node:fs";
import path from "node:path";
import type { GroundingReport, Id, MechanismId, Option, PreferenceVector } from "./core/types";

/**
 * File-backed store. Deliberately boring: one JSON file, no service to run, no
 * account to create. The MVP has to be clonable and usable in one command, and
 * swapping this for Postgres later touches only this file.
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
}

interface Database {
  decisions: Decision[];
}

const DATA_DIR = process.env.ZUGOV_DATA_DIR ?? path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "decisions.json");

async function read(): Promise<Database> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Database;
  } catch {
    return { decisions: [] };
  }
}

async function write(db: Database): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

export async function listDecisions(communityId?: Id): Promise<Decision[]> {
  const db = await read();
  return db.decisions
    .filter((decision) => (communityId ? decision.communityId === communityId : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getDecision(id: Id): Promise<Decision | null> {
  const db = await read();
  return db.decisions.find((d) => d.id === id) ?? null;
}

export async function saveDecision(decision: Decision): Promise<Decision> {
  const db = await read();
  const index = db.decisions.findIndex((d) => d.id === decision.id);
  if (index >= 0) db.decisions[index] = decision;
  else db.decisions.push(decision);
  await write(db);
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
