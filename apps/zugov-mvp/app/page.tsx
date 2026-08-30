import Link from "next/link";
import { listDecisions } from "@/lib/store";
import { getMechanism } from "@/lib/core/mechanisms";
import { ModelBadge } from "@/components/ModelBadge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const decisions = await listDecisions();

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <header className="border-b border-line pb-10">
        <h1 className="font-display text-[40px] font-bold leading-[1.1] tracking-tight">ZuGov</h1>
        <p className="mt-4 max-w-[60ch] text-[16px] leading-relaxed text-muted-strong">
          Bir topluluk karar alırken iki şeyi kaybeder: neyin neden önerildiğini ve kimin gerçekten
          ne istediğini. Bu araç ikisini de kayda geçirir, sonra oylama kuralını üstüne takar.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href="/yeni"
            className="rounded-[6px] px-4 py-2 text-[15px] font-medium text-white transition-colors duration-150 active:translate-y-[1px]"
            style={{ background: "var(--accent)" }}
          >
            Karar aç
          </Link>
          <ModelBadge />
        </div>
      </header>

      <section className="py-10">
        <h2 className="font-display text-[20px] font-semibold">Açık kararlar</h2>

        {decisions.length === 0 ? (
          <div className="mt-6 rounded-[10px] border border-dashed border-line px-6 py-10">
            <p className="text-[15px] text-muted-strong">Henüz karar yok.</p>
            <p className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-muted">
              İlk kararı açtığında bir başlık, bir gerekçe metni ve en az iki seçenek istenir.
              Oylama kuralını sonradan değiştirebilirsin, kimsenin tercihi silinmez.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {decisions.map((decision) => (
              <li key={decision.id}>
                <Link
                  href={`/karar/${decision.id}`}
                  className="block rounded-[10px] border border-line bg-surface px-6 py-5 transition-colors duration-150 hover:border-line-strong"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="font-display text-[16px] font-semibold">{decision.title}</h3>
                    <span className="font-mono text-[11px] tabular-nums text-muted">
                      {decision.preferences.length} katılımcı
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-muted">
                    {decision.options.map((o) => o.label).join("  ·  ")}
                  </p>
                  <p className="mt-3 font-mono text-[11px] text-placeholder">
                    kural: {getMechanism(decision.mechanismId).name}
                    {decision.grounding ? `  ·  rapor ${decision.grounding.digest}` : "  ·  rapor yok"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="border-t border-line pt-8 text-[13px] leading-relaxed text-muted">
        <p className="max-w-[65ch]">
          Model bu bilgisayarda çalışır, yazdıkların dışarı çıkmaz. Yerel model kapalıyken uygulama
          çalışmaya devam eder, sadece taslak çıkarma kabalaşır. Yapay zekanın oy hakkı yoktur;
          sayım yolu rapora hiç bakmaz.
        </p>
      </footer>
    </main>
  );
}
