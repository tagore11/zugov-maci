export type PollStatus = "not_started" | "active" | "closed";

/** startDate/endDate are unix seconds (as strings, matching SubgraphPoll's shape, or numbers). */
export function computePollStatus(
  startDate: string | number,
  endDate: string | number,
  nowSec: number = Date.now() / 1000,
): PollStatus {
  if (nowSec < Number(startDate)) return "not_started";
  if (nowSec < Number(endDate)) return "active";
  return "closed";
}

const POLL_STATUS_LABELS: Record<PollStatus, string> = {
  not_started: "Not started",
  active: "Active",
  closed: "Closed",
};

const POLL_STATUS_CLASSES: Record<PollStatus, string> = {
  not_started: "text-amber-400",
  active: "text-green-400",
  closed: "text-gray-500",
};

const POLL_STATUS_BADGE_CLASSES: Record<PollStatus, string> = {
  not_started: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

export function pollStatusLabel(status: PollStatus): string {
  return POLL_STATUS_LABELS[status];
}

/** Text color for dark backgrounds (community detail page's dark cards, GovernanceActionsList). */
export function pollStatusClass(status: PollStatus): string {
  return POLL_STATUS_CLASSES[status];
}

/** Pill/badge classes for light backgrounds (the expandable proposal list's badge row). */
export function pollStatusBadgeClass(status: PollStatus): string {
  return POLL_STATUS_BADGE_CLASSES[status];
}
