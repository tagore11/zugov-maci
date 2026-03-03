import PollAbi from '@/abi/Poll';
import { EMode, PollStatus, PollType } from '@/types';
import { handleNotice, notification } from '@/utils/notification';
import { Keypair, PublicKey, VoteCommand } from '@maci-protocol/domainobjs';
import { packRankedVotesTo50Bits } from '@maci-protocol/core';
import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import useFaucetContext from './useFaucetContext';
import { DEFAULT_VOICE_CREDITS } from '@/utils/constants';

interface UseVotingProps {
  pollAddress?: string;
  pollType: PollType;
  status?: PollStatus;
  stateIndex: number | null;
  coordinatorPubKey?: bigint[];
  keypair?: Keypair | null;
  pollId?: bigint;
  mode?: EMode;
  numOptions?: number;
}

const useVoting = ({
  pollAddress,
  pollType,
  status,
  stateIndex,
  coordinatorPubKey,
  keypair,
  pollId,
  mode,
  numOptions
}: UseVotingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [votes, setVotes] = useState<{ index: number; votes: string }[]>([]);
  const [isVotesInvalid, setIsVotesInvalid] = useState<Record<number, boolean>>({});

  const { writeContractAsync } = useWriteContract();

  const [txState, setTxState] = useState<{ hash: `0x${string}`; notificationId: string }>();

  const { checkBalance } = useFaucetContext();

  const {
    isSuccess: isConfirmed,
    error: confirmError,
    data: receipt
  } = useWaitForTransactionReceipt({
    hash: txState?.hash,
    query: {
      enabled: !!txState?.hash
    }
  });

  useEffect(() => {
    if (!txState?.hash) return;
    if (isConfirmed && receipt) {
      handleNotice({
        message: 'Votes submitted successfully!',
        type: 'success',
        id: txState?.notificationId
      });
      setVotes([]);
      setIsLoading(false);
    } else if (confirmError) {
      handleNotice({
        message: 'Votes submission failed!',
        type: 'error',
        id: txState?.notificationId
      });
      setIsLoading(false);
    }
  }, [isConfirmed, confirmError, receipt, txState]);

  const getMessageAndEncKeyPair = (
    stateIndex: bigint,
    pollIndex: bigint,
    candidateIndex: bigint,
    weight: bigint,
    nonce: bigint,
    coordinatorPubKey: PublicKey,
    keypair: Keypair
  ) => {
    const command = new VoteCommand(stateIndex, keypair.publicKey, candidateIndex, weight, nonce, pollIndex);

    const signature = command.sign(keypair.privateKey);
    const encKeyPair = new Keypair();
    const message = command.encrypt(signature, Keypair.generateEcdhSharedKey(encKeyPair.privateKey, coordinatorPubKey));

    return { message, encKeyPair };
  };

  const voteUpdated = (index: number, checked: boolean, voteCounts: string) => {
    if (pollType === PollType.SINGLE_VOTE) {
      if (checked) {
        setVotes([{ index, votes: voteCounts }]);
      }
      return;
    }

    if (checked) {
      setVotes([...votes.filter(v => v.index !== index), { index, votes: voteCounts }]);
    } else {
      setVotes(votes.filter(v => v.index !== index));
    }
  };

  // For RANKED mode: accepts option indices ordered from most to least preferred.
  const setRankedOrder = (orderedIndices: number[]) => {
    setVotes(
      orderedIndices.map((optionIndex, position) => ({
        index: optionIndex,
        votes: String(position + 1)
      }))
    );
  };

  const castVote = async (maxVotePerPerson: number) => {
    if (
      pollAddress == null ||
      pollId == null ||
      stateIndex == null ||
      stateIndex <= 0 ||
      !coordinatorPubKey ||
      coordinatorPubKey.length !== 2 ||
      !keypair
    ) {
      console.log('Missing required parameters', pollAddress, pollId, stateIndex, coordinatorPubKey, keypair);
      notification.error('Error casting vote. Please refresh the page and try again.');
      return;
    }

    if (Object.values(isVotesInvalid).some(v => v)) {
      notification.error('Please enter a valid number of votes');
      return;
    }

    if (votes.length === 0) {
      notification.error('Please select at least one option to vote');
      return;
    }

    if (status !== PollStatus.OPEN) {
      notification.error('Voting is closed for this poll');
      return;
    }

    if (checkBalance()) return;

    setIsLoading(true);

    // remove any votes from the array that are invalid
    let updatedVotes = votes
      .map(v => ({
        index: v.index,
        votes: parseInt(v.votes)
      }))
      .filter(v => !isNaN(v.votes));

    if (mode === EMode.FULL) {
      if (updatedVotes.length > 1) {
        notification.error('You can only vote for one option in FULL mode');
        return;
      } else {
        updatedVotes = [{ index: updatedVotes[0].index, votes: Number(DEFAULT_VOICE_CREDITS) }];
      }
    }

    if (
      pollType === PollType.MULTIPLE_VOTE &&
      maxVotePerPerson &&
      updatedVotes.reduce((a, b) => a + b.votes, 0) > maxVotePerPerson
    ) {
      notification.error(`You can't vote more than ${maxVotePerPerson} per poll`);
      return;
    }

    if (pollType === PollType.MULTIPLE_VOTE && mode === EMode.QV) {
      updatedVotes = votes.map(v => ({
        index: v.index,
        votes: Math.floor(Math.sqrt(parseInt(v.votes)))
      }));
    }

    let notificationId = notification.loading('Submitting votes...');

    try {
      if (mode === EMode.RANKED) {
        // Build a per-option ranks array: higher value = more preferred.
        // votes are stored as [{ index: optionIdx, votes: positionStr }] where
        // position 1 = 1st choice. We invert so 1st choice gets the highest rank value.
        const totalOpts = numOptions ?? updatedVotes.length;
        const ranksArray: number[] = new Array(totalOpts).fill(0);
        const sorted = [...updatedVotes].sort((a, b) => a.votes - b.votes);
        sorted.forEach((v, pos) => {
          ranksArray[v.index] = sorted.length - pos;
        });

        const packed = packRankedVotesTo50Bits(ranksArray);
        const { message, encKeyPair } = getMessageAndEncKeyPair(
          BigInt(stateIndex),
          pollId,
          packed,
          BigInt(maxVotePerPerson),
          1n,
          new PublicKey(coordinatorPubKey as [bigint, bigint]),
          keypair
        );

        const txHash = await writeContractAsync({
          abi: PollAbi,
          address: pollAddress as `0x${string}`,
          functionName: 'publishMessage',
          args: [
            message.asContractParam() as unknown as {
              data: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
            },
            encKeyPair.publicKey.asContractParam() as unknown as { x: bigint; y: bigint }
          ]
        });

        notificationId = handleNotice({
          message: 'Waiting for transaction confirmation...',
          type: 'loading',
          id: notificationId
        });
        setTxState({ hash: txHash, notificationId });
        return;
      }

      const votesToMessage = updatedVotes
        .sort((a, b) => a.index - b.index)
        .map((v, i) =>
          getMessageAndEncKeyPair(
            BigInt(stateIndex),
            pollId,
            BigInt(v.index),
            BigInt(v.votes),
            BigInt(updatedVotes.length - i),
            new PublicKey(coordinatorPubKey as [bigint, bigint]),
            keypair
          )
        );

      let txHash: `0x${string}`;
      if (votesToMessage.length === 1) {
        txHash = await writeContractAsync({
          abi: PollAbi,
          address: pollAddress as `0x${string}`,
          functionName: 'publishMessage',
          args: [
            votesToMessage[0].message.asContractParam() as unknown as {
              data: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
            },
            votesToMessage[0].encKeyPair.publicKey.asContractParam() as unknown as {
              x: bigint;
              y: bigint;
            }
          ]
        });
      } else {
        txHash = await writeContractAsync({
          abi: PollAbi,
          address: pollAddress as `0x${string}`,
          functionName: 'publishMessageBatch',
          args: [
            votesToMessage.map(
              v =>
                v.message.asContractParam() as unknown as {
                  data: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
                }
            ),
            votesToMessage.map(
              v =>
                v.encKeyPair.publicKey.asContractParam() as {
                  x: bigint;
                  y: bigint;
                }
            )
          ]
        });
      }

      notificationId = handleNotice({
        message: 'Waiting for transaction confirmation...',
        type: 'loading',
        id: notificationId
      });

      setTxState({
        hash: txHash,
        notificationId
      });
    } catch (err) {
      console.error('Error submitting votes:', err);
      const errorMessage =
        err instanceof Error && err.message.includes('User rejected')
          ? 'Transaction cancelled by user'
          : 'Failed to submit votes. Please try again.';
      handleNotice({
        message: errorMessage,
        type: 'error',
        id: notificationId
      });
      setIsLoading(false);
    }
  };

  return {
    votes,
    isVotesInvalid,
    isPending: isLoading,
    setIsVotesInvalid,
    voteUpdated,
    setRankedOrder,
    castVote
  };
};

export default useVoting;
