"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";
import type { MechanismId } from "@/lib/core/types";
import { copy } from "@/lib/copy";

const MECHANISM_CHOICES: Array<{ id: MechanismId; name: string; when: string }> = (
  Object.entries(copy.newDecision.mechanismChoices) as [MechanismId, { name: string; when: string }][]
).map(([id, choice]) => ({ id, ...choice }));

export default function NewDecisionPage() {
  return (
    <Suspense fallback={null}>
      <NewDecisionForm />
    </Suspense>
  );
}

function NewDecisionForm() {
  const router = useRouter();
  const communityId = useSearchParams().get("topluluk") ?? "";
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [mechanismId, setMechanismId] = useState<MechanismId>("approval");
  const [showRules, setShowRules] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId, title, body, options, mechanismId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? copy.newDecision.openFailed);
      router.push(`/karar/${data.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.newDecision.unknownError);
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      <Link
        href={communityId ? `/topluluk/${communityId}` : "/"}
        className="tap text-[14px] text-ink-soft underline underline-offset-4"
      >
        {copy.newDecision.back}
      </Link>

      <h1 className="mt-6 text-[32px] font-medium leading-[1.15] tracking-[-0.02em] md:text-[38px]">
        {copy.newDecision.heading}
      </h1>

      <div className="mt-10 space-y-8">
        <label className="block">
          <span className="mb-2 block text-[14px] font-medium">{copy.newDecision.titleLabel}</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={copy.newDecision.titlePlaceholder}
            className="w-full rounded-[2px] border border-line bg-sunk px-4 py-3 text-[16px] placeholder:text-ink-faint focus:border-ink focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[14px] font-medium">{copy.newDecision.bodyLabel}</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder={copy.newDecision.bodyPlaceholder}
            className="w-full rounded-[2px] border border-line bg-sunk px-4 py-3 text-[16px] leading-relaxed placeholder:text-ink-faint focus:border-ink focus:outline-none"
          />

        </label>

        <fieldset>
          <legend className="mb-2 text-[14px] font-medium">{copy.newDecision.optionsLabel}</legend>
          <div className="space-y-2">
            {options.map((option, index) => (
              <input
                key={index}
                value={option}
                onChange={(e) =>
                  setOptions((current) => current.map((o, i) => (i === index ? e.target.value : o)))
                }
                placeholder={copy.newDecision.optionPlaceholder(index + 1)}
                className="w-full rounded-[2px] border border-line bg-sunk px-4 py-3 text-[16px] placeholder:text-ink-faint focus:border-ink focus:outline-none"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOptions((current) => [...current, ""])}
            className="mt-3 tap text-[14px] text-ink-soft underline underline-offset-4"
          >
            {copy.newDecision.addOption}
          </button>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-[14px] font-medium">{copy.newDecision.ruleLabel}</legend>
          <p className="mb-3 max-w-[60ch] text-[14px] text-ink-soft">{copy.newDecision.ruleHint}</p>
          <div className="grid gap-2 md:grid-cols-2">
            {MECHANISM_CHOICES.map((choice) => {
              const active = choice.id === mechanismId;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => setMechanismId(choice.id)}
                  aria-pressed={active}
                  className="tap rounded-[2px] border px-4 py-3 text-left"
                  style={{
                    borderColor: active ? "var(--ink)" : "var(--line)",
                    background: active ? "var(--sunk)" : "var(--card)",
                  }}
                >
                  <span className="block text-[16px] font-medium">{choice.name}</span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-ink-soft">{choice.when}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {error ? <p className="text-[13px]" style={{ color: "var(--alarm)" }}>{error}</p> : null}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="tap min-h-[44px] rounded-[2px] border border-ink bg-ink px-5 text-[15px] font-medium text-on-ink disabled:opacity-40"
        >
          {busy ? copy.newDecision.opening : copy.newDecision.open}
        </button>
      </div>
    </main>
  );
}
