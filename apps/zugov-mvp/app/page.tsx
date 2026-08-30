import Link from "next/link";
import { listDecisions } from "@/lib/store";
import { getMechanism } from "@/lib/core/mechanisms";
import { ModelBadge } from "@/components/ModelBadge";
import { Hint, Title } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const decisions = await listDecisions();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      <header className="border-b border-line pb-10">
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-faint">ZuGov</p>
        <h1 className="mt-5 max-w-[18ch] text-[30px] font-semibold leading-[1.2] tracking-[-0.02em] md:text-[38px]">
          Ne istediğini kendi cümlelerinle söyle, sayımı bize bırak.
        </h1>
        <p className="prose-read mt-5 max-w-[58ch] text-ink-soft">
          Bir topluluk karar alırken iki şeyi kaybeder: neyin neden önerildiğini, ve kimin gerçekten
          ne istediğini. Burada ikisi de kayda geçer. Oylama kuralı en son takılır, ve
          değiştirilebilir.
        </p>

        <div className="mt-8">
          <Link href="/yeni">
            <span className="tap inline-flex min-h-[44px] items-center rounded-[2px] border border-ink bg-ink px-5 text-[15px] font-medium text-on-ink">
              Karar aç
            </span>
          </Link>
        </div>
      </header>

      <section className="py-10">
        <Title as="h2">Açık kararlar</Title>

        {decisions.length === 0 ? (
          <div className="mt-5 border-t border-line pt-6">
            <p className="text-[16px]">Henüz karar yok.</p>
            <div className="mt-2">
              <Hint>
                İlk kararı açmak için bir başlık, bir gerekçe metni ve en az iki seçenek yeter.
              </Hint>
            </div>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-[color:var(--line)] border-y border-line">
            {decisions.map((decision) => (
              <li key={decision.id}>
                <Link
                  href={`/karar/${decision.id}`}
                  className="tap block py-5 hover:bg-sunk"
                >
                  <h3 className="text-[17px] font-medium leading-snug">{decision.title}</h3>
                  <p className="mt-1.5 text-[14px] text-ink-soft">
                    {decision.options.map((o) => o.label).join(", ")}
                  </p>
                  <p className="mt-2 font-mono text-[12px] tabular-nums text-ink-faint">
                    {getMechanism(decision.mechanismId).name} kuralı, {decision.preferences.length}{" "}
                    katılımcı
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-line pt-8">
        <dl className="divide-y divide-[color:var(--line)]">
          <Fact term="Bu cihazda çalışır">
            Model senin bilgisayarında. Yazdıkların dışarı çıkmaz, hiçbir API anahtarı yok.
          </Fact>
          <Fact term="Yapay zekanın oyu yok">
            Taslak çıkarır, soru sorar. Sayıma girmez, senin onayın olmadan hiçbir şey kaydedilmez.
          </Fact>
          <Fact term="Kural sonradan değişir">
            Tercihin bir kez yazılır. Topluluk sayım kuralını değiştirirse yeniden oy vermezsin.
          </Fact>
        </dl>
        <div className="mt-6">
          <ModelBadge />
        </div>
      </section>
    </main>
  );
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
      <dt className="text-[15px] font-medium">{term}</dt>
      <dd className="text-[14px] leading-relaxed text-ink-soft">{children}</dd>
    </div>
  );
}
