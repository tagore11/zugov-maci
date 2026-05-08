import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { BrowserProvider } from "ethers";
import { generateVote, submitVote, getCoordinatorPublicKey } from "@maci-protocol/sdk/browser";
import { useMaci } from "../context/MaciContext";
import { GovernanceTypes, type GovernanceType } from "../config";

export function useVote(governanceType: GovernanceType | undefined) {
  const { isConnected, address } = useAccount();
  const { maciKeypair } = useMaci();
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  const castVote = useCallback(
    async ({
      pollAddress,
      pollId,
      pollStateIndex,
      voteOptionIndex,
      voteWeight,
      maxVoteOption,
      nonce = 1n,
      isRanked = false,
    }: {
      pollAddress: string;
      pollId: bigint;
      pollStateIndex: string;
      voteOptionIndex: bigint;
      voteWeight: bigint;
      maxVoteOption: bigint;
      nonce?: bigint;
      isRanked?: boolean;
    }) => {
      if (!isConnected) throw new Error("Wallet not connected");
      if (!maciKeypair) throw new Error("MACI keypair not available");
      if (!address) throw new Error("No wallet address");
      if (governanceType !== GovernanceTypes.MACI) {
        throw new Error(`Voting not supported for governance type "${governanceType}"`);
      }

      setIsVoting(true);
      setVoteError(null);

      try {
        const provider = new BrowserProvider(window.ethereum!);
        const signer = await provider.getSigner();

        const coordinatorPublicKey = await getCoordinatorPublicKey(pollAddress, signer);

        const vote = generateVote({
          pollId,
          voteOptionIndex,
          nonce,
          isRanked,
          privateKey: maciKeypair.privateKey,
          stateIndex: BigInt(pollStateIndex),
          voteWeight,
          coordinatorPublicKey,
          maxVoteOption,
        });

        return await submitVote({ pollAddress, vote, signer });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setVoteError(message);
        throw err;
      } finally {
        setIsVoting(false);
      }
    },
    [isConnected, maciKeypair, address, governanceType],
  );

  return { isVoting, voteError, castVote };
}
