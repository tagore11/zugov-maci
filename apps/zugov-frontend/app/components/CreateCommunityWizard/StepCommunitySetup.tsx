import { useState } from "react";
import {
  POLICY_TYPE_OPTIONS,
  DEFAULT_POLICY_INPUTS,
  buildPolicyArgs,
  PolicyArgsFields,
  type PolicyInputState,
} from "@/app/components/PolicyArgsFields";
import { ALLOWED_POLICIES, VOTING_MODES } from "@/app/lib/placeholder-data";
import { type SignUpPolicyType, type SignUpPolicyArgs } from "@/src/config";
import type { MembershipPolicy, TierDraft } from "@/src/services/checkpointStore";
import type { UseCreateCommunityResult } from "@/src/hooks/useCreateCommunity";
import { RESIDENT_ORGANIZER_TIERS } from "@/src/hooks/useCreateCommunity";

interface Props {
  initialMembershipPolicy?: MembershipPolicy;
  initialSignUpPolicy?: SignUpPolicyArgs;
  initialPolicies?: number[];
  initialModes?: number[];
  setCommunitySetup: UseCreateCommunityResult["setCommunitySetup"];
  goBack: UseCreateCommunityResult["goBack"];
}

function describeTier(tier: TierDraft): string {
  const caps: string[] = [];
  if (tier.canVote) caps.push("vote");
  if (tier.canCreateGovernanceActions) caps.push("create polls");
  if (tier.canManageMembership) caps.push("manage membership");
  return `Can ${caps.join(", ")}.`;
}

/** Reverse of buildPolicyArgs (PolicyArgsFields.tsx) — reconstructs the form input strings from
 * a previously-built policy, so re-opening Advanced settings after navigating Back shows what
 * was actually configured instead of blank fields. */
function hydratePolicyInputs(policy: SignUpPolicyArgs | undefined): PolicyInputState {
  if (!policy) return DEFAULT_POLICY_INPUTS;
  switch (policy.type) {
    case "FreeForAll":
      return DEFAULT_POLICY_INPUTS;
    case "Zupass":
      return {
        ...DEFAULT_POLICY_INPUTS,
        zupassEventId: policy.eventId,
        zupassSigner1: policy.signer1,
        zupassSigner2: policy.signer2,
      };
    case "EAS":
      return { ...DEFAULT_POLICY_INPUTS, easSchemaUid: policy.schemaUid, easAttester: policy.attesterAddress };
    case "GitcoinPassport":
      return { ...DEFAULT_POLICY_INPUTS, gitcoinScore: String(policy.thresholdScore) };
    case "Semaphore":
      return { ...DEFAULT_POLICY_INPUTS, semaphoreGroupId: policy.groupId };
    case "AnonAadhaar":
      return { ...DEFAULT_POLICY_INPUTS, anonAadhaarSeed: String(policy.nullifierSeed) };
    case "ERC20Token":
      return { ...DEFAULT_POLICY_INPUTS, erc20Token: policy.tokenAddress, erc20Threshold: String(policy.threshold) };
    case "ERC20Votes":
      return {
        ...DEFAULT_POLICY_INPUTS,
        erc20VotesToken: policy.tokenAddress,
        erc20VotesThreshold: String(policy.threshold),
        erc20VotesSnapshotBlock: String(policy.snapshotBlock),
      };
    case "Token":
      return { ...DEFAULT_POLICY_INPUTS, tokenAddress: policy.tokenAddress };
    case "MerkleProof":
      return { ...DEFAULT_POLICY_INPUTS, merkleRoot: policy.merkleRoot };
    case "HatsProtocol":
      return { ...DEFAULT_POLICY_INPUTS, hatsIds: policy.criterionHats.join(", ") };
  }
}

const DEFAULT_POLICY_TYPE: SignUpPolicyType = "FreeForAll";
const DEFAULT_POLICIES = [1];
const DEFAULT_MODES = [1];

