import { CommunityList } from "@/components/CommunityList";
import { WalletBar } from "@/components/WalletBar";
import { ModelBadge } from "@/components/ModelBadge";
import { Hint, Title } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function HomePage() {
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
          <WalletBar />
        </div>
      </header>

      <section className="py-10">
        <Title as="h2">Topluluklar</Title>
        <div className="mt-1">
          <Hint>Bir topluluğa gir, kararlarını gör, kendi kararını aç.</Hint>
        </div>
        <CommunityList />
      </section>

      <section className="border-t border-line pt-8">
        <dl className="divide-y divide-[color:var(--line)]">
          <Fact term="Bu cihazda çalışır">
            Karar metni ve tercihlerin bu bilgisayardan çıkmaz. Kimlik ve üyelik yönetişim arka
            ucundan gelir.
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
