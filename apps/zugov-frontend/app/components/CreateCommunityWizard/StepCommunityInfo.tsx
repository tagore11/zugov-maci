import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { UseCreateCommunityResult } from "@/src/hooks/useCreateCommunity";
import * as communityApi from "@/src/services/communityApi";
import type { CommunityCategory } from "@/src/services/communityApi";
import { CommunitySearchInput } from "../CommunitySearchInput";

interface Props {
  initialName?: string;
  initialDescription?: string;
  initialParentCommunityId?: string;
  initialCategory?: CommunityCategory;
  setCommunityInfo: UseCreateCommunityResult["setCommunityInfo"];
  goBack: UseCreateCommunityResult["goBack"];
}

export function StepCommunityInfo({
  initialName = "",
  initialDescription = "",
  initialParentCommunityId = "",
  initialCategory,
  setCommunityInfo,
  goBack,
}: Props) {
  const { address } = useAccount();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [parentCommunityId, setParentCommunityId] = useState(initialParentCommunityId);
  const [category, setCategory] = useState<CommunityCategory | "">(initialCategory ?? "");
  const [touched, setTouched] = useState(false);

  // Categories are DB-driven (GET /api/categories), not hardcoded — adding a category is a
  // direct DB insert, not a code change (formalize-communities epic, Child C1, /plan-eng-review
  // 2026-08-24/25). staleTime: Infinity: no admin UI exists to change this list at runtime, so
  // there's no user-facing staleness risk, and it saves a redundant round-trip on every wizard
  // open. isError (not just an empty list) distinguishes "genuinely no categories" from "the
  // fetch failed" — a silently empty dropdown would leave the user unable to tell whether to
  // retry or report a bug.
  const {
    data: categoryOptions = [],
    isError: categoriesFailed,
    refetch: retryCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: communityApi.listCategories,
    staleTime: Infinity,
  });

  const nameError = touched && name.trim().length === 0 ? "Community name is required" : undefined;
  const canProceed = name.trim().length > 0 && name.trim().length <= 80;

  const handleNext = () => {
    setTouched(true);
    if (!canProceed) return;
    setCommunityInfo(name.trim(), description.trim(), parentCommunityId || undefined, category || undefined);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-foreground">Community Details</h2>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Community name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="ZuKas"
          className={`w-full px-3 py-2 rounded-lg bg-gray-800 border text-foreground placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-accent text-sm
            ${nameError ? "border-red-500" : "border-gray-600"}`}
        />
        {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
        <p className="mt-1 text-xs text-gray-500">{name.length}/80</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description <span className="text-gray-500">(optional)</span>
        </label>
        <textarea
          value={description}
          maxLength={500}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your community's purpose…"
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-foreground
            placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent text-sm resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">{description.length}/500</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Category <span className="text-gray-500">(optional)</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CommunityCategory | "")}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-foreground
            focus:outline-none focus:ring-2 focus:ring-accent text-sm"
        >
          <option value="">No category</option>
          {categoryOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        {categoriesFailed ? (
          <p className="mt-1 text-xs text-red-400">
            Couldn&apos;t load categories —{" "}
            <button type="button" onClick={() => void retryCategories()} className="underline hover:text-red-300">
              retry
            </button>
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">Shown on the community explorer so others can filter by type.</p>
        )}
      </div>

      <div>
        <label htmlFor="parent-community-search" className="block text-sm font-medium text-gray-300 mb-1">
          Parent community <span className="text-gray-500">(optional)</span>
        </label>
        {/* Bug fix (2026-08-28) — extracted into a shared CommunitySearchInput so InviteToUnionForm
            (UnionMembershipSection.tsx) can reuse this exact search-by-name UX instead of a raw
            community-ID text field. Fails CLOSED per D2 above: searchEnabled={!!address} keeps
            the wizard's original "no results while wallet resolving" guard intact. */}
        <CommunitySearchInput
          id="parent-community-search"
          selectedId={parentCommunityId}
          onSelect={(parent) => setParentCommunityId(parent?.id ?? "")}
          authorizedFor={address}
          searchEnabled={!!address}
          noneOption={{ label: "None — top-level community" }}
          helpText="Nest this as a local chapter, event team, or contributor circle under an existing community."
        />
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
          disabled={!canProceed}
          className="flex-1 py-2 px-4 rounded-lg bg-accent text-white font-medium
            hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
