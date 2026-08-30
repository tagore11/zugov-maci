"use client";

import { useEffect, useState } from "react";

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
      .catch(() => alive && setStatus({ available: false, endpoint: "-", model: "-", detail: "kontrol edilemedi" }));
    return () => {
      alive = false;
    };
  }, []);

  if (!status) {
    return <span className="font-mono text-[11px] text-placeholder">model durumu okunuyor</span>;
  }

  return (
    <span className="font-mono text-[11px] text-muted">
      {status.available ? (
        <>
          <span style={{ color: "var(--success)" }}>{status.model}</span> bu cihazda çalışıyor
        </>
      ) : (
        <>model kapalı, kural tabanlı yedek devrede ({status.detail})</>
      )}
    </span>
  );
}
