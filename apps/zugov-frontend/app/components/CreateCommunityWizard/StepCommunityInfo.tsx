import { useEffect, useState } from "react";
import { useChainId } from "wagmi";
import type { UseCreateCommunityResult } from "@/src/hooks/useCreateCommunity";
import * as communityApi from "@/src/services/communityApi";

interface Props {
  initialName?: string;
  initialDescription?: string;
  initialParentCommunityId?: string;
  setCommunityInfo: UseCreateCommunityResult["setCommunityInfo"];
  goBack: UseCreateCommunityResult["goBack"];
}

export function StepCommunityInfo({
  initialName = "",
  initialDescription = "",
  initialParentCommunityId = "",
  setCommunityInfo,
  goBack,
}: Props) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [parentCommunityId, setParentCommunityId] = useState(initialParentCommunityId);
  const [touched, setTouched] = useState(false);
  const [candidateParents, setCandidateParents] = useState<communityApi.Community[]>([]);

  const chainId = useChainId();

  // Local chapters, event teams, and contributor circles nest under a parent community
  // (Lightpaper's "communities and sub-communities" building block). Best-effort: an empty or
  // failed fetch just leaves the picker empty — parent selection is optional.
  useEffect(() => {
    let cancelled = false;
    communityApi
      .list(1, chainId)
      .then(({ communities }) => {
        if (!cancelled) setCandidateParents(communities);
      })
      .catch(() => {
        if (!cancelled) setCandidateParents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [chainId]);

  const nameError = touched && name.trim().length === 0 ? "Community name is required" : undefined;
  const canProceed = name.trim().length > 0 && name.trim().length <= 80;

  const handleNext = () => {
    setTouched(true);
    if (!canProceed) return;
    setCommunityInfo(name.trim(), description.trim(), parentCommunityId || undefined);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white">Community Details</h2>

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
          placeholder="e.g. ZuKas Residency"
          className={`w-full px-3 py-2 rounded-lg bg-gray-800 border text-white placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm
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
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white
            placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">{description.length}/500</p>
      </div>

      {candidateParents.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Parent community <span className="text-gray-500">(optional)</span>
          </label>
          <select
            value={parentCommunityId}
            onChange={(e) => setParentCommunityId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white
              focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="">None — top-level community</option>
            {candidateParents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.displayName}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Nest this as a local chapter, event team, or contributor circle under an existing community.
          </p>
        </div>
      )}

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
          className="flex-1 py-2 px-4 rounded-lg bg-purple-600 text-white font-medium
            hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
