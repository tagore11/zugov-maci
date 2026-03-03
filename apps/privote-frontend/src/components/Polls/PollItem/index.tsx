import Circle from '@/assets/circle.svg';
import { PollStatus, type Poll } from '@/types';
import { POLICY_ICONS } from '@/utils/constants';
import { unixTimestampToDate } from '@/utils/formatPollDate';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import styles from './index.module.css';

interface PollItemProps {
  poll: Poll;
}

const PollItem: React.FC<PollItemProps> = ({ poll }) => {
  return (
    <li className={styles['polls-list-item']}>
      <Link href={`/polls/${poll.id}`}>
        <div
          className={`${styles['poll-status']} ${
            poll.status === PollStatus.OPEN
              ? styles.live
              : poll.status === PollStatus.NOT_STARTED
                ? styles.notStarted
                : styles.ended
          }`}
        >
          <Image src={Circle} alt='circle' />
          {poll.status === PollStatus.OPEN
            ? 'Live now'
            : poll.status === PollStatus.NOT_STARTED
              ? 'Not Started'
              : 'Ended'}
        </div>
        <div className={styles.container}>
          <div className={styles.left}>
            <div className={styles.heading}>
              <h2>{poll.name} </h2>
              {POLICY_ICONS[poll.policyTrait] && (
                <Image src={POLICY_ICONS[poll.policyTrait] as string} width={26} height={26} alt='icon' />
              )}
            </div>
            <p>{Number(poll.voteOptions)} Options</p>
          </div>
          <div className={styles.right}>
            <p>
              <span>Start Time</span>
              <span>:</span>
              <span>{unixTimestampToDate(poll.startDate)}</span>
            </p>
            <p>
              <span>End Time</span>
              <span>:</span>
              <span>{unixTimestampToDate(poll.endDate)}</span>
            </p>
          </div>
        </div>
        {poll.status === PollStatus.RESULT_COMPUTED && (
          <Link href={`/poll/${poll.id}`} className={styles.viewButton}>
            <p>View Results</p>
          </Link>
        )}
      </Link>
    </li>
  );
};

export default PollItem;
