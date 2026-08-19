import { useState } from "react";
import { useAccount } from "wagmi";
import { ALLOWED_POLICIES, VOTING_MODES } from "@/app/lib/placeholder-data";
import type { UseDeployGovernanceResult, DeployGovernanceConfig } from "@/src/hooks/useCreateCommunity";

interface Props {
  config: DeployGovernanceConfig;
  membershipDescription: string;
  roleLabels: string[];
  deploy: UseDeployGovernanceResult;
  goBack: () => void;
}

const POLICY_TYPE_LABELS: Record<string, string> = {
  FreeForAll: "Free For All",
  Zupass: "Zupass",
  EAS: "EAS Attestation",
  GitcoinPassport: "Gitcoin Passport",
  Semaphore: "Semaphore",
  AnonAadhaar: "Anon Aadhaar",
  ERC20Token: "ERC20 Token",
  MerkleProof: "Merkle Proof",
  HatsProtocol: "Hats Protocol",
};

export function StepReview({ config, membershipDescription, roleLabels, deploy, goBack }: Props) {
  const { address } = useAccount();
  const [showTechnical, setShowTechnical] = useState(false);

  const policyNames = (config.allowedPolicies ?? [])
    .map((id) => ALLOWED_POLICIES.find((p) => p.id === String(id))?.name ?? id)
    .join(", ");

  const modeNames = (config.supportedModes ?? [])
    .map((id) => VOTING_MODES.find((m) => m.id === String(id))?.name ?? id)
    .join(", ");

  const signUpPolicyLabel = config.signUpPolicy
    ? (POLICY_TYPE_LABELS[config.signUpPolicy.type] ?? config.signUpPolicy.type)
    : "–";

  const signUpPolicyDetail = config.signUpPolicy ? getPolicyDetail(config.signUpPolicy) : undefined;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-foreground">Review & Deploy</h2>
      <p className="text-sm text-gray-400">
        Deploying governance for <span className="text-foreground font-medium">{config.displayName}</span> —{" "}
        {membershipDescription}
      </p>

      <div className="rounded-lg border border-gray-700 bg-gray-800/40 divide-y divide-gray-700 text-sm">
        <Row label="Community name" value={config.displayName} />
        <Row label="Who can join" value={membershipDescription} />
        <Row label="Roles" value={roleLabels.join(", ") || "–"} />
      </div>

      <div className="rounded-lg border border-gray-700">
        <button
          type="button"
          onClick={() => setShowTechnical((v) => !v)}
          aria-expanded={showTechnical}
          className="w-full min-h-[44px] flex items-center justify-between px-4 py-3 text-sm text-gray-300
            hover:text-foreground transition-colors"
        >
          <span>Technical details</span>
          <span className="text-gray-500" aria-hidden="true">
            {showTechnical ? "−" : "+"}
          </span>
        </button>
        {showTechnical && (
          <div className="border-t border-gray-700 divide-y divide-gray-700 text-sm">
            <Row label="Voting mechanism" value="MACI" />
            <Row label="Sign-up policy" value={signUpPolicyLabel} />
            {signUpPolicyDetail && <Row label="Policy details" value={signUpPolicyDetail} mono />}
            <Row label="Allowed poll policies" value={policyNames || "–"} />
            <Row label="Voting modes" value={modeNames || "–"} />
            <Row label="Community admin" value={address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "–"} mono />
            <Row label="Transactions required" value="3 (deploy policy, deploy MACI, set target)" />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={goBack}
          className="flex-1 min-h-[44px] py-2 px-4 rounded-lg border border-gray-600 text-gray-300
            hover:bg-gray-700 transition-colors text-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => void deploy.startDeployment()}
          className="flex-1 min-h-[44px] py-2 px-4 rounded-lg bg-accent text-white font-medium
            hover:bg-accent-hover transition-colors text-sm"
        >
          Deploy
        </button>
      </div>
    </div>
  );
}

function getPolicyDetail(policy: DeployGovernanceConfig["signUpPolicy"]): string | undefined {
  switch (policy.type) {
    case "FreeForAll":
      return undefined;
    case "EAS":
      return `Schema: ${policy.schemaUid.slice(0, 10)}… Attester: ${policy.attesterAddress.slice(0, 8)}…`;
    case "Zupass":
      return `Event: ${policy.eventId.slice(0, 12)}…`;
    case "GitcoinPassport":
      return `Min score: ${policy.thresholdScore}`;
    case "Semaphore":
      return `Group ID: ${policy.groupId}`;
    case "AnonAadhaar":
      return `Seed: ${String(policy.nullifierSeed).slice(0, 10)}…`;
    case "ERC20Token":
      return `Token: ${policy.tokenAddress.slice(0, 8)}… Threshold: ${String(policy.threshold)}`;
    case "MerkleProof":
      return `Root: ${policy.merkleRoot.slice(0, 10)}…`;
    case "HatsProtocol":
      return `Hats: ${policy.criterionHats.slice(0, 3).join(", ")}${policy.criterionHats.length > 3 ? "…" : ""}`;
  }
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className={`text-foreground text-right min-w-0 break-words ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}
