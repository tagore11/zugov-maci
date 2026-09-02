import { CommunityList } from "@/components/CommunityList";
import { WalletBar } from "@/components/WalletBar";
import { ModelBadge } from "@/components/ModelBadge";
import { Hint, Title } from "@/components/ui";
import { copy } from "@/lib/copy";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      <header className="border-b border-line pb-10">
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-faint">{copy.app.title}</p>
        <h1 className="mt-5 max-w-[18ch] text-[30px] font-semibold leading-[1.2] tracking-[-0.02em] md:text-[38px]">
          {copy.home.heading}
        </h1>
        <p className="prose-read mt-5 max-w-[58ch] text-ink-soft">{copy.home.intro}</p>
        <div className="mt-8">
          <WalletBar />
        </div>
      </header>

      <section className="py-10">
        <Title as="h2">{copy.home.communitiesTitle}</Title>
        <div className="mt-1">
          <Hint>{copy.home.communitiesHint}</Hint>
        </div>
        <CommunityList />
      </section>

      <section className="border-t border-line pt-8">
        <dl className="divide-y divide-[color:var(--line)]">
          <Fact term={copy.home.facts.localTerm}>{copy.home.facts.localBody}</Fact>
          <Fact term={copy.home.facts.noAiVoteTerm}>{copy.home.facts.noAiVoteBody}</Fact>
          <Fact term={copy.home.facts.ruleChangesTerm}>{copy.home.facts.ruleChangesBody}</Fact>
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