export function StepCommunitySetup({
  initialMembershipPolicy,
  initialSignUpPolicy,
  initialPolicies,
  initialModes,
  setCommunitySetup,
  goBack,
}: Props) {
  const [membershipPolicy, setMembershipPolicy] = useState<MembershipPolicy>(initialMembershipPolicy ?? "open");

  // Advanced settings default to sensible values — only touched if the resident opens the
  // section. FreeForAll / policy id 1 / mode id 1 match useCreateCommunity's own defaults,
  // so leaving this collapsed produces the same config as engaging with it. If the resident
  // already configured something non-default (e.g. navigated Back and forward again), restore
  // it AND start the section open — losing it silently on Back would be a real regression for
  // the one screen Tarik/Sait actually depend on.
  const hadNonDefaultAdvanced =
    (initialSignUpPolicy && initialSignUpPolicy.type !== DEFAULT_POLICY_TYPE) ||
    (initialPolicies && initialPolicies.join(",") !== DEFAULT_POLICIES.join(",")) ||
    (initialModes && initialModes.join(",") !== DEFAULT_MODES.join(","));

  const [advancedOpen, setAdvancedOpen] = useState(Boolean(hadNonDefaultAdvanced));
  const [policyType, setPolicyType] = useState<SignUpPolicyType>(initialSignUpPolicy?.type ?? DEFAULT_POLICY_TYPE);
  const [inputs, setInputs] = useState<PolicyInputState>(() => hydratePolicyInputs(initialSignUpPolicy));
  const [policies, setPolicies] = useState<number[]>(initialPolicies ?? DEFAULT_POLICIES);
  const [modes, setModes] = useState<number[]>(initialModes ?? DEFAULT_MODES);
  const [advancedError, setAdvancedError] = useState<string | undefined>();
  // setCommunitySetup now creates the community's identity (Architecture 1A/1B: id known before
  // deployment starts) — a real network call, not a pure state update, so this step needs its
  // own loading/error handling like the later network-check/deploy steps already have.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  function updateInput(key: keyof PolicyInputState, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  async function handleNext() {
    setSubmitError(undefined);
    const advanced = advancedOpen
      ? (() => {
          const signUpPolicy = buildPolicyArgs(policyType, inputs);
          if (!signUpPolicy || policies.length === 0 || modes.length === 0) {
            setAdvancedError("Fill in the advanced settings, or collapse the section to use the defaults.");
            return undefined;
          }
          return { signUpPolicy, allowedPolicies: policies, supportedModes: modes };
        })()
      : undefined;
    if (advancedOpen && !advanced) return;

    setIsSubmitting(true);
    try {
      await setCommunitySetup({ membershipPolicy, advanced });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create community identity");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Who&apos;s in your community?</h2>
        <p className="text-sm text-gray-400 mt-1">You&apos;ll be the first Organizer.</p>
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium text-gray-300">Who can join?</span>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setMembershipPolicy("open")}
            aria-pressed={membershipPolicy === "open"}
            className={`w-full min-h-[44px] text-left p-3 rounded-lg border transition-colors ${
              membershipPolicy === "open"
                ? "border-accent bg-accent/10"
                : "border-gray-700 bg-gray-800/30 hover:bg-gray-800/60"
            }`}
          >
            <div className="font-medium text-foreground text-sm">Anyone can join</div>
            <div className="text-xs text-gray-400 mt-0.5">Residents join instantly, no approval needed.</div>
          </button>
          <button
            type="button"
            onClick={() => setMembershipPolicy("approval")}
            aria-pressed={membershipPolicy === "approval"}
            className={`w-full min-h-[44px] text-left p-3 rounded-lg border transition-colors ${
              membershipPolicy === "approval"
                ? "border-accent bg-accent/10"
                : "border-gray-700 bg-gray-800/30 hover:bg-gray-800/60"
            }`}
          >
            <div className="font-medium text-foreground text-sm">Organizers approve new residents</div>
            <div className="text-xs text-gray-400 mt-0.5">Join requests wait for an Organizer to approve them.</div>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium text-gray-300">Roles</span>
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 divide-y divide-gray-700 text-sm">
          {RESIDENT_ORGANIZER_TIERS.map((tier) => (
            <div key={tier.label} className="px-4 py-2.5">
              <div className="text-foreground font-medium">{tier.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{describeTier(tier)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-700">
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          aria-expanded={advancedOpen}
          className="w-full min-h-[44px] flex items-center justify-between px-4 py-3 text-sm text-gray-300
            hover:text-foreground transition-colors"
        >
          <span>Advanced settings</span>
          <span className="text-gray-500" aria-hidden="true">
            {advancedOpen ? "−" : "+"}
          </span>
        </button>
        {advancedOpen && (
          <div className="px-4 pb-4 space-y-5 border-t border-gray-700 pt-4">
            <div>
              <div className="text-sm font-medium text-gray-300">Voting mechanism</div>
              <p className="text-xs text-gray-500 mt-1">
                MACI — private, collusion-resistant voting using zero-knowledge proofs. The only option available today.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sign-up policy</label>
              <p className="text-xs text-gray-500 mb-2">Controls who can register to vote in this community.</p>
              <select
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value as SignUpPolicyType)}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-foreground text-sm
                  focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {POLICY_TYPE_OPTIONS.map(({ type, label }) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>
              <PolicyArgsFields policyType={policyType} inputs={inputs} updateInput={updateInput} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Allowed poll eligibility methods</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5">
                {ALLOWED_POLICIES.map((policy) => {
                  const id = parseInt(policy.id, 10);
                  const checked = policies.includes(id);
                  return (
                    <label key={policy.id} className="flex items-center gap-2 cursor-pointer group py-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setPolicies((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
                        }
                        className="rounded border-gray-600 bg-gray-800 text-accent focus:ring-accent"
                      />
                      <span
                        className={`text-sm ${checked ? "text-foreground" : "text-gray-400"} group-hover:text-gray-200`}
                      >
                        {policy.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Voting styles</label>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {VOTING_MODES.map((mode) => {
                  const id = parseInt(mode.id, 10);
                  const checked = modes.includes(id);
                  return (
                    <label key={mode.id} className="flex items-center gap-2 cursor-pointer group py-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setModes((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
                        }
                        className="rounded border-gray-600 bg-gray-800 text-accent focus:ring-accent"
                      />
                      <span
                        className={`text-sm ${checked ? "text-foreground" : "text-gray-400"} group-hover:text-gray-200`}
                      >
                        {mode.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {advancedError && <p className="text-xs text-red-400">{advancedError}</p>}
          </div>
        )}
      </div>

      {submitError && <p className="text-xs text-red-400">{submitError}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={goBack}
          disabled={isSubmitting}
          className="flex-1 min-h-[44px] py-2 px-4 rounded-lg border border-gray-600 text-gray-300
            hover:bg-gray-700 transition-colors text-sm disabled:opacity-60"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => void handleNext()}
          disabled={isSubmitting}
          className="flex-1 min-h-[44px] py-2 px-4 rounded-lg bg-accent text-white font-medium
            hover:bg-accent-hover transition-colors text-sm disabled:opacity-60"
        >
          {isSubmitting ? "Creating…" : "Next"}
        </button>
      </div>
    </div>
  );
}
