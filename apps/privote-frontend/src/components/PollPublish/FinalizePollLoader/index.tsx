import { FinalizeStatus } from '@/contexts/types';
import Image from 'next/image';
import checkIcon from '../../../../public/circle-tick.svg';
import loaderGif from '../../../../public/loader.gif';
import { Modal } from '../../shared';
import styles from './index.module.css';

export const btnTextMap: Record<FinalizeStatus, string> = {
  notStarted: 'Publish Result',
  signing: 'Sign Message...',
  merging: 'Merging Signups...',
  proving: 'Generating Proofs...',
  submitting: 'Submitting onchain...',
  submitted: 'Result Published',
  redirecting: 'Redirecting to poll page...'
};

const FinalizeLoader: React.FC<{
  isOpen: boolean;
  status: FinalizeStatus;
  onClose?: () => void;
}> = ({ isOpen, status, onClose }) => {
  return (
    <Modal isOpen={isOpen} showCloseButton maxWidth='300px' padding='8px' onClose={onClose || (() => {})}>
      <div className={styles.container}>
        {status === 'submitted' || status === 'redirecting' ? (
          <Image src={checkIcon} alt='check' width={200} height={200} />
        ) : (
          <Image src={loaderGif} alt='loader' width={200} height={200} />
        )}
        <div
          className={`${styles['content']} ${status === 'submitted' || status === 'redirecting' ? styles.published : ''}`}
        >
          <p className={styles.text}>{btnTextMap[status]}</p>
        </div>
      </div>
    </Modal>
  );
};

export default FinalizeLoader;
