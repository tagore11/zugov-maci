"use client";

import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";

interface Status {
  available: boolean;
  endpoint: string;
  model: string;
  detail: string;
}

/**
 * Where the reasoning is running. Kept visible at all times, because a person
 * has a right to know whether a machine touched what they are reading and
 * whether it was their machine.
 */
export function ModelBadge() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/model")
      .then((r) => r.json())
      .then((s: Status) => alive && setStatus(s))
      .catch(() => alive && setStatus({ available: false, endpoint: "-", model: "-", detail: copy.modelBadge.checkFailed }));
    return () => {
      alive = false;
    };
  }, []);

  if (!status) {
    return <span className="font-mono text-[11px] text-ink-faint">{copy.modelBadge.checking}</span>;
  }

  return (
    <span className="font-mono text-[11px] text-ink-faint">
      {status.available ? (
        <>
          <span className="font-medium">{status.model}</span> {copy.modelBadge.localSuffix}
        </>
      ) : (
        <>{copy.modelBadge.fallback(status.detail)}</>
      )}
    </span>
  );
}
