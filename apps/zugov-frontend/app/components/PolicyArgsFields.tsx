import type { SignUpPolicyType, SignUpPolicyArgs } from "@/src/config";

/** Labels/descriptions for every on-chain policy type — shared by community sign-up policy
 * selection and poll eligibility policy selection, since both pick from the same 11 types. */
export const POLICY_TYPE_OPTIONS: { type: SignUpPolicyType; label: string; description: string }[] = [
  { type: "FreeForAll", label: "Free For All", description: "Anyone can pass" },
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

export interface PolicyInputState {
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

export const DEFAULT_POLICY_INPUTS: PolicyInputState = {
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

export function buildPolicyArgs(policyType: SignUpPolicyType, inputs: PolicyInputState): SignUpPolicyArgs | null {
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

/** Every call site (CreateCommunityWizard's StepCommunitySetup, CreateProposalModal) now
 * renders inside a dark modal/panel per DESIGN.md — "light" is kept only so a future light-toggle
 * surface doesn't need this component's plumbing rebuilt, not because anything uses it today.
 * Defaults to "dark" to match every current call site. */
export type PolicyArgsTheme = "light" | "dark";

const THEME_CLASSES = {
  light: {
    wrapper: "border-gray-200 bg-gray-50",
    label: "text-gray-700",
    input: "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-accent",
  },
  dark: {
    wrapper: "border-gray-700 bg-gray-800/40",
    label: "text-gray-400",
    input: "border-gray-700 bg-gray-900 text-foreground placeholder-gray-600 focus:ring-accent",
  },
} as const;

export function PolicyArgInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono = false,
  theme = "dark",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
  theme?: PolicyArgsTheme;
}) {
  const classes = THEME_CLASSES[theme];
  return (
    <div>
      <label className={`block text-xs mb-1 ${classes.label}`}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-1.5 rounded-md border text-sm focus:outline-none focus:ring-1 ${classes.input}
          ${mono ? "font-mono text-xs" : ""}`}
      />
    </div>
  );
}

/** Renders the inline parameter inputs for whichever policy type is selected — null (renders
 * nothing) for FreeForAll, which needs no parameters. */
export function PolicyArgsFields({
  policyType,
  inputs,
  updateInput,
  theme = "dark",
}: {
  policyType: SignUpPolicyType;
  inputs: PolicyInputState;
  updateInput: (key: keyof PolicyInputState, value: string) => void;
  theme?: PolicyArgsTheme;
}) {
  if (policyType === "FreeForAll") return null;

  return (
    <div className={`mt-3 rounded-lg border p-3 space-y-2.5 ${THEME_CLASSES[theme].wrapper}`}>
      {policyType === "Zupass" && (
        <>
          <PolicyArgInput
            label="Event ID"
            value={inputs.zupassEventId}
            onChange={(v) => updateInput("zupassEventId", v)}
            placeholder="Event UUID as uint256"
            theme={theme}
          />
          <PolicyArgInput
            label="Signer 1"
            value={inputs.zupassSigner1}
            onChange={(v) => updateInput("zupassSigner1", v)}
            placeholder="EdDSA public key part 1"
            theme={theme}
          />
          <PolicyArgInput
            label="Signer 2"
            value={inputs.zupassSigner2}
            onChange={(v) => updateInput("zupassSigner2", v)}
            placeholder="EdDSA public key part 2"
            theme={theme}
          />
        </>
      )}
      {policyType === "EAS" && (
        <>
          <PolicyArgInput
            label="Schema UID"
            value={inputs.easSchemaUid}
            onChange={(v) => updateInput("easSchemaUid", v)}
            placeholder="0x..."
            mono
            theme={theme}
          />
          <PolicyArgInput
            label="Attester address"
            value={inputs.easAttester}
            onChange={(v) => updateInput("easAttester", v)}
            placeholder="0x..."
            mono
            theme={theme}
          />
        </>
      )}
      {policyType === "GitcoinPassport" && (
        <PolicyArgInput
          label="Minimum score"
          value={inputs.gitcoinScore}
          onChange={(v) => updateInput("gitcoinScore", v)}
          placeholder="e.g. 15"
          type="number"
          theme={theme}
        />
      )}
      {policyType === "Semaphore" && (
        <PolicyArgInput
          label="Group ID"
          value={inputs.semaphoreGroupId}
          onChange={(v) => updateInput("semaphoreGroupId", v)}
          placeholder="Semaphore group ID"
          theme={theme}
        />
      )}
      {policyType === "AnonAadhaar" && (
        <PolicyArgInput
          label="Nullifier seed"
          value={inputs.anonAadhaarSeed}
          onChange={(v) => updateInput("anonAadhaarSeed", v)}
          placeholder="uint256 seed value"
          theme={theme}
        />
      )}
      {policyType === "ERC20Token" && (
        <>
          <PolicyArgInput
            label="Token address"
            value={inputs.erc20Token}
            onChange={(v) => updateInput("erc20Token", v)}
            placeholder="0x..."
            mono
            theme={theme}
          />
          <PolicyArgInput
            label="Minimum balance"
            value={inputs.erc20Threshold}
            onChange={(v) => updateInput("erc20Threshold", v)}
            placeholder="Amount in wei (default 0)"
            theme={theme}
          />
        </>
      )}
      {policyType === "ERC20Votes" && (
        <>
          <PolicyArgInput
            label="Token address"
            value={inputs.erc20VotesToken}
            onChange={(v) => updateInput("erc20VotesToken", v)}
            placeholder="0x..."
            mono
            theme={theme}
          />
          <PolicyArgInput
            label="Snapshot block"
            value={inputs.erc20VotesSnapshotBlock}
            onChange={(v) => updateInput("erc20VotesSnapshotBlock", v)}
            placeholder="Block number"
            type="number"
            theme={theme}
          />
          <PolicyArgInput
            label="Minimum voting power"
            value={inputs.erc20VotesThreshold}
            onChange={(v) => updateInput("erc20VotesThreshold", v)}
            placeholder="Amount in wei (default 0)"
            theme={theme}
          />
        </>
      )}
      {policyType === "Token" && (
        <PolicyArgInput
          label="NFT contract address"
          value={inputs.tokenAddress}
          onChange={(v) => updateInput("tokenAddress", v)}
          placeholder="0x..."
          mono
          theme={theme}
        />
      )}
      {policyType === "MerkleProof" && (
        <PolicyArgInput
          label="Merkle root"
          value={inputs.merkleRoot}
          onChange={(v) => updateInput("merkleRoot", v)}
          placeholder="0x..."
          mono
          theme={theme}
        />
      )}
      {policyType === "HatsProtocol" && (
        <PolicyArgInput
          label="Hat IDs"
          value={inputs.hatsIds}
          onChange={(v) => updateInput("hatsIds", v)}
          placeholder="Comma-separated hat IDs"
          theme={theme}
        />
      )}
    </div>
  );
}
