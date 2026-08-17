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
