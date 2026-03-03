import { EMode, PollType } from '@/types';
import { MAX_VOICE_CREDITS } from '@/utils/constants';
import Image from 'next/image';
import { useEffect } from 'react';
import styles from '../index.module.css';
import type { PollSettingsProps } from '../types';

export const PollSettings = ({ pollData, onPollTypeChange, onModeChange, onMaxVoteChange }: PollSettingsProps) => {
  useEffect(() => {
    if (pollData.pollType === PollType.SINGLE_VOTE) {
      if (pollData.mode !== EMode.FULL) {
        onModeChange({ target: { value: EMode.FULL } } as React.ChangeEvent<HTMLSelectElement>);
      }
      if (pollData.maxVotePerPerson !== 1n) {
        onMaxVoteChange({ target: { value: '1' } } as React.ChangeEvent<HTMLInputElement>);
      }
    } else if (pollData.pollType === PollType.MULTIPLE_VOTE) {
      if (pollData.mode === EMode.FULL) {
        onModeChange({ target: { value: '' } } as React.ChangeEvent<HTMLSelectElement>);
      }
      if (pollData.maxVotePerPerson > MAX_VOICE_CREDITS) {
        onMaxVoteChange({ target: { value: MAX_VOICE_CREDITS.toString() } } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  }, [pollData.pollType, pollData.mode, pollData.maxVotePerPerson, onModeChange, onMaxVoteChange]);

  const getAvailableVoteTypes = () => {
    if (pollData.pollType === PollType.RANKED_VOTE) {
      return [{ value: EMode.RANKED, label: 'Ranked' }];
    }
    if (pollData.pollType === PollType.SINGLE_VOTE) {
      return [{ value: EMode.FULL, label: 'Full' }];
    }

    if (pollData.pollType === PollType.MULTIPLE_VOTE) {
      return [
        { value: EMode.QV, label: 'Quadratic Vote' },
        { value: EMode.NON_QV, label: 'Non Quadratic Vote' }
      ];
    }

    return [
      { value: EMode.QV, label: 'Quadratic Vote' },
      { value: EMode.NON_QV, label: 'Non Quadratic Vote' },
      { value: EMode.FULL, label: 'Full' },
      { value: EMode.RANKED, label: 'Ranked' }
    ];
  };

  const availableVoteTypes = getAvailableVoteTypes();
  const isVoteTypeDisabled = pollData.pollType === PollType.SINGLE_VOTE;
  const shouldShowVoteCounter = pollData.pollType === PollType.MULTIPLE_VOTE;

  return (
    <>
      <div className={styles['input-field-container']}>
        <label className={styles.label}>Select Poll Type</label>
        <select required value={pollData.pollType || ''} onChange={onPollTypeChange}>
          <option value=''>Select Poll Type</option>
          <option value={PollType.SINGLE_VOTE}>Single Choice</option>
          <option value={PollType.MULTIPLE_VOTE}>Multiple Choice</option>
        </select>
      </div>

      {shouldShowVoteCounter && (
        <div className={styles['input-field-container-row']}>
          <label className={styles.label}>Max. vote per person</label>
          <div className={styles.box}>
            <button
              type='button'
              onClick={() => {
                if (pollData.maxVotePerPerson > 1) {
                  onMaxVoteChange(1, 'remove');
                }
              }}
            >
              <Image src='/minus.svg' alt='minus' width={20} height={20} />
            </button>
            <input
              type='number'
              value={pollData.maxVotePerPerson?.toString()}
              onChange={onMaxVoteChange}
              min={1}
              max={MAX_VOICE_CREDITS.toString()}
            />
            <button
              type='button'
              onClick={() => {
                if (pollData.maxVotePerPerson < MAX_VOICE_CREDITS) {
                  onMaxVoteChange(1, 'add');
                }
              }}
            >
              <Image src='/plus.svg' alt='plus' width={20} height={20} />
            </button>
          </div>
        </div>
      )}

      {pollData.pollType === PollType.MULTIPLE_VOTE && (
        <div className={styles['input-field-container']}>
          <label className={styles.label}>Select Vote Type</label>
          <select
            value={pollData.mode === null ? '' : pollData.mode}
            onChange={onModeChange}
            required
            disabled={isVoteTypeDisabled}
            style={{ opacity: isVoteTypeDisabled ? 0.6 : 1 }}
          >
            <option value=''>Select Vote Type</option>
            {availableVoteTypes.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
};
