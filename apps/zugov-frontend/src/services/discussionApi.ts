import { parseErrorOr } from "@/src/services/httpClient";

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

export interface Discussion {
  id: string;
  communityId: string;
  authorAddress: string;
  title: string;
  body: string;
  /** null = unrestricted, visible to every member (formalize-communities epic, Child J, D1/D5). */
  eligibleTierIds: string[] | null;
  createdAt: number;
}

export interface CreateDiscussionInput {
  title: string;
  body: string;
  /** Omit or null for unrestricted (default). */
  eligibleTierIds?: string[] | null;
}

export interface UpdateDiscussionInput {
  title?: string;
  body?: string;
  eligibleTierIds?: string[] | null;
}

// formalize-communities epic, Child J (/plan-eng-review 2026-08-26) — every call here uses
// credentials: "include" from the start, including the GETs. Child I's outside-voice review found
// eventApi.ts's GETs were missing this, which would silently break viewer-aware gating cross-origin
// in production (FE/BE are different origins) — the entire feature would look like it works in
// same-origin local dev and then silently do nothing once deployed. Discussions are members-only
// (D5), so this matters even more here than it did for events' optional viewer identity.

export async function createDiscussion(communityId: string, input: CreateDiscussionInput): Promise<Discussion> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/discussions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await parseErrorOr<{ discussion: Discussion }>(res, `Failed to create discussion: ${res.status}`);
  return data.discussion;
}

export async function listDiscussions(communityId: string): Promise<Discussion[]> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/discussions`, { credentials: "include" });
  const data = await parseErrorOr<{ discussions: Discussion[] }>(res, `Failed to fetch discussions: ${res.status}`);
  return data.discussions;
}

export async function getDiscussion(communityId: string, discussionId: string): Promise<Discussion> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/discussions/${discussionId}`, {
    credentials: "include",
  });
  const data = await parseErrorOr<{ discussion: Discussion }>(res, `Failed to fetch discussion: ${res.status}`);
  return data.discussion;
}

export async function updateDiscussion(
  communityId: string,
  discussionId: string,
  patch: UpdateDiscussionInput,
): Promise<Discussion> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/discussions/${discussionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(patch),
  });
  const data = await parseErrorOr<{ discussion: Discussion }>(res, `Failed to update discussion: ${res.status}`);
  return data.discussion;
}

export async function deleteDiscussion(communityId: string, discussionId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/communities/${communityId}/discussions/${discussionId}`, {
    method: "DELETE",
    credentials: "include",
  });
  await parseErrorOr<{ success: boolean }>(res, `Failed to delete discussion: ${res.status}`);
}
