import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as eventApi from "@/src/services/eventApi";
import type { Event } from "@/src/services/eventApi";
import { useSiwe } from "@/src/hooks/useSiwe";
import { withAuthDetect } from "@/src/services/httpClient";

// Union-as-community merge sibling work: event detail page (2026-08-28 /plan-eng-review, D1) —
// extracted from EventRow (EventsSection.tsx) into its own leaf module rather than exported
// directly from EventsSection.tsx, so EventsSection.tsx and the new EventDetailPage.tsx can never
// form an import cycle through it — the same shape as the 2026-08-26 KIND_META circular-import
// bug between EventsSection.tsx and CreateEventModal.tsx. Covers RSVP only (not the edit/cancel/
// duplicate menu), matching the detail page's locked read-only-for-v1 scope — EventRow keeps that
// logic local since only it needs it.
export function useEventRowActions(communityId: string, event: Event, walletAddress?: string) {
  const queryClient = useQueryClient();
  const [rsvpPending, setRsvpPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { signOut } = useSiwe();

  const {
    data: rsvps = [],
    isLoading: isLoadingRsvps,
    isError: isErrorRsvps,
  } = useQuery({
    queryKey: ["eventRsvps", event.id],
    queryFn: () => eventApi.listRsvps(communityId, event.id),
  });

  const hasRsvped = !!walletAddress && rsvps.some((r) => r.walletAddress.toLowerCase() === walletAddress.toLowerCase());

  const handleRsvpToggle = async () => {
    setRsvpPending(true);
    setActionError(null);
    try {
      await withAuthDetect(() => {
        return hasRsvped ? eventApi.cancelRsvp(communityId, event.id) : eventApi.rsvp(communityId, event.id);
      }, signOut);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["events", communityId] }),
        queryClient.invalidateQueries({ queryKey: ["eventRsvps", event.id] }),
      ]);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update RSVP");
    } finally {
      setRsvpPending(false);
    }
  };

  return { rsvps, isLoadingRsvps, isErrorRsvps, hasRsvped, rsvpPending, actionError, handleRsvpToggle };
}
