import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  communityId: string | undefined;
  // Off-chain-only is a real, intentional end state now (2026-08-19 community-creation-rework
  // review, D2) — when governance hasn't been deployed, offer it inline instead of always
  // redirecting. No auto-redirect countdown in that case: a forced 3-second timer would rush
  // past a choice the resident should get to make deliberately.
  governanceConfigured: boolean;
  onDeployNow: () => void;
  reset: () => void;
}

export function StepSuccess({ communityId, governanceConfigured, onDeployNow, reset }: Props) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const [cancelled, setCancelled] = useState(false);

  const communityPath = communityId ? `/community/${communityId}` : "/";
  const autoRedirect = governanceConfigured;

  useEffect(() => {
    if (!autoRedirect || cancelled || !communityId) return;

    if (countdown <= 0) {
      void navigate(communityPath);
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [autoRedirect, countdown, cancelled, communityId, communityPath, navigate]);

  const handleGoNow = () => {
    setCancelled(true);
    void navigate(communityPath);
  };

  const handleCreateAnother = () => {
    setCancelled(true);
    reset();
  };

  return (
    <div className="text-center space-y-5 py-4">
      <div className="text-4xl">🎉</div>
      <div>
        <h2 className="text-xl font-bold text-foreground">Community created!</h2>
        {communityId && (
          <p className="text-sm text-gray-400 font-mono mt-1 break-all">
            {communityId.slice(0, 8)}…{communityId.slice(-6)}
          </p>
        )}
      </div>

      {!governanceConfigured && (
        <p className="text-sm text-gray-400">
          Governance isn&apos;t set up yet — the community works fully off-chain until you deploy it, now or later from
          the community&apos;s settings.
        </p>
      )}

      {autoRedirect && !cancelled && communityId && (
        <p className="text-sm text-gray-400">
          Redirecting in <span className="text-foreground font-semibold">{countdown}</span>…
        </p>
      )}

      <div className="flex flex-col gap-2">
        {!governanceConfigured && (
          <button
            type="button"
            onClick={onDeployNow}
            className="w-full py-2 px-4 rounded-lg bg-accent text-white font-medium
              hover:bg-accent-hover transition-colors text-sm"
          >
            Deploy governance now
          </button>
        )}
        {communityId && (
          <button
            type="button"
            onClick={handleGoNow}
            className={
              governanceConfigured
                ? "w-full py-2 px-4 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors text-sm"
                : "w-full py-2 px-4 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
            }
          >
            {governanceConfigured ? "Go to community now" : "Skip for now"}
          </button>
        )}
        <button
          type="button"
          onClick={handleCreateAnother}
          className="w-full py-2 px-4 rounded-lg border border-gray-600 text-gray-300
            hover:bg-gray-700 transition-colors text-sm"
        >
          Create another community
        </button>
      </div>
    </div>
  );
}
