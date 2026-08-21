import { useEffect, useState } from "react";
import type { UseCreateCommunityResult } from "@/src/hooks/useCreateCommunity";
import * as communityApi from "@/src/services/communityApi";
import type { CommunityCategory } from "@/src/services/communityApi";

const CATEGORY_OPTIONS: { value: CommunityCategory; label: string }[] = [
  { value: "residency", label: "Residency" },
  { value: "pop_up_city", label: "Pop-up City" },
  { value: "network_state", label: "Network State" },
  { value: "social", label: "Social" },
  { value: "regional", label: "Regional" },
];

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
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [parentCommunityId, setParentCommunityId] = useState(initialParentCommunityId);
  const [category, setCategory] = useState<CommunityCategory | "">(initialCategory ?? "");
  const [touched, setTouched] = useState(false);

  // Searchable parent-community combobox (community creation wizard fix, 2026-08-21). Search
  // runs server-side (communityApi.list's new `search` param) rather than filtering client-side
  // over one paginated fetch — a client-side-only filter would silently exclude any parent past
  // the first page, which is exactly the bug this replaces (/plan-eng-review outside-voice
  // finding). Deliberately no chainId filter passed to list(): chainId lives on
  // maciGovernanceConfigs, so filtering by it silently excludes every ungoverned community from
  // ever being selectable as a parent (governance-restructure Phase 1 review, confirmed bug).
  const [parentQuery, setParentQuery] = useState("");
  const [parentResults, setParentResults] = useState<communityApi.Community[]>([]);
  const [parentDropdownOpen, setParentDropdownOpen] = useState(false);
  const [parentSearchLoading, setParentSearchLoading] = useState(false);

  // Resolve the already-selected parent's display name once, on mount — relevant when this step
  // re-renders with a parent already chosen (e.g. the user hit Back after picking one), since the
  // combobox's text input needs a name to show, not just the id.
  useEffect(() => {
    if (!initialParentCommunityId) return;
    let cancelled = false;
    communityApi
      .get(initialParentCommunityId)
      .then((community) => {
        if (!cancelled && community) setParentQuery(community.displayName);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialParentCommunityId]);

  useEffect(() => {
    if (!parentDropdownOpen) return;
    let cancelled = false;
    setParentSearchLoading(true);
    const timer = setTimeout(() => {
      communityApi
        .list(1, undefined, undefined, parentQuery)
        .then(({ communities }) => {
          if (!cancelled) setParentResults(communities);
        })
        .catch(() => {
          if (!cancelled) setParentResults([]);
        })
        .finally(() => {
          if (!cancelled) setParentSearchLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [parentQuery, parentDropdownOpen]);

  function handleSelectParent(parent: communityApi.Community | null) {
    if (parent) {
      setParentCommunityId(parent.id);
      setParentQuery(parent.displayName);
    } else {
      setParentCommunityId("");
      setParentQuery("");
    }
    setParentDropdownOpen(false);
  }

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
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">Shown on the community explorer so others can filter by type.</p>
      </div>

      <div>
        <label htmlFor="parent-community-search" className="block text-sm font-medium text-gray-300 mb-1">
          Parent community <span className="text-gray-500">(optional)</span>
        </label>
        <div className="relative">
          <input
            id="parent-community-search"
            type="text"
            value={parentQuery}
            onChange={(e) => {
              setParentQuery(e.target.value);
              setParentCommunityId("");
              setParentDropdownOpen(true);
            }}
            onFocus={() => setParentDropdownOpen(true)}
            onBlur={() => {
              // Delayed so a click on a dropdown option below registers before it unmounts.
              setTimeout(() => setParentDropdownOpen(false), 150);
            }}
            placeholder="Search communities…"
            autoComplete="off"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-foreground
              placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          />
          {parentDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-600 bg-gray-800 shadow-lg">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectParent(null)}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                None — top-level community
              </button>
              {parentSearchLoading && <p className="px-3 py-2 text-xs text-gray-500">Searching…</p>}
              {!parentSearchLoading && parentResults.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-500">No matching communities</p>
              )}
              {!parentSearchLoading &&
                parentResults.map((parent) => (
                  <button
                    key={parent.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectParent(parent)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-gray-700"
                  >
                    {parent.displayName}
                  </button>
                ))}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Nest this as a local chapter, event team, or contributor circle under an existing community.
        </p>
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
