import { useEffect, useState } from "react";

const DEFAULT_INTERVAL_MS = 20_000;

/**
 * A ticking `Date.now()`-backed value, so time-derived UI (e.g. poll active/inactive status)
 * updates on its own as real time passes, without a data refetch.
 */
export function useNow(intervalMs: number = DEFAULT_INTERVAL_MS): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
