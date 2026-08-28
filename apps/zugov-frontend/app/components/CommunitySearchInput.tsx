import { useEffect, useState } from "react";
import * as communityApi from "@/src/services/communityApi";

// Bug fix (2026-08-28) — extracted from CreateCommunityWizard/StepCommunityInfo.tsx's parent-
// community combobox (2026-08-21) so InviteToUnionForm (UnionMembershipSection.tsx) can reuse the
// same search-by-name UX instead of asking for a raw community ID with no confirmation of what
// it resolves to. Search runs server-side (communityApi.list's `search` param), not client-side
// over one paginated fetch — a client-side-only filter would silently exclude any match past the
// first page.
export function CommunitySearchInput({
  id,
  selectedId,
  onSelect,
  authorizedFor,
  searchEnabled = true,
  placeholder = "Search communities…",
  noneOption,
  helpText,
  disabled = false,
}: {
  id: string;
  selectedId: string;
  onSelect: (community: communityApi.Community | null) => void;
  // Filters results to communities the given wallet is authorized on (creator or
  // canManageMembership tier holder). Omit for an unrestricted search across every community —
  // union invites can target any community, not just ones the inviter administers.
  authorizedFor?: string;
  // Fails CLOSED, not open (original wizard behavior, formalize-communities epic Child E,
  // /plan-eng-review 2026-08-25, D2): a caller using `authorizedFor` must pass `false` here while
  // the wallet address it depends on is still resolving, so the search clears to empty instead of
  // silently falling back to an unrestricted public list at exactly the moment that matters.
  // Callers with no authorizedFor filter (e.g. a union invite) never need to set this.
  searchEnabled?: boolean;
  placeholder?: string;
  // When provided, shown as the first dropdown option, selecting `null` via onSelect. Omit
  // entirely for flows (like a union invite) where "no target" isn't a valid choice.
  noneOption?: { label: string };
  helpText?: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<communityApi.Community[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Resolve an already-selected id's display name once, on mount — relevant when this renders
  // with a value already chosen (e.g. the wizard's Back button). Matches the original component's
  // exact behavior: only resolves on mount, not on every external selectedId change.
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    communityApi
      .get(selectedId)
      .then((community) => {
        if (!cancelled && community) setQuery(community.displayName);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    if (!searchEnabled) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    const timer = setTimeout(() => {
      communityApi
        .list(1, undefined, undefined, query, authorizedFor)
        .then(({ communities }) => {
          if (!cancelled) setResults(communities);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearchLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, dropdownOpen, authorizedFor, searchEnabled]);

  function handleSelect(community: communityApi.Community | null) {
    if (community) {
      onSelect(community);
      setQuery(community.displayName);
    } else {
      onSelect(null);
      setQuery("");
    }
    setDropdownOpen(false);
  }

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSelect(null);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => {
            // Delayed so a click on a dropdown option below registers before it unmounts.
            setTimeout(() => setDropdownOpen(false), 150);
          }}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-foreground
            placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent text-sm disabled:opacity-60"
        />
        {dropdownOpen && (
          <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-600 bg-gray-800 shadow-lg">
            {noneOption && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(null)}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                {noneOption.label}
              </button>
            )}
            {searchLoading && <p className="px-3 py-2 text-xs text-gray-500">Searching…</p>}
            {!searchLoading && results.length === 0 && (
              <p className="px-3 py-2 text-xs text-gray-500">No matching communities</p>
            )}
            {!searchLoading &&
              results.map((community) => (
                <button
                  key={community.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(community)}
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-gray-700"
                >
                  {community.displayName}
                </button>
              ))}
          </div>
        )}
      </div>
      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}
