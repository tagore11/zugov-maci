// formalize-communities epic, Child J (/plan-eng-review 2026-08-26, D6-equivalent frontend DRY
// extraction) — this exact toggle+checkbox-list block was first built for CreateEventModal.tsx
// (Child I, D5) and would otherwise become a second copy here for the discussions create/edit
// form. Presentational only: an explicit "Restrict to specific tiers" toggle rather than a bare
// checkbox list, since a bare list can't distinguish "unrestricted" (nothing checked) from
// "restricted to nothing" (nothing checked, but the toggle was flipped on) on either the way in
// (submit) or the way out (pre-filling an edit form).
interface Tier {
  id: string;
  label: string;
}

interface TierRestrictionPickerProps {
  tiers: Tier[];
  isRestricted: boolean;
  onIsRestrictedChange: (value: boolean) => void;
  selectedTierIds: string[];
  onToggleTier: (tierId: string) => void;
}

export function TierRestrictionPicker({
  tiers,
  isRestricted,
  onIsRestrictedChange,
  selectedTierIds,
  onToggleTier,
}: TierRestrictionPickerProps) {
  const hasValidSelection = !isRestricted || selectedTierIds.length > 0;

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <input
          type="checkbox"
          checked={isRestricted}
          onChange={(e) => onIsRestrictedChange(e.target.checked)}
          className="rounded border-gray-600 bg-gray-800 text-accent focus:ring-accent"
        />
        Restrict to specific tiers
      </label>
      {isRestricted && (
        <div className="space-y-1 mt-2 pl-1">
          {tiers.length === 0 ? (
            <p className="text-xs text-gray-400">This community has no tiers yet.</p>
          ) : (
            tiers.map((tier) => (
              <label key={tier.id} className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={selectedTierIds.includes(tier.id)}
                  onChange={() => onToggleTier(tier.id)}
                  className="rounded border-gray-600 bg-gray-800 text-accent focus:ring-accent"
                />
                {tier.label}
              </label>
            ))
          )}
          {!hasValidSelection && <p className="text-xs text-error">Select at least one tier.</p>}
        </div>
      )}
    </div>
  );
}
