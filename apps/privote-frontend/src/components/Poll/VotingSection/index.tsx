import pollAbi from '@/abi/Poll';
import { LoadingPulse, MarkdownRenderer } from '@/components/shared';
import usePollContext from '@/hooks/usePollContext';
import usePollResults from '@/hooks/usePollResults';
import useVoting from '@/hooks/useVoting';
import { EMode, PollStatus, PollType } from '@/types';
import { notification } from '@/utils/notification';
import { canPerformAction } from '@/utils/pollStatus';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { JoinPollButton } from '../JoinPollButton';
import RankedVotingList from '../RankedVotingList';
import VoteCard from '../VoteCard';
import VoteSummarySection from '../VoteSummarySection';
import styles from './index.module.css';

interface VotingSectionProps {
  pollAddress: string;
}

export const VotingSection = ({ pollAddress }: VotingSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isContentOverflowing, setIsContentOverflowing] = useState(false);
  const [coordinatorPubKey, setCoordinatorPubKey] = useState<[bigint, bigint]>();
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  const { isConnected, address: userAddress } = useAccount();
  const {
    poll,
    initialVoiceCredits: maxVotePerPerson,
    pollStateIndex,
    hasJoinedPoll: isUserJoined,
    dynamicPollStatus,
    maciKeypair
  } = usePollContext();
  const { data: resultData, isLoading: loadingPollResults } = usePollResults();

  // Safely destructure poll properties with fallbacks
  const {
    mode,
    pollType,
    name: pollTitle,
    description: pollDescription,
    options,
    status: originalPollStatus,
    owner: pollDeployer,
    coordinatorPublicKey,
    policyTrait,
    policyData
  } = poll || {};

  // Use dynamic status if available, otherwise fall back to original status
  const pollStatus = dynamicPollStatus || originalPollStatus || PollStatus.CLOSED;
  const isTallied = resultData?.tallied || false;
  const totalVotes = resultData?.total || BigInt(0);
  const pollResults = resultData?.results;

  // Check if user can perform various actions
  const canJoin = canPerformAction('join', pollStatus, userAddress, pollDeployer, isUserJoined);
  const canVote = canPerformAction('vote', pollStatus, userAddress, pollDeployer, isUserJoined);
  const canPublish = canPerformAction('publish', pollStatus, userAddress, pollDeployer, undefined, isTallied);

  const { data: coordinatorPubKeyResult } = useReadContract({
    abi: pollAbi,
    address: pollAddress as `0x${string}`,
    functionName: 'coordinatorPublicKey',
    query: {
      enabled: !!poll && !poll?.coordinatorPublicKey
    }
  });

  const {
    votes,
    isVotesInvalid,
    setIsVotesInvalid,
    voteUpdated: onVoteUpdate,
    setRankedOrder,
    castVote,
    isPending: isSubmittingVotes
  } = useVoting({
    coordinatorPubKey: coordinatorPublicKey ?? coordinatorPubKey,
    pollAddress: poll?.id,
    mode: poll?.mode,
    pollType: poll?.pollType || PollType.NOT_SELECTED,
    status: poll?.status,
    keypair: maciKeypair,
    pollId: BigInt(poll?.pollId || 0),
    stateIndex: Number(pollStateIndex),
    numOptions: options?.length
  });

  const onVote = useCallback(() => {
    castVote(Number(maxVotePerPerson));
  }, [castVote, maxVotePerPerson]);

  // Ranked mode: derive ordered option indices from votes (sorted by position asc).
  const rankedOrder = useMemo(
    () => [...votes].sort((a, b) => Number(a.votes) - Number(b.votes)).map(v => v.index),
    [votes]
  );

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const checkOverflow = () => {
      if (descriptionRef.current) {
        const maxHeight = 94;

        setIsContentOverflowing(descriptionRef.current.scrollHeight > maxHeight);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => window.removeEventListener('resize', checkOverflow);
  }, [pollDescription]);

  const handleVoteChange = useCallback(
    (index: number, votes: string) => {
      onVoteUpdate(index, true, votes);
    },
    [onVoteUpdate]
  );

  const handleInvalidStatusChange = useCallback(
    (index: number, status: boolean) => {
      setIsVotesInvalid({ ...isVotesInvalid, [index]: status });
    },
    [isVotesInvalid, setIsVotesInvalid]
  );

  const currentTotalVotes = votes ? votes.reduce((acc, v) => acc + Number(v.votes), 0) : 0;

  const handleWeightedVoteChange = useCallback(
    (prevVotes: string | undefined, votes: string, index: number) => {
      if (!isConnected) {
        notification.error('Please connect your wallet');
        return;
      }

      if (!isUserJoined) {
        notification.error('Please register to vote');
        return;
      }

      if (Number(votes) < 0) return;
      if (
        Number(maxVotePerPerson) &&
        currentTotalVotes - (Number(prevVotes) ?? 0) + Number(votes) > Number(maxVotePerPerson)
      ) {
        notification.info('You have reached the maximum vote limit');
        return;
      }
      handleVoteChange(index, votes);
    },
    [maxVotePerPerson, handleVoteChange, isConnected, isUserJoined, currentTotalVotes]
  );

  useEffect(() => {
    if (!coordinatorPubKeyResult) return;
    const result = coordinatorPubKeyResult as [bigint, bigint];
    setCoordinatorPubKey([result[0], result[1]]);
  }, [coordinatorPubKeyResult]);

  // Show loading state if poll is not yet available
  if (!poll) {
    return (
      <div className={styles['candidate-container']}>
        <div className={styles.content}>
          <LoadingPulse size='medium' text='Loading poll data...' variant='primary' />
        </div>
      </div>
    );
  }

  return (
    <div className={styles['candidate-container']}>
      <div className={styles.content}>
        <h1 className={styles.heading}>{pollTitle}</h1>
        {pollDescription && (
          <div>
            <div
              ref={descriptionRef}
              className={`description ${
                !isExpanded && isContentOverflowing && isMobile ? styles.descriptionTruncated : ''
              }`}
            >
              <MarkdownRenderer
                content={
                  isMobile ? (isExpanded ? pollDescription : pollDescription.substring(0, 220)) : pollDescription
                }
              />
              {isMobile && isContentOverflowing && (
                <span className={styles.showMoreButton} onClick={() => setIsExpanded(!isExpanded)}>
                  {' '}
                  {isExpanded ? 'Show less' : '...read more'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      {pollStatus === PollStatus.OPEN && (
        <div className={styles.info}>
          <Image src={'/info.svg'} alt='info' width={24} height={24} />
          <p>
            As no one knows whom you voted for, you can change your vote at any time before the poll ends. Only the last
            vote counts.
          </p>
        </div>
      )}
      <h2 className={styles.heading}>Poll Options</h2>

      {mode === EMode.RANKED && pollStatus === PollStatus.OPEN && options ? (
        // Ranked voting UI — user reorders options; no standard VoteCard list.
        <div className={styles.col}>
          {canJoin ? (
            <JoinPollButton policyType={policyTrait || 'EAS'} policyData={policyData} />
          ) : (
            <RankedVotingList
              options={options}
              rankedOrder={rankedOrder}
              onReorder={setRankedOrder}
              onVote={onVote}
              isLoading={isSubmittingVotes}
              isUserJoined={!!isUserJoined}
            />
          )}
        </div>
      ) : (
        <>
          <VoteSummarySection
            mode={mode || 'QV'}
            pollType={pollType || 'NOT_SELECTED'}
            options={options}
            votes={votes}
            maxVotePerPerson={Number(maxVotePerPerson || 0)}
            currentTotalVotes={votes.reduce((acc, v) => acc + Number(v.votes), 0)}
            onVoteChange={handleVoteChange}
            onVote={onVote}
            isLoading={isSubmittingVotes}
            handleWeightedVoteChange={handleWeightedVoteChange}
            canVote={isUserJoined}
          >
            <ul className={styles['candidate-list']}>
              {options &&
                (isTallied && pollResults
                  ? [...options]
                      .map((option, index: number) => ({
                        option,
                        votes: pollResults ? Number(pollResults[index].value) || 0 : 0,
                        prevIndex: index
                      }))
                      .sort((a, b) => b.votes - a.votes)
                  : options.map((option, index) => ({
                      option,
                      votes: Number(votes.find(v => v.index === index)?.votes) || 0,
                      prevIndex: index
                    }))
                ).map(({ option, votes, prevIndex }, index) => (
                  <VoteCard
                    key={prevIndex}
                    option={option}
                    mode={mode || 'QV'}
                    votes={votes}
                    isTallied={isTallied}
                    pollOpen={pollStatus === PollStatus.OPEN}
                    maxVotePerPerson={Number(maxVotePerPerson || 1)}
                    index={prevIndex}
                    totalVotes={Number(totalVotes || 0)}
                    isUserRegistered={isUserJoined}
                    handleWeightedVoteChange={handleWeightedVoteChange}
                    isWinner={isTallied && index === 0}
                    pollType={PollType.SINGLE_VOTE}
                    isInvalid={Boolean(isVotesInvalid[prevIndex])}
                    onVoteChange={(index, votes) => {
                      handleVoteChange(index, votes);
                    }}
                    onInvalidStatusChange={status => handleInvalidStatusChange(prevIndex, status)}
                    onVote={onVote}
                    isLoading={isSubmittingVotes}
                  />
                ))}
            </ul>
          </VoteSummarySection>
          {(canJoin || canVote) && (
            <div className={styles.col}>
              {canJoin ? (
                <JoinPollButton policyType={policyTrait || 'EAS'} policyData={policyData} />
              ) : (
                canVote &&
                pollType !== PollType.MULTIPLE_VOTE && (
                  <button
                    className={styles['poll-btn']}
                    onClick={onVote}
                    disabled={isSubmittingVotes || Object.values(isVotesInvalid).some(v => v)}
                  >
                    {isSubmittingVotes ? (
                      <span className={styles.loadingContainer}>
                        <LoadingPulse size='small' variant='primary' text='Submitting...' />
                      </span>
                    ) : (
                      <p>Vote Now</p>
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}
      {(loadingPollResults || canPublish) && (
        <div className={styles.publishSection}>
          {loadingPollResults ? (
            <div className={`${styles.elegantPublishBtn} ${styles.checking}`}>
              <LoadingPulse size='medium' variant='check' text='Checking results...' />
            </div>
          ) : (
            <Link href={`/polls/${pollAddress}/publish`} className={styles.elegantPublishBtn}>
              <div className={styles.publishContent}>
                <span className={styles.publishIcon}>🚀</span>
                <span className={styles.publishText}>Publish Results</span>
                <span className={styles.sparkle}>✨</span>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default VotingSection;
