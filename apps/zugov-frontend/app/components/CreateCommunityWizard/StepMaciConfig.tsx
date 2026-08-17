import { useState } from "react";
import { ALLOWED_POLICIES, VOTING_MODES } from "@/app/lib/placeholder-data";
import { type SignUpPolicyType, type SignUpPolicyArgs } from "@/src/config";
import type { UseCreateCommunityResult } from "@/src/hooks/useCreateCommunity";
import {
  POLICY_TYPE_OPTIONS,
  DEFAULT_POLICY_INPUTS,
  buildPolicyArgs,
  PolicyArgsFields,
  type PolicyInputState,
} from "@/app/components/PolicyArgsFields";

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
  const [inputs, setInputs] = useState<PolicyInputState>(DEFAULT_POLICY_INPUTS);
  const [submitted, setSubmitted] = useState(false);

  function updateInput(key: keyof PolicyInputState, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  const policiesError = submitted && policies.length === 0 ? "Select at least one voter eligibility method" : undefined;
  const modesError = submitted && modes.length === 0 ? "Select at least one voting style" : undefined;
  const policyArgsError =
    submitted && buildPolicyArgs(policyType, inputs) === null ? "Fill in all required policy fields" : undefined;

  function handleNext() {
    setSubmitted(true);
    const signUpPolicy = buildPolicyArgs(policyType, inputs);
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
          {POLICY_TYPE_OPTIONS.map(({ type, label }) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1.5">
          {POLICY_TYPE_OPTIONS.find(({ type }) => type === policyType)?.description}
        </p>

        <PolicyArgsFields policyType={policyType} inputs={inputs} updateInput={updateInput} />
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
