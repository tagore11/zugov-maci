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
    <main className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      <Link href="/" className="tap text-[14px] text-ink-soft underline underline-offset-4">
        geri
      </Link>

      <h1 className="mt-6 text-[32px] font-medium leading-[1.15] tracking-[-0.02em] md:text-[38px]">Karar aç</h1>

      <div className="mt-10 space-y-8">
        <label className="block">
          <span className="mb-2 block text-[14px] font-medium">Karar başlığı</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ortak alanın bütçesi nereye gitsin?"
            className="w-full rounded-[10px] border border-line bg-sunk px-4 py-3 text-[16px] placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[14px] font-medium">Gerekçe metni</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Neden karar veriyoruz, hangi kısıtlar var, hangi bilgi elimizde yok."
            className="w-full rounded-[10px] border border-line bg-sunk px-4 py-3 text-[16px] leading-relaxed placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
          <span className="mt-2 block text-[14px] text-ink-soft">
            Sorgulama raporu bu metni okur. Ne kadar somut yazarsan rapor o kadar işe yarar.
          </span>
        </label>

        <fieldset>
          <legend className="mb-2 text-[14px] font-medium">Seçenekler</legend>
          <div className="space-y-2">
            {options.map((option, index) => (
              <input
                key={index}
                value={option}
                onChange={(e) =>
                  setOptions((current) => current.map((o, i) => (i === index ? e.target.value : o)))
                }
                placeholder={`Seçenek ${index + 1}`}
                className="w-full rounded-[10px] border border-line bg-sunk px-4 py-3 text-[16px] placeholder:text-ink-faint focus:border-accent focus:outline-none"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOptions((current) => [...current, ""])}
            className="mt-3 tap text-[14px] text-ink-soft underline underline-offset-4"
          >
            seçenek ekle
          </button>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-[14px] font-medium">Sayım kuralı</legend>
          <p className="mb-3 max-w-[60ch] text-[14px] text-ink-soft">
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
                  className="tap rounded-[12px] border px-4 py-3 text-left"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--line)",
                    background: active ? "var(--accent-soft)" : "var(--card)",
                  }}
                >
                  <span className="block text-[16px] font-medium">{choice.name}</span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-ink-soft">{choice.when}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {error ? <p className="text-[13px]" style={{ color: "var(--no)" }}>{error}</p> : null}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="tap rounded-[10px] border border-accent px-5 py-2.5 text-[15px] font-medium text-white disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          {busy ? "Açılıyor" : "Kararı aç"}
        </button>
      </div>
    </main>
  );
}
