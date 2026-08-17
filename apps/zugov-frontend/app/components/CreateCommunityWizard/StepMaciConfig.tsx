import { useState } from "react";
import { ALLOWED_POLICIES, VOTING_MODES } from "@/app/lib/placeholder-data";
import { type SignUpPolicyType, type SignUpPolicyArgs } from "@/src/config";
import type { UseCreateCommunityResult } from "@/src/hooks/useCreateCommunity";

const SIGN_UP_POLICY_TYPES: { type: SignUpPolicyType; label: string; description: string }[] = [
  { type: "FreeForAll", label: "Free For All", description: "Anyone can sign up" },
  { type: "Zupass", label: "Zupass", description: "Verified Zupass ticket holders" },
  { type: "EAS", label: "EAS Attestation", description: "Ethereum Attestation Service schema" },
  { type: "GitcoinPassport", label: "Gitcoin Passport", description: "Minimum Gitcoin Passport score" },
  { type: "Semaphore", label: "Semaphore", description: "Semaphore group members" },
  { type: "AnonAadhaar", label: "Anon Aadhaar", description: "Anonymous Aadhaar identity proof" },
  { type: "ERC20Token", label: "ERC20 Token", description: "Minimum token balance required" },
  { type: "ERC20Votes", label: "ERC20 Votes Token", description: "Minimum voting power at a snapshot block" },
  { type: "Token", label: "Token (NFT)", description: "Must hold a specific NFT" },
  { type: "MerkleProof", label: "Merkle Proof", description: "Allowlist via Merkle root" },
  { type: "HatsProtocol", label: "Hats Protocol", description: "Hats Protocol hat holders" },
];

interface PolicyInputState {
  zupassEventId: string;
  zupassSigner1: string;
  zupassSigner2: string;
  easSchemaUid: string;
  easAttester: string;
  gitcoinScore: string;
  semaphoreGroupId: string;
  anonAadhaarSeed: string;
  erc20Token: string;
  erc20Threshold: string;
  erc20VotesToken: string;
  erc20VotesThreshold: string;
  erc20VotesSnapshotBlock: string;
  tokenAddress: string;
  merkleRoot: string;
  hatsIds: string;
}

const DEFAULT_INPUTS: PolicyInputState = {
  zupassEventId: "",
  zupassSigner1: "",
  zupassSigner2: "",
  easSchemaUid: "",
  easAttester: "",
  gitcoinScore: "",
  semaphoreGroupId: "",
  anonAadhaarSeed: "",
  erc20Token: "",
  erc20Threshold: "",
  erc20VotesToken: "",
  erc20VotesThreshold: "",
  erc20VotesSnapshotBlock: "",
  tokenAddress: "",
  merkleRoot: "",
  hatsIds: "",
};

interface Props {
  initialPolicies?: number[];
  initialModes?: number[];
  initialSignUpPolicy?: SignUpPolicyArgs;
  setMaciConfig: UseCreateCommunityResult["setMaciConfig"];
  goBack: UseCreateCommunityResult["goBack"];
}

