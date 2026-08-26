import { useNavigate } from "react-router-dom";

interface Props {
  communityId: string;
  reset: () => void;
}

// Governance restructure Phase 1 (2026-08-20, D2): the wizard can no longer deploy governance
// itself, so off-chain-only is the only state this screen ever reaches — no more
// governanceConfigured branching, inline "Deploy governance now" button, or auto-redirect
// countdown. Governance is added later from the community's own settings.
//
// formalize-communities epic, Child A (/plan-eng-review 2026-08-25, D2) — communityId narrowed
// from `string | undefined`: traced useCreateCommunity.ts's setCommunitySetup (the only place
// that sets step: "success") and confirmed identityCommunityId is always a real ID by the time
// this renders — the prior `| undefined` type was a leftover from before the Phase 1 restructure
// above stripped this screen's other branching.
export function StepSuccess({ communityId, reset }: Props) {
  const navigate = useNavigate();

  return (
    <div className="text-center space-y-5 py-4">
      <div className="text-4xl">🎉</div>
      <div>
        <h2 className="text-xl font-bold text-foreground">Community created!</h2>
        <p className="text-sm text-gray-400 font-mono mt-1 break-all">
          {communityId.slice(0, 8)}…{communityId.slice(-6)}
        </p>
      </div>

      <p className="text-sm text-gray-400">
        Eligibility and Governance isn&apos;t set up yet — the community works fully off-chain. You can add both anytime
        from the community&apos;s settings.
      </p>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => void navigate(`/community/${communityId}`)}
          className="w-full py-2 px-4 rounded-lg bg-accent text-white font-medium
            hover:bg-accent-hover transition-colors text-sm"
        >
          Go to community
        </button>
        <button
          type="button"
          onClick={() => void navigate(`/community/${communityId}/settings`)}
          className="w-full py-2 px-4 rounded-lg bg-accent text-white font-medium
            hover:bg-accent-hover transition-colors text-sm"
        >
          Go to settings
        </button>
        <button
          type="button"
          onClick={reset}
          className="w-full py-2 px-4 rounded-lg border border-gray-600 text-gray-300
            hover:bg-gray-700 transition-colors text-sm"
        >
          Create another community
        </button>
      </div>
    </div>
  );
}
