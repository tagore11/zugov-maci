"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { communities, type Community, type MembershipStatus } from "@/lib/ag/client";
import { useSession } from "@/lib/session";
import { WalletBar } from "./WalletBar";
import { Button, Hint, Title } from "./ui";
import { copy } from "@/lib/copy";

interface Decision {
  id: string;
  title: string;
  options: { id: string; label: string }[];
  mechanismId: string;
  preferences: unknown[];
}

/**
 * One community: who you are in it, and what it is deciding.
 *
 * Membership and permissions are read from the governance backend, never
 * assumed. A person who is not a member sees the decisions and is told plainly
 * that they cannot take part yet, rather than being shown controls that fail
 * when pressed.
 */
export function CommunityRoom({ communityId }: { communityId: string }) {
  const { address, isSignedIn } = useSession();
  const [community, setCommunity] = useState<Community | null>(null);
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembership = useCallback(async () => {
    if (!isSignedIn) {
      setMembership(null);
      return;
    }
    try {
      setMembership(await communities.myMembership(communityId));
    } catch {
      setMembership(null);
    }
  }, [communityId, isSignedIn]);

  useEffect(() => {
    let alive = true;
    communities
      .get(communityId)
      .then((data) => alive && setCommunity(data))
      .catch(() => alive && setError(copy.communityRoom.notFound));
    fetch(`/api/decisions?topluluk=${encodeURIComponent(communityId)}`)
      .then((r) => r.json())
      .then((data: Decision[]) => alive && setDecisions(data))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [communityId]);

  useEffect(() => {
    void loadMembership();
  }, [loadMembership, address]);

  async function join() {
    setBusy(true);
    setError(null);
    try {
      await communities.join(communityId);
      await loadMembership();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.communityRoom.joinFailed);
    } finally {
      setBusy(false);
    }
  }

  if (error && !community) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <Link href="/" className="tap text-[14px] text-ink-soft underline underline-offset-4">
          {copy.communityRoom.backToCommunities}
        </Link>
        <p className="mt-8 text-[16px] text-alarm">{error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:py-16">
      <nav className="mb-8">
        <Link href="/" className="tap text-[14px] text-ink-soft underline underline-offset-4">
          {copy.communityRoom.backToCommunities}
        </Link>
      </nav>

      <header className="border-b border-line pb-8">
        {/* A bare "Yükleniyor" headline reads as a broken page rather than a slow
            one. The skeleton keeps the shape of what is coming, so a slow load
            looks like a slow load. */}
        {community ? (
          <>
            <Title as="h1">
              {community.logo ? <span className="mr-2">{community.logo}</span> : null}
              {community.displayName}
            </Title>
            {community.description ? (
              <p className="prose-read mt-4 max-w-[60ch] text-ink-soft">{community.description}</p>
            ) : null}
          </>
        ) : (
          <div aria-hidden className="space-y-3">
            <div className="h-8 w-64 max-w-full bg-sunk" />
            <div className="h-4 w-80 max-w-full bg-sunk" />
          </div>
        )}

        <div className="mt-6">
          <WalletBar />
        </div>

        <div className="mt-4">
          {!isSignedIn ? (
            <Hint>{copy.communityRoom.signedOutHint}</Hint>
          ) : membership?.status === "member" ? (
            <p className="text-[15px]">
              {copy.communityRoom.memberOfCommunityPrefix}{" "}
              <span className="font-medium">{membership.tierLabel ?? copy.communityRoom.memberTierFallback}</span>
              <span className="text-ink-soft">
                {membership.canVote ? copy.communityRoom.canVoteSuffix : copy.communityRoom.cannotVoteSuffix}
                {membership.canCreateProposals ? copy.communityRoom.canCreateProposalsSuffix : ""}
              </span>
              .
            </p>
          ) : membership?.status === "pending" ? (
            <p className="text-[15px] text-ink-soft">{copy.communityRoom.pendingApproval}</p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Hint>{copy.communityRoom.notAMember}</Hint>
              {community?.membershipPolicy === "open" ? (
                <Button kind="quiet" onClick={() => void join()} disabled={busy}>
                  {busy ? copy.communityRoom.joining : copy.communityRoom.join}
                </Button>
              ) : (
                <Hint>{copy.communityRoom.approvalOnly}</Hint>
              )}
            </div>
          )}
          {error ? <p className="mt-2 text-[14px] text-alarm">{error}</p> : null}
        </div>
      </header>

      <section className="py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Title as="h2">{copy.communityRoom.decisionsTitle}</Title>
          {membership?.canCreateProposals ? (
            <Link
              href={`/yeni?topluluk=${encodeURIComponent(communityId)}`}
              className="tap text-[15px] font-medium underline underline-offset-4"
            >
              {copy.communityRoom.openDecision}
            </Link>
          ) : null}
        </div>

        {decisions.length === 0 ? (
          <div className="mt-5 border-t border-line pt-6">
            <p className="text-[16px]">{copy.communityRoom.noDecisions}</p>
            {membership?.status === "member" && !membership.canCreateProposals ? (
              <div className="mt-2">
                <Hint>{copy.communityRoom.tierCannotCreate(membership.tierLabel ?? "")}</Hint>
              </div>
            ) : null}
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-[color:var(--line)] border-y border-line">
            {decisions.map((decision) => (
              <li key={decision.id}>
                <Link href={`/karar/${decision.id}`} className="tap block py-5 hover:bg-sunk">
                  <h3 className="text-[17px] font-medium leading-snug">{decision.title}</h3>
                  <p className="mt-1.5 text-[14px] text-ink-soft">
                    {decision.options.map((o) => o.label).join(", ")}
                  </p>
                  <p className="mt-2 font-mono text-[12px] tabular-nums text-ink-faint">
                    {decision.preferences.length} {copy.communityRoom.participantCount}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
