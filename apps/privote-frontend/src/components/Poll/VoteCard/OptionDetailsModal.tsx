import { Button, LoadingPulse, MarkdownRenderer, Modal } from '@/components/shared';
import { PollType } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { GoLink } from 'react-icons/go';
import { IoMdClose } from 'react-icons/io';
import styles from './OptionDetailsModal.module.css';

interface OptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  pollType: PollType;
  onVote?: () => void;
  isLoading: boolean;
}

const OptionDetailsModal: React.FC<OptionDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  imageUrl,
  link,
  pollType,
  onVote,
  isLoading
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} maxWidth='700px' padding='8px'>
      <div className={styles.container}>
        {/* <div className={styles.blur}></div> */}
        <div className={styles.header}>
          {imageUrl && (
            <div className={styles.imageContainer}>
              <Image src={imageUrl} alt={title} width={100} height={100} />
            </div>
          )}
          <h2 className={styles.title}>{title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <IoMdClose size={24} fill='#434343' />
          </button>
        </div>
        <div className={styles.divider} />
        <div className={styles.content}>
          <div className={styles.description}>
            <MarkdownRenderer content={description} className={styles.description} />
          </div>
          {link && (
            <Link className={styles.link} href={link} target='_blank' rel='noopener noreferrer'>
              <GoLink fill='#7F58B7' size={18} /> <span className={styles['link-text']}>Link</span>
            </Link>
          )}
        </div>
        {pollType === PollType.SINGLE_VOTE && onVote && (
          <div className={styles.footer}>
            <Button
              action={onVote}
              disabled={isLoading || pollType !== PollType.SINGLE_VOTE}
              className={styles.voteButton}
            >
              {isLoading ? <LoadingPulse size='small' variant='primary' text='Submitting...' /> : <p>Vote Now</p>}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OptionDetailsModal;
