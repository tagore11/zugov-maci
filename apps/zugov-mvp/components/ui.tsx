import type { CSSProperties, ReactNode } from "react";

/*
 * Grouping is done with space first and a hairline second. A card is used only
 * where something genuinely sits above the page. Radius is 2px, one value,
 * everywhere. See DESIGN-RULES.md.
 */

export function Panel({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section style={style} className={`rounded-[2px] border border-line bg-card p-6 md:p-8 ${className}`}>
      {children}
    </section>
  );
}

export function Title({ children, as: Tag = "h2" }: { children: ReactNode; as?: "h1" | "h2" | "h3" }) {
  const size =
    Tag === "h1" ? "text-[28px] md:text-[34px]" : Tag === "h2" ? "text-[21px] md:text-[24px]" : "text-[17px]";
  return <Tag className={`${size} font-semibold leading-[1.25] tracking-[-0.01em]`}>{children}</Tag>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="max-w-[62ch] text-[14px] leading-relaxed text-ink-soft">{children}</p>;
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
      ? "bg-ink text-on-ink border-ink"
      : kind === "quiet"
        ? "bg-card text-ink border-line-strong hover:bg-sunk"
        : "bg-transparent text-ink-soft border-transparent hover:text-ink";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`tap min-h-[44px] rounded-[2px] border px-5 text-[15px] font-medium disabled:opacity-40 ${style}`}
    >
      {children}
    </button>
  );
}

export function Steps({ labels, current }: { labels: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap gap-x-5 gap-y-1 border-b border-line pb-3">
      {labels.map((label, index) => (
        <li
          key={label}
          aria-current={index === current ? "step" : undefined}
          className="text-[13px]"
          style={{
            color: index === current ? "var(--ink)" : "var(--ink-faint)",
            fontWeight: index === current ? 600 : 400,
          }}
        >
          <span className="font-mono">{index + 1}</span> {label}
        </li>
      ))}
    </ol>
  );
}
