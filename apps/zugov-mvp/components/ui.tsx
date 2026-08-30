import type { CSSProperties, ReactNode } from "react";

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section style={style} className={`rounded-[16px] border border-line bg-card p-6 md:p-8 ${className}`}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">{children}</p>;
}

export function Title({ children, as: Tag = "h2" }: { children: ReactNode; as?: "h1" | "h2" | "h3" }) {
  const size = Tag === "h1" ? "text-[30px] md:text-[38px]" : Tag === "h2" ? "text-[22px] md:text-[26px]" : "text-[18px]";
  return <Tag className={`${size} font-medium leading-[1.2] tracking-[-0.01em]`}>{children}</Tag>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="max-w-[60ch] text-[14px] leading-relaxed text-ink-soft">{children}</p>;
}

export function Button({
  children,
  onClick,
  kind = "primary",
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: "primary" | "quiet" | "plain";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const style =
    kind === "primary"
      ? "bg-accent text-white border-accent"
      : kind === "quiet"
        ? "bg-card text-ink border-line-strong hover:bg-sunk"
        : "bg-transparent text-ink-soft border-transparent hover:text-ink";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`tap rounded-[10px] border px-5 py-2.5 text-[15px] font-medium disabled:opacity-40 ${style}`}
    >
      {children}
    </button>
  );
}

export function Steps({ labels, current }: { labels: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {labels.map((label, index) => {
        const state = index < current ? "done" : index === current ? "now" : "next";
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className="text-[13px]"
              style={{
                color: state === "next" ? "var(--ink-faint)" : state === "now" ? "var(--accent)" : "var(--ink-soft)",
                fontWeight: state === "now" ? 600 : 400,
              }}
            >
              {label}
            </span>
            {index < labels.length - 1 ? <span className="text-ink-faint">·</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
