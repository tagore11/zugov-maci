import Link from 'next/link';
import { type PollConfigurationProps } from '../../types';
import WithoutImageInput from '../WithoutImageInput';
import styles from './index.module.css';
import { useSigContext } from '@/contexts/SigContext';
import { PORTO_CONNECTOR_ID } from '@/utils/constants';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

const PollConfiguration = ({ setPollConfig, pollConfig, publicKey, handlePubKeyChange }: PollConfigurationProps) => {
  const { maciKeypair, deleteKeypair, generateKeypair } = useSigContext();
  const { connector } = useAccount();
  const isPorto = connector?.id === PORTO_CONNECTOR_ID;
  const [keyOption, setKeyOption] = useState<'wallet' | 'manual'>(() => (isPorto ? 'manual' : 'wallet'));

  useEffect(() => {
    if (keyOption === 'wallet' && maciKeypair && pollConfig === 1) {
      handlePubKeyChange({
        target: { value: maciKeypair.publicKey.serialize() }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [maciKeypair, keyOption, pollConfig]);

  return (
    <div className={styles['poll-config-wrapper']}>
      <h1>Poll Configuration</h1>
      <div className={styles['poll-config']}>
        <div className={styles['config-wrapper']}>
          <div className={styles['config-option']} onClick={() => setPollConfig(1)}>
            <div className={`${styles.dot} ${styles.first} ${pollConfig === 1 ? styles.selected : ''}`}></div>
            <div className={styles['gen-container']}>
              <p className={styles.text}>We dont trust you 🤨, we have coordinator public key</p>
              {pollConfig === 1 && (
                <div className={styles['public-input-container']}>
                  {!isPorto && (
                    <div className={styles['key-option-selector']}>
                      <div className={styles['option-group']}>
                        <label className={styles['radio-option']}>
                          <input
                            type='radio'
                            name='keyOption'
                            value='wallet'
                            checked={keyOption === 'wallet'}
                            onChange={e => {
                              setKeyOption('wallet');
                              if (maciKeypair) {
                                handlePubKeyChange({
                                  target: { value: maciKeypair.publicKey.serialize() }
                                } as React.ChangeEvent<HTMLInputElement>);
                              }
                            }}
                          />
                          <span className={styles['radio-label']}>Use Connected Wallet Keypair</span>
                        </label>
                        <label className={styles['radio-option']}>
                          <input
                            type='radio'
                            name='keyOption'
                            value='manual'
                            checked={keyOption === 'manual'}
                            onChange={e => {
                              setKeyOption('manual');
                              handlePubKeyChange({
                                target: { value: '' }
                              } as React.ChangeEvent<HTMLInputElement>);
                            }}
                          />
                          <span className={styles['radio-label']}>Enter Manually</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {keyOption === 'wallet' && !isPorto && (
                    <div className={styles['wallet-key-section']}>
                      {maciKeypair ? (
                        <div className={styles['key-details']}>
                          <div className={styles['key-container']}>
                            <strong>Public Key:</strong>
                            <p>{maciKeypair.publicKey.serialize()}</p>
                          </div>
                          <div className={styles['key-management']}>
                            <button
                              type='button'
                              className={`${styles['key-action-btn']} ${styles['delete-btn']}`}
                              onClick={() => {
                                deleteKeypair();
                                handlePubKeyChange({
                                  target: { value: '' }
                                } as React.ChangeEvent<HTMLInputElement>);
                              }}
                            >
                              🗑️ Delete Keypair
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles['no-keypair']}>
                          <p>No keypair found. Generate one to proceed.</p>
                          <button
                            type='button'
                            className={`${styles['key-action-btn']} ${styles['generate-btn']}`}
                            onClick={generateKeypair}
                          >
                            🔑 Generate Keypair
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {keyOption === 'manual' && (
                    <div className={styles['manual-key-section']}>
                      <WithoutImageInput
                        onChange={handlePubKeyChange}
                        value={publicKey}
                        placeholder='macipk.a26f6f713...'
                        className={styles['pub-key-input']}
                      />
                      <div className={styles['key-gen']}>
                        You can generate maci key pair from{' '}
                        <Link
                          href='https://maci.pse.dev/docs/core-concepts/maci-keys#generate-maci-keys'
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          here
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles['config-wrapper']}>
          <div className={styles['config-option']} onClick={() => setPollConfig(2)}>
            <div className={`${styles.dot} ${pollConfig === 2 ? styles.selected : ''}`}></div>
            <div className={styles['gen-container']}>
              <p className={styles.text}>Use Privote&apos;s trusted Coordinator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollConfiguration;
