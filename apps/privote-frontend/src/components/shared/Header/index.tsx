'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { CiMenuFries } from 'react-icons/ci';
import { MdClose } from 'react-icons/md';
import { Logo } from '../../../../public';
import { HomeIcon, PollIcon, UserIcon } from './components';
import styles from './index.module.css';

export default function Header() {
  const [isChecked, setIsChecked] = useState(false);
  const pathname = usePathname();

  const isPath = useCallback(
    (match: string) => {
      const splitPath = pathname.split('/');
      return splitPath.includes(match);
    },
    [pathname]
  );

  return (
    <>
      <div className={styles['header-wrapper']}>
        <header className={styles.header}>
          <div className={styles['content-header']}>
            <Link href='/'>
              <div className={styles['header-logo']}>
                <Image src={Logo} alt='logo' width={30} height={30} />
                <p>
                  PRI<span className={styles.highlight}>VOTE</span>
                </p>
              </div>
            </Link>
            <button
              className={styles.hamburger}
              onClick={() => {
                setIsChecked(!isChecked);
              }}
            >
              {isChecked ? <MdClose size={24} color='#fff' /> : <CiMenuFries size={24} color='#fff' />}
            </button>
          </div>
          <div className={`${styles.content} ${isChecked ? styles.checked : ''}`}>
            <nav className={styles.nav}>
              <ul className={styles['nav-list']}>
                <Link href='/' className={`${styles.row} ${pathname === '/' ? styles.active : ''}`}>
                  <HomeIcon />
                  Home
                </Link>
                <Link
                  href='/polls'
                  className={`${styles.row} ${styles.pollRow} ${isPath('polls') ? styles.active : ''}`}
                >
                  <PollIcon />
                  Polls
                </Link>
                <Link
                  href='/my-polls'
                  className={`${styles.row} ${styles.adminRow} ${isPath('my-polls') ? styles.active : ''}`}
                >
                  <UserIcon />
                  My Polls
                </Link>
              </ul>
            </nav>
            <div className={styles.actions}>
              <ConnectButton label='Login' />
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
