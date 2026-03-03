import useAppConstants from '@/hooks/useAppConstants';
import styles from '@/styles/publish.module.css';
import { useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';

interface HardhatConfigProps {
  isSelected: boolean;
  onClick: () => void;
  pollId: string;
}

const CommandBlock = ({ command }: { command: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.commandBlock}>
      <pre className={styles.commandText}>{command}</pre>
      <button className={styles.copyButton} onClick={copyToClipboard} title={copied ? 'Copied!' : 'Copy to clipboard'}>
        {copied ? <FiCheck /> : <FiCopy />}
      </button>
    </div>
  );
};

export const HardhatConfig = ({ pollId, isSelected, onClick }: HardhatConfigProps) => {
  const { slugs } = useAppConstants();

  return (
    <div className={styles['config-wrapper']}>
      <div className={styles['config-option']} onClick={onClick}>
        <div className={`${styles.dot} ${isSelected ? styles.selected : ''}`}></div>
        <div className={styles['gen-container']}>
          <p className={styles['config-heading']}>Generate results Locally</p>
          {isSelected && (
            <>
              <div className={styles.instructionsContainer}>
                <div className={styles.stepBlock}>
                  <h3 className={styles.stepTitle}>Step 1: Clone and Setup</h3>
                  <CommandBlock command='git clone https://github.com/PriVote-Project/privote-contracts.git' />
                  <CommandBlock command='cd privote-contracts' />
                  <CommandBlock command='yarn install' />
                  <CommandBlock command='yarn download-zkeys' />
                </div>

                <div className={styles.stepBlock}>
                  <h3 className={styles.stepTitle}>Step 2: Merge Signups</h3>
                  <CommandBlock command={`yarn hardhat merge --poll ${pollId} --network ${slugs.coordinator}`} />
                </div>

                <div className={styles.stepBlock}>
                  <h3 className={styles.stepTitle}>Step 3: Generate Results & submit on-chain</h3>
                  <p className={styles.stepDescription}>
                    Replace <code>&lt;private-key&gt;</code> with your coordinator&apos;s private key used while
                    creating the poll.
                  </p>
                  <CommandBlock
                    command={`yarn hardhat prove --poll ${pollId} --output-dir ./out-dir/ --tally-file ./out-dir/tally.json --submit-on-chain --coordinator-private-key <private-key> --network ${slugs.coordinator}`}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HardhatConfig;
