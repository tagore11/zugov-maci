import type { Hex } from "viem";
import type { SignUpPolicyArgs } from "@/src/config";

export type DeployPhase = "deploy_sign_up_policy" | "deploy_maci" | "set_target" | "save_community";

export type MembershipPolicy = "open" | "approval";

export interface TierDraft {
  label: string;
  canCreateGovernanceActions: boolean;
  canVote: boolean;
  canManageMembership: boolean;
}

export interface MACIDeploymentConfig {
  displayName: string;
  description: string;
  // Local chapters, event teams, and contributor circles nest under a parent community
  // (Lightpaper's "communities and sub-communities" building block).
  parentCommunityId?: string;
  signUpPolicy: SignUpPolicyArgs;
  allowedPolicies: number[];
  supportedModes: number[];
  stateTreeDepth: 10;
  membershipPolicy: MembershipPolicy;
  tierChangesRequireVote: boolean;
  tiers: TierDraft[];
  defaultTierLabel: string;
}

export interface PendingDeploymentCheckpoint {
  config: MACIDeploymentConfig;
  lastPhase: DeployPhase;
  // The community's identity id (server-generated UUID), created before any on-chain deployment
  // starts (Architecture 1A/1B). Persisted immediately so a resumed wizard run reuses the same
  // identity instead of calling createIdentity() again — wizard-path identity creation has no
  // natural retry key the way a client-supplied contract address would.
  identityCommunityId?: string;
  deployedSignUpPolicyAddress?: Hex;
  deployedMaciAddress?: Hex;
  deployedMaciBlockNumber?: number;
  chainId: number;
  startedAt: number;
}

const PENDING_PREFIX = "pending_deployment_";

export function savePendingCheckpoint(wallet: Hex, checkpoint: PendingDeploymentCheckpoint): void {
  localStorage.setItem(`${PENDING_PREFIX}${wallet.toLowerCase()}`, JSON.stringify(checkpoint));
}

export function getPendingCheckpoint(wallet: Hex): PendingDeploymentCheckpoint | null {
  const raw = localStorage.getItem(`${PENDING_PREFIX}${wallet.toLowerCase()}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingDeploymentCheckpoint;
  } catch {
    return null;
  }
}

export function clearPendingCheckpoint(wallet: Hex): void {
  localStorage.removeItem(`${PENDING_PREFIX}${wallet.toLowerCase()}`);
}
