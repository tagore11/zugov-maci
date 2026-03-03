import Link from 'next/link';
import React from 'react';
import Modal from '../Modal';
import styles from './index.module.css';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal title='How to Vote' isOpen={isOpen} onClose={onClose} showCloseButton maxWidth='600px'>
      <div className={styles.divider} />
      <div className={styles.instructions}>
        <ol>
          <li>Connect your wallet.</li>
          <li>
            Get funds for gas on the Optimism network if needed (use a faucet like{' '}
            <Link href='https://www.optimism.io/apps/bridges'>this</Link>
            ).
          </li>
          <li>Login to the mAadhaar app with your Aadhaar credentials and generate a QR code. Save it.</li>
          <li>Click on the Aadhaar login button on the Privote&apos;s poll page and upload your QR code.</li>
          <li>Wait for proofs to be generated (this may take a few minutes).</li>
          <li>Register with your Aadhaar proof using your wallet.</li>
          <li>
            Distribute your votes to the projects you like (remember, it&apos;s quadratic voting, so spreading votes
            wisely is key!).
          </li>
          <li>Click &quot;Vote&quot; to submit your votes.</li>
          <li>You&apos;re done! 🎉 You can change your votes anytime before the poll ends.</li>
        </ol>
        <div className={styles.note}>
          <p>
            📢 Share this with others to get more votes for your favorite projects! Anyone with a valid Aadhaar can
            vote.
          </p>
          <p>Happy Voting! 🗳️🚀</p>
        </div>
      </div>
    </Modal>
  );
};

export default InstructionsModal;
