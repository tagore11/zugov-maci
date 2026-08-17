import { create, update } from "../services/communityService.js";
import type { CommunityBody } from "../validators/communitySchema.js";
import type { TierBody } from "../validators/membershipSchema.js";

const DEFAULT_TIERS: [TierBody, ...TierBody[]] = [
  {
    label: "Guest",
    canCreateGovernanceActions: false,
    canVote: false,
    canManageMembership: false,
    canDelegate: false,
    canBeDelegatedTo: false,
  },
  {
    label: "Visitor",
    canCreateGovernanceActions: false,
    canVote: false,
    canManageMembership: false,
    canDelegate: false,
    canBeDelegatedTo: false,
  },
  {
    label: "Regular",
    canCreateGovernanceActions: false,
    canVote: true,
    canManageMembership: false,
    canDelegate: false,
    canBeDelegatedTo: false,
  },
  {
    label: "OG",
    canCreateGovernanceActions: true,
    canVote: true,
    canManageMembership: false,
    canDelegate: false,
    canBeDelegatedTo: false,
  },
  {
    label: "Manager",
    canCreateGovernanceActions: true,
    canVote: true,
    canManageMembership: true,
    canDelegate: false,
    canBeDelegatedTo: false,
  },
  {
    label: "Admin",
    canCreateGovernanceActions: true,
    canVote: true,
    canManageMembership: true,
    canDelegate: false,
    canBeDelegatedTo: false,
  },
];

const SEED_COMMUNITIES: CommunityBody[] = [
  {
    id: "0xFCeA194e9B7A9A785C1a7d2bCd08f9D7b123456a",
    chainId: 534351,
    displayName: "ZuKas Residency",
    description: "ZuKas Residency community governance via MACI",
    logo: "🏛️",
    creatorAddress: "0x0000000000000000000000000000000000000001",
    allowedPolicies: [0, 1],
    supportedModes: [0, 1],
    signUpPolicyType: "FreeForAll",
    signUpPolicyAddress: "0x0000000000000000000000000000000000000011",
    maciDeploymentBlock: 18199019,
    stateTreeDepth: 6,
    source: "wizard",
    membershipPolicy: "open",
    tierChangesRequireVote: false,
    tiers: DEFAULT_TIERS,
    defaultTierLabel: "Regular",
  },
  {
    id: "0x365d6b5a48Dc7D4bc83E78f31C01e4E3456789b",
    chainId: 534351,
    displayName: "ETH-NS",
    description: "ETH Name Service governance community",
    logo: "🌐",
    creatorAddress: "0x0000000000000000000000000000000000000002",
    allowedPolicies: [0],
    supportedModes: [0],
    signUpPolicyType: "FreeForAll",
    signUpPolicyAddress: "0x0000000000000000000000000000000000000012",
    maciDeploymentBlock: 16833449,
    stateTreeDepth: 10,
    source: "wizard",
    membershipPolicy: "open",
    tierChangesRequireVote: false,
    tiers: DEFAULT_TIERS,
    defaultTierLabel: "Regular",
  },
];

// specs/007 T022: seeded separately from SEED_COMMUNITIES via update() rather than as a create()
// field, since directDeploymentEnabled is deliberately PATCH-only (data-model.md) — there's no
// creation-time path for it.
const DIRECT_DEPLOYMENT_COMMUNITY_ID = "0x365d6b5a48Dc7D4bc83E78f31C01e4E3456789b";

async function seed() {
  console.log("Seeding communities...");
  for (const community of SEED_COMMUNITIES) {
    const { created } = await create(community);
    console.log(`  ${created ? "✓ Created" : "  Skipped (exists)"}: ${community.displayName}`);
  }
  await update(DIRECT_DEPLOYMENT_COMMUNITY_ID, { directDeploymentEnabled: true });
  console.log("  ✓ Enabled direct deployment on ETH-NS (for local direct-deploy testing)");
  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
