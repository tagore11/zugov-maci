import { useState } from "react";
import * as zupollApi from "@/src/services/zupollApi";

interface AttachZupollAdapterProps {
  communityId: string;
  isAttached: boolean;
  onAttached?: () => void;
}

/** specs/013-zupoll-decision-adapter, User Story 1 — attaches the "zupoll" decision adapter to a
 * community. Additive: works regardless of whether MACI is attached, and regardless of whether
 * this community has any governance configured at all. */
export function AttachZupollAdapter({ communityId, isAttached, onAttached }: AttachZupollAdapterProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAttached) {
    return <p className="text-sm text-gray-400">Zupoll (anonymous surveys) is enabled for this community.</p>;
  }

  const handleAttach = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await zupollApi.attachZupollAdapter(communityId);
      onAttached?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to attach Zupoll");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border-2 border-gray-800 bg-gray-800/40 rounded-lg space-y-3">
      <div>
        <p className="font-semibold text-foreground">Zupoll — Anonymous Surveys</p>
        <p className="text-sm text-gray-400">
          Off-chain, anonymous single-question polls. No on-chain deployment, no coordinator wait — members vote with a
          zero-knowledge proof of group membership, and the server never learns who voted.
        </p>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="button"
        onClick={handleAttach}
        disabled={isSubmitting}
        className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover disabled:opacity-60"
      >
        {isSubmitting ? "Attaching…" : "Attach Zupoll"}
      </button>
    </div>
  );
}
