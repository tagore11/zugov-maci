import { LoadingPulse } from '@/components/shared';
import { type PollOption } from '@/types';
import { useCallback } from 'react';
import styles from './index.module.css';

const MAX_RANKED_VOTE_OPTIONS = 12;

interface RankedVotingListProps {
  options: PollOption[];
  /** Option indices in preference order (index 0 = 1st choice). */
  rankedOrder: number[];
  onReorder: (orderedIndices: number[]) => void;
  onVote: () => void;
  isLoading: boolean;
  isUserJoined: boolean;
}

const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

const RankedVotingList = ({
  options,
  rankedOrder,
  onReorder,
  onVote,
  isLoading,
  isUserJoined
}: RankedVotingListProps) => {
  const maxRankable = Math.min(options.length, MAX_RANKED_VOTE_OPTIONS);
  const unrankedIndices = options.map((_, i) => i).filter(i => !rankedOrder.includes(i));

  const moveUp = useCallback(
    (position: number) => {
      if (position === 0) return;
      const next = [...rankedOrder];
      [next[position - 1], next[position]] = [next[position], next[position - 1]];
      onReorder(next);
    },
    [rankedOrder, onReorder]
  );

  const moveDown = useCallback(
    (position: number) => {
      if (position === rankedOrder.length - 1) return;
      const next = [...rankedOrder];
      [next[position], next[position + 1]] = [next[position + 1], next[position]];
      onReorder(next);
    },
    [rankedOrder, onReorder]
  );

  const addToRanking = useCallback(
    (optionIndex: number) => {
      if (rankedOrder.length >= maxRankable) return;
      onReorder([...rankedOrder, optionIndex]);
    },
    [rankedOrder, onReorder, maxRankable]
  );

  const removeFromRanking = useCallback(
    (position: number) => {
      onReorder(rankedOrder.filter((_, i) => i !== position));
    },
    [rankedOrder, onReorder]
  );

  return (
    <div className={styles.container}>
      <p className={styles.hint}>
        Order candidates from most to least preferred. You can rank up to {maxRankable} options.
      </p>

      {rankedOrder.length > 0 && (
        <ol className={styles.rankedList}>
          {rankedOrder.map((optionIndex, position) => {
            const option = options[optionIndex];
            return (
              <li key={optionIndex} className={styles.rankedItem}>
                <span className={styles.rankBadge}>{ORDINAL[position]}</span>
                <span className={styles.optionName}>{option.name || `Option ${optionIndex + 1}`}</span>
                <div className={styles.controls}>
                  <button
                    className={styles.arrowBtn}
                    onClick={() => moveUp(position)}
                    disabled={position === 0}
                    aria-label='Move up'
                  >
                    ▲
                  </button>
                  <button
                    className={styles.arrowBtn}
                    onClick={() => moveDown(position)}
                    disabled={position === rankedOrder.length - 1}
                    aria-label='Move down'
                  >
                    ▼
                  </button>
                  <button className={styles.removeBtn} onClick={() => removeFromRanking(position)} aria-label='Remove'>
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {rankedOrder.length === 0 && <p className={styles.empty}>No candidates ranked yet. Add candidates below.</p>}

      {unrankedIndices.length > 0 && rankedOrder.length < maxRankable && (
        <div className={styles.unrankedSection}>
          <p className={styles.unrankedLabel}>Add to ranking</p>
          <ul className={styles.unrankedList}>
            {unrankedIndices.map(optionIndex => (
              <li key={optionIndex} className={styles.unrankedItem}>
                <span className={styles.optionName}>{options[optionIndex].name || `Option ${optionIndex + 1}`}</span>
                <button className={styles.addBtn} onClick={() => addToRanking(optionIndex)}>
                  + Add
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        className={styles.submitBtn}
        onClick={onVote}
        disabled={isLoading || rankedOrder.length === 0 || !isUserJoined}
      >
        {isLoading ? <LoadingPulse size='small' variant='primary' text='Submitting...' /> : 'Submit Rankings'}
      </button>
    </div>
  );
};

export default RankedVotingList;
