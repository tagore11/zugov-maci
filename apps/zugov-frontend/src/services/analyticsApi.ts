import { parseErrorOr } from "@/src/services/httpClient";

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

/**
 * Counts the backend can actually derive from the database.
 *
 * Participation rate and period-over-period trends are deliberately not here.
 * Both need vote records joined against an eligible-voter set, and MACI ballots
 * are on-chain and unreadable from this database. The page used to display them
 * anyway, as constants.
 */
export interface AnalyticsSummary {
  communities: number;
  members: number;
  proposals: number;
  formalizedProposals: number;
  events: number;
  activeUnionMemberships: number;
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const res = await fetch(`${BASE_URL}/api/analytics`);
  if (!res.ok) return parseErrorOr<AnalyticsSummary>(res, "Failed to load analytics");
  return (await res.json()) as AnalyticsSummary;
}
