import { useState } from "react";
import { X, GripVertical, CheckCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { useVote } from "@/src/hooks/useVote";
import { saveVote, getStoredVote } from "@/src/lib/voteStorage";
import type { GovernanceType } from "@/src/config";
import type { SubgraphPoll } from "@/src/services/subgraph";

interface VoteModalProps {
  poll: SubgraphPoll;
  pollStateIndex: string;
  governanceType: GovernanceType;
  onClose: () => void;
  onSuccess: () => void;
}

export function VoteModal({ poll, pollStateIndex, governanceType, onClose, onSuccess }: VoteModalProps) {
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
        pollStateIndex,
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
        pollStateIndex,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{poll.name}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {storedVote && (
            <div className="flex items-center gap-2 text-sm text-amber-700 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              You already cast a vote on this poll. You can recast it below.
            </div>
          )}

          {isRanked ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
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
                          ? "border-indigo-400 bg-indigo-50 opacity-60"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm flex-shrink-0 bg-indigo-600 text-white">
                        {idx + 1}
                      </div>
                      <span className="text-gray-900 flex-1">{option}</span>
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        weight {weight}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">Select one option to cast your vote.</p>
              <div className="space-y-2 mb-6">
                {options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-colors ${
                      selectedOption === idx
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm flex-shrink-0 ${
                        selectedOption === idx ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {voteError && <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-lg">{voteError}</p>}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVote}
              disabled={!canSubmit || isVoting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVoting ? "Submitting..." : storedVote ? "Recast Vote" : "Cast Vote"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
