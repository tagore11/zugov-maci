import Link from "next/link";
import { listDecisions } from "@/lib/store";
import { getMechanism } from "@/lib/core/mechanisms";
import { ModelBadge } from "@/components/ModelBadge";
import { Button, Hint, Title } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const decisions = await listDecisions();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">ZuGov</p>
        <h1 className="mt-4 text-[32px] font-medium leading-[1.15] tracking-[-0.02em] md:text-[42px]">
          Ne istediğini kendi cümlelerinle söyle.
          <br />
          Sayımı bize bırak.
        </h1>
        <p className="prose-read mt-6 max-w-[56ch] text-ink-soft">
          Bir topluluk karar alırken iki şeyi kaybeder: neyin neden önerildiğini, ve kimin gerçekten
          ne istediğini. Burada ikisi de kayda geçer. Oylama kuralı en son takılır, ve
          değiştirilebilir.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/yeni">
            <span className="tap inline-block rounded-[10px] border border-accent bg-accent px-5 py-2.5 text-[15px] font-medium text-white">
              Karar aç
            </span>
          </Link>
          <ModelBadge />
        </div>
      </header>

      <section className="mt-14">
        <Title as="h2">Açık kararlar</Title>

        {decisions.length === 0 ? (
          <div className="mt-5 rounded-[16px] border border-dashed border-line-strong px-6 py-10 text-center">
            <p className="text-[16px]">Henüz karar yok.</p>
            <div className="mx-auto mt-2 max-w-[46ch]">
              <Hint>
                İlk kararı açmak için bir başlık, bir gerekçe metni ve en az iki seçenek yeter.
              </Hint>
            </div>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {decisions.map((decision) => (
              <li key={decision.id}>
                <Link
                  href={`/karar/${decision.id}`}
                  className="tap block rounded-[16px] border border-line bg-card px-6 py-5 hover:border-line-strong"
                >
                  <h3 className="text-[17px] font-medium leading-snug">{decision.title}</h3>
                  <p className="mt-2 text-[14px] text-ink-soft">
                    {decision.options.map((o) => o.label).join(" · ")}
                  </p>
                  <p className="mt-3 font-mono text-[11px] tabular-nums text-ink-faint">
                    {getMechanism(decision.mechanismId).name} · {decision.preferences.length} katılımcı
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14 grid gap-6 border-t border-line pt-10 sm:grid-cols-3">
        <Explainer title="Bu cihazda çalışır">
          Model senin bilgisayarında. Yazdıkların dışarı çıkmaz, hiçbir API anahtarı yok.
        </Explainer>
        <Explainer title="Yapay zekanın oyu yok">
          Yardımcı olur, taslak çıkarır, soru sorar. Sayıma girmez, senin onayın olmadan hiçbir şey
          kaydedilmez.
        </Explainer>
        <Explainer title="Kural sonradan değişir">
          Tercihin bir kez yazılır. Topluluk sayım kuralını değiştirirse yeniden oy vermezsin.
        </Explainer>
      </section>
    </main>
  );
}

function Explainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[15px] font-medium">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}
