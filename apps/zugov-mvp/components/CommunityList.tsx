"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { communities, type Community } from "@/lib/ag/client";
import { Hint, Title } from "./ui";

/**
 * Communities come from the governance backend, which is the record of who
 * exists and who belongs where. This app never invents one.
 */
export function CommunityList() {
  const [list, setList] = useState<Community[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    communities
      .list()
      .then((data) => alive && setList(data.communities))
      .catch((cause: unknown) => alive && setError(cause instanceof Error ? cause.message : "Yüklenemedi."));
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return (
      <div className="border-t border-line pt-6">
        <p className="text-[15px] text-alarm">Topluluklar yüklenemedi.</p>
        <div className="mt-2">
          <Hint>
            Yönetişim arka ucu çalışmıyor olabilir. {error}
          </Hint>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <ul className="mt-5 divide-y divide-[color:var(--line)] border-y border-line" aria-hidden>
        {[0, 1].map((i) => (
          <li key={i} className="py-5">
            <div className="h-4 w-48 bg-sunk" />
            <div className="mt-2 h-3 w-64 bg-sunk" />
          </li>
        ))}
      </ul>
    );
  }

  if (list.length === 0) {
    return (
      <div className="mt-5 border-t border-line pt-6">
        <p className="text-[16px]">Henüz topluluk yok.</p>
      </div>
    );
  }

  return (
    <ul className="mt-5 divide-y divide-[color:var(--line)] border-y border-line">
      {list.map((community) => (
        <li key={community.id}>
          <Link href={`/topluluk/${community.id}`} className="tap block py-5 hover:bg-sunk">
            <h3 className="text-[17px] font-medium leading-snug">
              {community.logo ? <span className="mr-2">{community.logo}</span> : null}
              {community.displayName}
            </h3>
            {community.description ? (
              <p className="mt-1.5 max-w-[62ch] text-[14px] text-ink-soft">{community.description}</p>
            ) : null}
            <p className="mt-2 font-mono text-[12px] text-ink-faint">
              {community.type === "union" ? "birlik" : "topluluk"}
              {community.parentCommunityId ? ", alt topluluk" : ""}
              {community.membershipPolicy === "approval" ? ", katılım onaya bağlı" : ", katılıma açık"}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export { Title };
