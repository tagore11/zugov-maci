// Events expansion Approach B (2026-08-27, D6) — extracted from EventsSection.tsx's
// DuplicateForm; reused by both DuplicateForm (post-creation) and CreateEventModal's new
// creation-time Repeat section. Bounds match today's exact tested contract, no new restriction
// (outside-voice fix): count 1-52 (matches MAX_DUPLICATE_COUNT), intervalDays min(1) only — no
// upper bound, same as duplicateEventSchema today.
export function RepeatFields({
  count,
  onCountChange,
  intervalDays,
  onIntervalDaysChange,
}: {
  count: number;
  onCountChange: (count: number) => void;
  intervalDays: number;
  onIntervalDaysChange: (intervalDays: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-1.5 text-gray-400">
        Repeat
        <input
          type="number"
          min={1}
          max={52}
          value={count}
          onChange={(e) => onCountChange(Number(e.target.value))}
          className="w-14 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-foreground"
          aria-label="Number of additional occurrences"
        />
        times
      </label>
      <label className="flex items-center gap-1.5 text-gray-400">
        every
        <input
          type="number"
          min={1}
          value={intervalDays}
          onChange={(e) => onIntervalDaysChange(Number(e.target.value))}
          className="w-14 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-foreground"
          aria-label="Interval in days"
        />
        days
      </label>
    </div>
  );
}
