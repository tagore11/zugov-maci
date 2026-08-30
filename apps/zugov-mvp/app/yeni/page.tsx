"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type { MechanismId } from "@/lib/core/types";

const MECHANISM_CHOICES: Array<{ id: MechanismId; name: string; when: string }> = [
  { id: "approval", name: "Onay", when: "Birden fazla seçenek aynı anda kabul edilebiliyorsa." },
  { id: "ranked", name: "Sıralama", when: "Tek bir kazanan çıkacaksa ve oylar bölünecekse." },
  { id: "quadratic", name: "Ağırlık", when: "Bazıları için hayati, bazıları için önemsiz bir konuysa." },
  { id: "consent", name: "Rıza", when: "Herkesin birlikte yaşayabileceği bir sonuç arıyorsan." },
  { id: "allocate", name: "Paylaştırma", when: "Kazanan değil, bir bütçe ya da kaynak bölüşülecekse." },
];

export default function NewDecisionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [mechanismId, setMechanismId] = useState<MechanismId>("approval");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, options, mechanismId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Karar açılamadı.");
      router.push(`/karar/${data.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bilinmeyen hata.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <Link href="/" className="font-mono text-[11px] text-muted underline underline-offset-4 hover:text-muted-strong">
        geri
      </Link>

      <h1 className="mt-6 font-display text-[40px] font-bold leading-[1.1] tracking-tight">Karar aç</h1>

      <div className="mt-10 space-y-8">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-muted-strong">Karar başlığı</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ortak alanın bütçesi nereye gitsin?"
            className="w-full rounded-[6px] border border-line bg-raised px-3 py-2 text-[15px] text-foreground placeholder:text-placeholder focus:border-accent focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-muted-strong">Gerekçe metni</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Neden karar veriyoruz, hangi kısıtlar var, hangi bilgi elimizde yok."
            className="w-full rounded-[6px] border border-line bg-raised px-3 py-2 text-[15px] leading-relaxed text-foreground placeholder:text-placeholder focus:border-accent focus:outline-none"
          />
          <span className="mt-2 block text-[13px] text-muted">
            Sorgulama raporu bu metni okur. Ne kadar somut yazarsan rapor o kadar işe yarar.
          </span>
        </label>

        <fieldset>
          <legend className="mb-2 text-[13px] font-medium text-muted-strong">Seçenekler</legend>
          <div className="space-y-2">
            {options.map((option, index) => (
              <input
                key={index}
                value={option}
                onChange={(e) =>
                  setOptions((current) => current.map((o, i) => (i === index ? e.target.value : o)))
                }
                placeholder={`Seçenek ${index + 1}`}
                className="w-full rounded-[6px] border border-line bg-raised px-3 py-2 text-[15px] text-foreground placeholder:text-placeholder focus:border-accent focus:outline-none"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOptions((current) => [...current, ""])}
            className="mt-3 font-mono text-[11px] text-muted underline underline-offset-4 hover:text-muted-strong"
          >
            seçenek ekle
          </button>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-[13px] font-medium text-muted-strong">Sayım kuralı</legend>
          <p className="mb-3 max-w-[60ch] text-[13px] text-muted">
            Şimdi seçtiğin kural kesin değil. Herkes tercihini bir kez yazar, kuralı sonra
            değiştirirsen kimsenin yeniden oy vermesi gerekmez.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {MECHANISM_CHOICES.map((choice) => {
              const active = choice.id === mechanismId;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => setMechanismId(choice.id)}
                  aria-pressed={active}
                  className="rounded-[8px] border px-4 py-3 text-left transition-colors duration-150"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--gray-700)",
                    background: active ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
                  }}
                >
                  <span className="block font-display text-[15px] font-semibold">{choice.name}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-muted">{choice.when}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {error ? <p className="text-[13px]" style={{ color: "var(--error)" }}>{error}</p> : null}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="rounded-[6px] px-4 py-2 text-[15px] font-medium text-white transition-colors duration-150 active:translate-y-[1px] disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          {busy ? "Açılıyor" : "Kararı aç"}
        </button>
      </div>
    </main>
  );
}
