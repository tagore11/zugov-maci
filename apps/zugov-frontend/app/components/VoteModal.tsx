import { useState } from "react";
import { X, GripVertical, CheckCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { useVote } from "@/src/hooks/useVote";
import { saveVote, getStoredVote } from "@/src/lib/voteStorage";
import type { GovernanceType } from "@/src/config";
import type { SubgraphPoll } from "@/src/services/subgraph";

interface VoteModalProps {
  poll: SubgraphPoll;
  maciAddress: string;
  rpcUrl: string;
  governanceType: GovernanceType;
  onClose: () => void;
  onSuccess: () => void;
}

export function VoteModal({ poll, maciAddress, rpcUrl, governanceType, onClose, onSuccess }: VoteModalProps) {
  const { address } = useAccount();
  const { isVoting, voteError, castVote } = useVote(governanceType);

  const options = poll.options?.length
    ? poll.options
    : Array.from({ length: Number(poll.voteOptions) }, (_, i) => `Option ${i + 1}`);

  const isRanked = poll.mode === "3";

  const storedVote = address ? getStoredVote(poll.id, address) : null;

  const [selectedOption, setSelectedOption] = useState<number | null>(() =>
    storedVote?.type === "simple" ? storedVote.optionIndex : null,
  );

  const [rankedOptions, setRankedOptions] = useState<string[]>(() =>
    storedVote?.type === "ranked" ? [...storedVote.rankedOptions] : [...options],
  );

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (_e: React.DragEvent, idx: number) => {
    setDragIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    setRankedOptions((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(idx, 0, moved);
      return updated;
    });
    setDragIndex(idx);
  };

  const handleDragEnd = () => setDragIndex(null);

  /**
   * Packs ranked preferences into a single BigInt for MACI's ranked vote format.
   * Each option slot i occupies 4 bits at position i*4.
   * The value stored is the rank weight: 1st place = N (highest), last = 1.
   */
  const packRankedOptions = (ranked: string[]): bigint => {
    const N = ranked.length;
    let packed = 0n;
    ranked.forEach((option, rankIdx) => {
      const optionIdx = options.indexOf(option);
      if (optionIdx === -1) return;
      packed |= BigInt(N - rankIdx) << BigInt(optionIdx * 4);
    });
    return packed;
  };

  const handleVote = async () => {
    if (isRanked) {
      await castVote({
        pollAddress: poll.id,
        pollId: BigInt(poll.pollId),
        maciAddress,
        rpcUrl,
        voteOptionIndex: packRankedOptions(rankedOptions),
        voteWeight: 1n,
        maxVoteOption: BigInt(poll.voteOptions),
        isRanked: true,
      });
      if (address) saveVote(poll.id, address, { type: "ranked", rankedOptions });
    } else {
      if (selectedOption === null) return;
      await castVote({
        pollAddress: poll.id,
        pollId: BigInt(poll.pollId),
        maciAddress,
        rpcUrl,
        voteOptionIndex: BigInt(selectedOption),
        voteWeight: 1n,
        maxVoteOption: BigInt(poll.voteOptions),
      });
      if (address) saveVote(poll.id, address, { type: "simple", optionIndex: selectedOption });
    }

    onSuccess();
  };

  const canSubmit = isRanked ? true : selectedOption !== null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-foreground">{poll.name}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {storedVote && (
            <div className="flex items-center gap-2 text-sm text-amber-400 mb-4 p-3 bg-amber-900/20 border border-amber-700/40 rounded-lg">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              You already cast a vote on this poll. You can recast it below.
            </div>
          )}

          {isRanked ? (
            <>
              <p className="text-sm text-gray-400 mb-4">
                Drag to rank your choices. The option in 1st place receives the highest weight.
              </p>
              <div className="space-y-2 mb-6">
                {rankedOptions.map((option, idx) => {
                  const weight = rankedOptions.length - idx;
                  return (
                    <div
                      key={option}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`w-full flex items-center gap-3 p-3 border rounded-lg cursor-grab active:cursor-grabbing transition-colors select-none ${
                        dragIndex === idx
                          ? "border-accent bg-accent/10 opacity-60"
                          : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/60"
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm flex-shrink-0 bg-accent text-white">
                        {idx + 1}
                      </div>
                      <span className="text-white flex-1">{option}</span>
                      <span className="text-xs font-medium text-accent-hover bg-accent/10 px-2 py-0.5 rounded-full">
                        weight {weight}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-4">Select one option to cast your vote.</p>
              <div className="space-y-2 mb-6">
                {options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-colors ${
                      selectedOption === idx
                        ? "border-accent bg-accent/10"
                        : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/60"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm flex-shrink-0 ${
                        selectedOption === idx ? "bg-accent text-white" : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-foreground">{option}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {voteError && <p className="text-sm text-red-400 mb-4 p-3 bg-red-900/20 rounded-lg">{voteError}</p>}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVote}
              disabled={!canSubmit || isVoting}
              className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVoting ? "Submitting..." : storedVote ? "Recast Vote" : "Cast Vote"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
