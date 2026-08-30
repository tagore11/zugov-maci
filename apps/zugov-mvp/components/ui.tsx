import type { ReactNode } from "react";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[10px] border border-line bg-surface p-6 ${className}`}>{children}</section>
  );
}

export function SectionTitle({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="font-display text-[20px] font-semibold">{children}</h2>
      {note ? <span className="font-mono text-[11px] text-muted">{note}</span> : null}
    </div>
  );
}

export function Meter({ value, tone = "accent" }: { value: number; tone?: "accent" | "muted" }) {
  const width = `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
  return (
    <span className="block h-[3px] w-full max-w-40 bg-line">
      <span
        className="block h-full"
        style={{ width, background: tone === "accent" ? "var(--accent)" : "var(--gray-500)" }}
      />
    </span>
  );
}
