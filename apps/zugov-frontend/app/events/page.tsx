import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Header } from "../components/Header";
import * as eventApi from "@/src/services/eventApi";
import { KIND_META, CollectionToggle, formatTimeRange } from "../components/EventsSection";

// Events expansion (/office-hours + /plan-eng-review 2026-08-26, /plan-design-review 2026-08-26)
// — the first cross-community discovery page for events, mirroring /unions/page.tsx's public
// no-auth browse pattern exactly (page title + description, card grid, Previous/Next pagination).
// Cards show top-level events ONLY (parentEventId IS NULL, locked backend contract) — side-events
// are visible exclusively via their parent's community event list, never their own card here.
// Clicking a card links to /community/:id/events#event-<id> (Decision 1) — no per-event detail
// route exists in this app, so the existing per-community list is the landing target.
export default function EventsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [collection, setCollection] = useState<"upcoming" | "past">("upcoming");

  const queryKey = ["globalEvents", page, collection] as const;
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => eventApi.listGlobalEvents({ page, limit: 12, collection }),
  });

  const events = data?.events ?? [];

  const handleCollectionChange = (next: "upcoming" | "past") => {
    setCollection(next);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-foreground">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Events</h1>
          <p className="text-gray-400">Upcoming and past events across every community.</p>
        </div>

        <div className="mb-6">
          <CollectionToggle collection={collection} onChange={handleCollectionChange} />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-700 bg-gray-900 p-6 animate-pulse space-y-3">
                <div className="h-4 bg-gray-800 rounded w-1/3" />
                <div className="h-5 bg-gray-800 rounded w-3/4" />
                <div className="h-4 bg-gray-800/60 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-gray-400">Couldn&apos;t load events right now.</p>
            <button
              type="button"
              onClick={() => queryClient.invalidateQueries({ queryKey })}
              className="mt-3 text-sm font-medium text-accent-hover hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && events.length === 0 && (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-gray-400">{collection === "upcoming" ? "No upcoming events yet." : "No past events."}</p>
          </div>
        )}

        {!isLoading && !isError && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => {
              const { label: kindLabel, Icon: KindIcon } = KIND_META[event.kind];
              return (
                <Link
                  key={event.id}
                  to={`/community/${event.communityId}/events#event-${event.id}`}
                  className="bg-gray-900 rounded-lg border border-gray-700 p-6 hover:border-accent transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span className="text-lg leading-none">{event.communityLogo || "🏛️"}</span>
                    <span className="truncate">{event.communityDisplayName}</span>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2">{event.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <KindIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      {kindLabel}
                    </span>
                    <span className="font-mono tabular-nums">{formatTimeRange(event.startAt, event.endAt)}</span>
                  </div>
                  {(event.locationText ?? event.venueId) && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-400">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      {event.locationText ?? "Venue"}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {data && (data.hasMore || page > 1) && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="min-h-[44px] px-4 rounded-[6px] border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.hasMore}
              className="min-h-[44px] px-4 rounded-[6px] border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
