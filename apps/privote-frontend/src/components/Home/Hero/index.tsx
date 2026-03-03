'use client';
import Link from 'next/link';
import styles from './index.module.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

interface HeroProps {
  title?: string;
  description?: string;
  status?: string;
}

export const Hero = ({
  description = 'Create polls, participate in elections, and make your voice heard in a Private and Decentralized way.',
  status = 'Privote: The all new way of voting through'
}: HeroProps) => {
  const { isConnected } = useAccount();

  return (
    <div className={styles.hero}>
      <div className={styles.status}>
        {status}{' '}
        <Link href={'https://maci.pse.dev/'} target='_blank' rel='noopener noreferrer'>
          MACI
        </Link>
      </div>
      <h1 className={styles.heading}>
        The Future of
        <br />
        Voting is Private
      </h1>
      <p className={styles.description}>{description}</p>
      <div className={styles.actions}>
        {!isConnected && (
          <div className={styles['connect-btn-wrapper']}>
            <ConnectButton label='Login' />
          </div>
        )}
        {isConnected && (
          <Link className={styles['create-poll']} href='/my-polls?create=true'>
            <p>Create Poll</p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Hero;
