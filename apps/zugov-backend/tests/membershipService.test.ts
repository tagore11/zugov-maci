import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testDb, clearCommunities } from "./helpers/testDb.js";
import * as schema from "../src/db/schema.js";
import { listMembersByAddresses } from "../src/services/membershipService.js";

const MEMBER_A = "0x1111111111111111111111111111111111111a";
const MEMBER_B = "0x2222222222222222222222222222222222222b";
const NON_MEMBER = "0x3333333333333333333333333333333333333c";

async function insertCommunity() {
  const id = randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await testDb.insert(schema.communities).values({
    id,
    displayName: "listMembersByAddresses Test Community",
    creatorAddress: "0x0000000000000000000000000000000000dead",
    createdAt: now,
    registeredAt: now,
  });
  return id;
}

async function insertTierAndMember(communityId: string, walletAddress: string) {
  const tierId = randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await testDb.insert(schema.membershipTiers).values({
    id: tierId,
    communityId,
    label: "Member",
    canCreateProposals: false,
    canVote: true,
    canManageMembership: false,
    createdAt: now,
  });
  await testDb.insert(schema.memberships).values({ walletAddress, communityId, tierId, joinedAt: now });
}

describe("membershipService.listMembersByAddresses", () => {
  beforeEach(async () => {
    await clearCommunities();
  });

  afterAll(async () => {
    await clearCommunities();
  });

  it("returns [] for an empty input array (no query issued)", async () => {
    const communityId = await insertCommunity();
    expect(await listMembersByAddresses(communityId, [])).toEqual([]);
  });

  it("returns every address that is a real member", async () => {
    const communityId = await insertCommunity();
    await insertTierAndMember(communityId, MEMBER_A);
    await insertTierAndMember(communityId, MEMBER_B);

    const found = await listMembersByAddresses(communityId, [MEMBER_A, MEMBER_B]);
    expect(new Set(found)).toEqual(new Set([MEMBER_A.toLowerCase(), MEMBER_B.toLowerCase()]));
  });

  it("returns only the subset that are real members, silently omitting non-members", async () => {
    const communityId = await insertCommunity();
    await insertTierAndMember(communityId, MEMBER_A);

    const found = await listMembersByAddresses(communityId, [MEMBER_A, NON_MEMBER]);
    expect(found).toEqual([MEMBER_A.toLowerCase()]);
  });

  it("matches case-insensitively", async () => {
    const communityId = await insertCommunity();
    await insertTierAndMember(communityId, MEMBER_A.toLowerCase());

    const found = await listMembersByAddresses(communityId, [MEMBER_A.toUpperCase()]);
    expect(found).toEqual([MEMBER_A.toLowerCase()]);
  });

  it("is scoped per community — a member of one community doesn't match a lookup in another", async () => {
    const communityId = await insertCommunity();
    const otherCommunityId = await insertCommunity();
    await insertTierAndMember(otherCommunityId, MEMBER_A);

    expect(await listMembersByAddresses(communityId, [MEMBER_A])).toEqual([]);
  });
});