export function StepMaciConfig({
  initialPolicies = [],
  initialModes = [],
  initialSignUpPolicy,
  setMaciConfig,
  goBack,
}: Props) {
  const [policies, setPolicies] = useState<number[]>(initialPolicies);
  const [modes, setModes] = useState<number[]>(initialModes);
  const [policyType, setPolicyType] = useState<SignUpPolicyType>(initialSignUpPolicy?.type ?? "FreeForAll");
  const [inputs, setInputs] = useState<PolicyInputState>(DEFAULT_INPUTS);
  const [submitted, setSubmitted] = useState(false);

  function updateInput(key: keyof PolicyInputState, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function buildSignUpPolicyArgs(): SignUpPolicyArgs | null {
    switch (policyType) {
      case "FreeForAll":
        return { type: "FreeForAll" };
      case "Zupass":
        if (!inputs.zupassEventId || !inputs.zupassSigner1 || !inputs.zupassSigner2) return null;
        return {
          type: "Zupass",
          eventId: inputs.zupassEventId,
          signer1: inputs.zupassSigner1,
          signer2: inputs.zupassSigner2,
        };
      case "EAS":
        if (!inputs.easSchemaUid || !inputs.easAttester) return null;
        return {
          type: "EAS",
          schemaUid: inputs.easSchemaUid as `0x${string}`,
          attesterAddress: inputs.easAttester as `0x${string}`,
        };
      case "GitcoinPassport": {
        const score = parseInt(inputs.gitcoinScore, 10);
        if (isNaN(score) || score < 0) return null;
        return { type: "GitcoinPassport", thresholdScore: score };
      }
      case "Semaphore":
        if (!inputs.semaphoreGroupId) return null;
        return { type: "Semaphore", groupId: inputs.semaphoreGroupId };
      case "AnonAadhaar":
        if (!inputs.anonAadhaarSeed) return null;
        try {
          return { type: "AnonAadhaar", nullifierSeed: BigInt(inputs.anonAadhaarSeed) };
        } catch {
          return null;
        }
      case "ERC20Token": {
        if (!inputs.erc20Token) return null;
        try {
          return {
            type: "ERC20Token",
            tokenAddress: inputs.erc20Token as `0x${string}`,
            threshold: BigInt(inputs.erc20Threshold || "0"),
          };
        } catch {
          return null;
        }
      }
      case "ERC20Votes": {
        if (!inputs.erc20VotesToken || !inputs.erc20VotesSnapshotBlock) return null;
        try {
          return {
            type: "ERC20Votes",
            tokenAddress: inputs.erc20VotesToken as `0x${string}`,
            threshold: BigInt(inputs.erc20VotesThreshold || "0"),
            snapshotBlock: BigInt(inputs.erc20VotesSnapshotBlock),
          };
        } catch {
          return null;
        }
      }
      case "Token":
        if (!inputs.tokenAddress) return null;
        return { type: "Token", tokenAddress: inputs.tokenAddress as `0x${string}` };
      case "MerkleProof":
        if (!inputs.merkleRoot) return null;
        return { type: "MerkleProof", merkleRoot: inputs.merkleRoot as `0x${string}` };
      case "HatsProtocol": {
        const ids = inputs.hatsIds
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (ids.length === 0) return null;
        return { type: "HatsProtocol", criterionHats: ids };
      }
    }
  }

  const policiesError = submitted && policies.length === 0 ? "Select at least one voter eligibility method" : undefined;
  const modesError = submitted && modes.length === 0 ? "Select at least one voting style" : undefined;
  const policyArgsError =
    submitted && buildSignUpPolicyArgs() === null ? "Fill in all required policy fields" : undefined;

  function handleNext() {
    setSubmitted(true);
    const signUpPolicy = buildSignUpPolicyArgs();
    if (!signUpPolicy || policies.length === 0 || modes.length === 0) return;
    setMaciConfig({ signUpPolicy, allowedPolicies: policies, supportedModes: modes });
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white">MACI Configuration</h2>

      {/* MACI sign-up policy */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Community sign-up policy <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Controls who can register in your community&apos;s MACI state tree.
        </p>
        <select
          value={policyType}
          onChange={(e) => setPolicyType(e.target.value as SignUpPolicyType)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {SIGN_UP_POLICY_TYPES.map(({ type, label }) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1.5">
          {SIGN_UP_POLICY_TYPES.find(({ type }) => type === policyType)?.description}
        </p>

        {/* Inline policy-specific inputs */}
        {policyType !== "FreeForAll" && (
          <div className="mt-3 rounded-lg border border-gray-700 bg-gray-800/40 p-3 space-y-2.5">
            {policyType === "Zupass" && (
              <>
                <Input
                  label="Event ID"
                  value={inputs.zupassEventId}
                  onChange={(v) => updateInput("zupassEventId", v)}
                  placeholder="Event UUID as uint256"
                />
                <Input
                  label="Signer 1"
                  value={inputs.zupassSigner1}
                  onChange={(v) => updateInput("zupassSigner1", v)}
                  placeholder="EdDSA public key part 1"
                />
                <Input
                  label="Signer 2"
                  value={inputs.zupassSigner2}
                  onChange={(v) => updateInput("zupassSigner2", v)}
                  placeholder="EdDSA public key part 2"
                />
              </>
            )}
            {policyType === "EAS" && (
              <>
                <Input
                  label="Schema UID"
                  value={inputs.easSchemaUid}
                  onChange={(v) => updateInput("easSchemaUid", v)}
                  placeholder="0x..."
                  mono
                />
                <Input
                  label="Attester address"
                  value={inputs.easAttester}
                  onChange={(v) => updateInput("easAttester", v)}
                  placeholder="0x..."
                  mono
                />
              </>
            )}
            {policyType === "GitcoinPassport" && (
              <Input
                label="Minimum score"
                value={inputs.gitcoinScore}
                onChange={(v) => updateInput("gitcoinScore", v)}
                placeholder="e.g. 15"
                type="number"
              />
            )}
            {policyType === "Semaphore" && (
              <Input
                label="Group ID"
                value={inputs.semaphoreGroupId}
                onChange={(v) => updateInput("semaphoreGroupId", v)}
                placeholder="Semaphore group ID"
              />
            )}
            {policyType === "AnonAadhaar" && (
              <Input
                label="Nullifier seed"
                value={inputs.anonAadhaarSeed}
                onChange={(v) => updateInput("anonAadhaarSeed", v)}
                placeholder="uint256 seed value"
              />
            )}
            {policyType === "ERC20Token" && (
              <>
                <Input
                  label="Token address"
                  value={inputs.erc20Token}
                  onChange={(v) => updateInput("erc20Token", v)}
                  placeholder="0x..."
                  mono
                />
                <Input
                  label="Minimum balance"
                  value={inputs.erc20Threshold}
                  onChange={(v) => updateInput("erc20Threshold", v)}
                  placeholder="Amount in wei (default 0)"
                />
              </>
            )}
            {policyType === "ERC20Votes" && (
              <>
                <Input
                  label="Token address"
                  value={inputs.erc20VotesToken}
                  onChange={(v) => updateInput("erc20VotesToken", v)}
                  placeholder="0x..."
                  mono
                />
                <Input
                  label="Snapshot block"
                  value={inputs.erc20VotesSnapshotBlock}
                  onChange={(v) => updateInput("erc20VotesSnapshotBlock", v)}
                  placeholder="Block number"
                  type="number"
                />
                <Input
                  label="Minimum voting power"
                  value={inputs.erc20VotesThreshold}
                  onChange={(v) => updateInput("erc20VotesThreshold", v)}
                  placeholder="Amount in wei (default 0)"
                />
              </>
            )}
            {policyType === "Token" && (
              <Input
                label="NFT contract address"
                value={inputs.tokenAddress}
                onChange={(v) => updateInput("tokenAddress", v)}
                placeholder="0x..."
                mono
              />
            )}
            {policyType === "MerkleProof" && (
              <Input
                label="Merkle root"
                value={inputs.merkleRoot}
                onChange={(v) => updateInput("merkleRoot", v)}
                placeholder="0x..."
                mono
              />
            )}
            {policyType === "HatsProtocol" && (
              <Input
                label="Hat IDs"
                value={inputs.hatsIds}
                onChange={(v) => updateInput("hatsIds", v)}
                placeholder="Comma-separated hat IDs"
              />
            )}
          </div>
        )}
        {policyArgsError && <p className="mt-1 text-xs text-red-400">{policyArgsError}</p>}
      </div>

      {/* Allowed poll policies */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Allowed voter eligibility methods for polls <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">Which eligibility methods can be used when creating polls.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5">
          {ALLOWED_POLICIES.map((policy) => {
            const id = parseInt(policy.id, 10);
            const checked = policies.includes(id);
            return (
              <label key={policy.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setPolicies((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
                  }
                  className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <span className={`text-sm ${checked ? "text-white" : "text-gray-400"} group-hover:text-gray-200`}>
                  {policy.name}
                </span>
              </label>
            );
          })}
        </div>
        {policiesError && <p className="mt-1 text-xs text-red-400">{policiesError}</p>}
      </div>

      {/* Voting modes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Supported voting styles <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {VOTING_MODES.map((mode) => {
            const id = parseInt(mode.id, 10);
            const checked = modes.includes(id);
            return (
              <label key={mode.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setModes((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
                  }
                  className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <span className={`text-sm ${checked ? "text-white" : "text-gray-400"} group-hover:text-gray-200`}>
                  {mode.name}
                </span>
              </label>
            );
          })}
        </div>
        {modesError && <p className="mt-1 text-xs text-red-400">{modesError}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={goBack}
          className="flex-1 py-2 px-4 rounded-lg border border-gray-600 text-gray-300
            hover:bg-gray-700 transition-colors text-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-2 px-4 rounded-lg bg-purple-600 text-white font-medium
            hover:bg-purple-700 transition-colors text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-1.5 rounded-md border border-gray-700 bg-gray-900 text-sm text-white
          placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500
          ${mono ? "font-mono text-xs" : ""}`}
      />
    </div>
  );
}
