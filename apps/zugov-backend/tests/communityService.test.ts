import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testDb, clearCommunities } from "./helpers/testDb.js";
import * as schema from "../src/db/schema.js";
import { createCommunityRow } from "../src/services/communityService.js";

const CREATOR = "0x1111111111111111111111111111111111111a";

describe("communityService.createCommunityRow", () => {
  beforeEach(async () => {
    await clearCommunities();
  });

  afterAll(async () => {
    await clearCommunities();
  });

  // Eng-review critical gap (2026-08-28) — createIdentity() previously ran the communities-row
  // insert, tier creation, defaultTierId backfill, and creator enrollment as separate, unwrapped
  // calls: a failure partway through could silently leave a real community with no tiers and no
  // default tier. createTiersForCommunity's own defaultTierLabel-mismatch check is a convenient,
  // real failure to trigger mid-transaction without mocking the DB driver.
  it("rolls back the communities row when tier creation fails partway through (no orphaned row)", async () => {
    await expect(
      createCommunityRow({
        displayName: "Should Not Persist",
        creatorAddress: CREATOR,
        tiers: [
          {
            label: "Member",
            canCreateProposals: false,
            canVote: true,
            canManageMembership: false,
            canDelegate: false,
            canBeDelegatedTo: false,
            canCreateEvents: true,
            canPostDiscussions: true,
          },
        ],
        // Deliberately mismatched — createTiersForCommunity throws once it can't find a tier
        // whose label matches this, after the tier row has already been inserted inside the tx.
        defaultTierLabel: "Nonexistent Tier",
      }),
    ).rejects.toThrow(/does not match any provided tier/);

    const rows = await testDb.select().from(schema.communities);
    const orphaned = rows.filter((r) => r.displayName === "Should Not Persist");
    expect(orphaned).toHaveLength(0);

    const tierRows = await testDb.select().from(schema.membershipTiers);
    expect(tierRows.filter((t) => t.label === "Member")).toHaveLength(0);
  });

  it("creates a community row, one tier, and enrolls the creator into it (happy path)", async () => {
    const { community, defaultTierId, creatorTierId } = await createCommunityRow({
      displayName: "Atomic Test Community",
      creatorAddress: CREATOR,
      tiers: [
        {
          label: "Admin",
          canCreateProposals: true,
          canVote: true,
          canManageMembership: true,
          canDelegate: false,
          canBeDelegatedTo: false,
          canCreateEvents: true,
          canPostDiscussions: true,
        },
      ],
      defaultTierLabel: "Admin",
    });

    expect(community.defaultTierId).toBe(defaultTierId);
    expect(defaultTierId).toBe(creatorTierId);

    const memberships = await testDb.select().from(schema.memberships);
    expect(memberships.some((m) => m.communityId === community.id && m.walletAddress === CREATOR)).toBe(true);
  });

  // D6 (corrected during outside-voice pass) — unionService.create() passes this so a union's
  // creator never gets a dead-data tier membership nothing checks (real authority for union
  // content comes from membershipService.isAuthorizedForUnionContent instead).
  it("skips creator enrollment when skipCreatorEnrollment is set, but still creates a placeholder tier", async () => {
    const { community, defaultTierId } = await createCommunityRow({
      displayName: "Union-shaped Community",
      creatorAddress: CREATOR,
      type: "union",
      skipCreatorEnrollment: true,
      tiers: [
        {
          label: "Member",
          canCreateProposals: false,
          canVote: false,
          canManageMembership: false,
          canDelegate: false,
          canBeDelegatedTo: false,
          canCreateEvents: false,
          canPostDiscussions: false,
        },
      ],
      defaultTierLabel: "Member",
    });

    expect(community.type).toBe("union");
    expect(community.defaultTierId).toBe(defaultTierId);
    expect(defaultTierId).toBeTruthy();

    const memberships = await testDb.select().from(schema.memberships);
    expect(memberships.some((m) => m.communityId === community.id)).toBe(false);
  });
});
