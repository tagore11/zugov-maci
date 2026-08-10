import type { UseCreateCommunityResult } from "@/src/hooks/useCreateCommunity";

interface Props {
  setMechanism: UseCreateCommunityResult["setMechanism"];
}

export function StepMechanism({ setMechanism }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Choose Voting Mechanism</h2>
      <p className="text-sm text-gray-400">
        Select the voting system for your community. More mechanisms will be available soon.
      </p>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setMechanism("maci")}
          className="w-full flex items-start gap-4 p-4 rounded-lg border border-purple-500 bg-purple-900/20
            hover:bg-purple-900/40 transition-colors text-left"
        >
          <div className="text-2xl mt-0.5">🔒</div>
          <div>
            <div className="font-semibold text-white">MACI</div>
            <div className="text-sm text-gray-400 mt-0.5">
              Minimum Anti-Collusion Infrastructure — private, collusion-resistant voting using zero-knowledge proofs.
            </div>
          </div>
        </button>

        <div
          className="w-full flex items-start gap-4 p-4 rounded-lg border border-gray-700 bg-gray-800/30
            opacity-50 cursor-not-allowed text-left"
        >
          <div className="text-2xl mt-0.5">🗳️</div>
          <div>
            <div className="font-semibold text-gray-400">More mechanisms coming soon</div>
            <div className="text-sm text-gray-500 mt-0.5">Token-weighted voting, conviction voting, and more.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
