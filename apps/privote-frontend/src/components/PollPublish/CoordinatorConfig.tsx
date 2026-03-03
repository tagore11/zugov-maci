import { FinalizeStatus } from '@/contexts/types';
import useCoordinatorContext from '@/hooks/userCoordinatorContext';
import styles from '@/styles/publish.module.css';
import { useEffect, useState, useMemo } from 'react';
import FinalizeLoader, { btnTextMap } from './FinalizePollLoader';
import usePollContext from '@/hooks/usePollContext';
import { Tooltip } from 'react-tooltip';
import { PublicKey } from '@maci-protocol/domainobjs';
import { useRouter } from 'next/navigation';

interface CoordinatorConfigProps {
  pollAddress: string;
  isSelected: boolean;
  onClick: () => void;
}

const CoordinatorConfig = ({ pollAddress, isSelected, onClick }: CoordinatorConfigProps) => {
  const router = useRouter();
  const [finalizeStatus, setFinalizeStatus] = useState<FinalizeStatus>('notStarted');
  const { finalizePoll } = useCoordinatorContext();
  const [isModalVisible, setIsModalVisible] = useState(true);

  const { poll } = usePollContext();
  const { coordinatorPublicKey } = poll!;

  const isPrivoteCoordinator = useMemo(() => {
    const envCoordinatorKey = process.env.NEXT_PUBLIC_COORDINATOR_PUBLIC_KEY;
    if (!envCoordinatorKey || !coordinatorPublicKey) return false;

    const serializedKey = new PublicKey([coordinatorPublicKey[0], coordinatorPublicKey[1]]).serialize();
    return serializedKey === envCoordinatorKey;
  }, [coordinatorPublicKey]);

  const showLoader = isModalVisible && finalizeStatus !== 'notStarted';
  const isDisabled = !isPrivoteCoordinator;

  // update isModalVisible everytime status changes from 'notStarted'
  useEffect(() => {
    if (!isModalVisible && finalizeStatus === 'notStarted') {
      setIsModalVisible(true);
    }

    if (finalizeStatus === 'submitted') {
      setFinalizeStatus('redirecting');
      setTimeout(() => {
        router.push(`/polls/${pollAddress}`);
      }, 2000);
    }
  }, [finalizeStatus, isModalVisible, pollAddress]);

  const tooltipId = 'coordinator-disabled-tooltip';

  return (
    <div className={styles['config-wrapper']}>
      <div
        className={`${styles['config-option']} ${isDisabled ? styles['config-disabled'] : ''}`}
        onClick={isDisabled ? undefined : onClick}
        data-tooltip-id={isDisabled ? tooltipId : undefined}
        data-tooltip-content={
          isDisabled
            ? "This option is only available for polls created using Privote's coordinator service. Please use the local generation option to publish results."
            : undefined
        }
      >
        <div
          className={`${styles.dot} ${isSelected && !isDisabled ? styles.selected : ''} ${isDisabled ? styles['dot-disabled'] : ''}`}
        ></div>
        <div className={styles['gen-container']}>
          <div className={styles['heading-container']}>
            <p className={`${styles['config-heading']} ${isDisabled ? styles['heading-disabled'] : ''}`}>
              Use Privote&apos;s Coordinator Services
            </p>
          </div>

          {isDisabled && (
            <div className={`${styles['disabled-message']} ${styles['bg-card']}`}>
              <p className={styles.text}>
                🚫 This option is only available for polls created using Privote&apos;s coordinator service.
                <strong>You can generate poll results locally using the other option.</strong>
              </p>
            </div>
          )}

          {isSelected && !isDisabled && (
            <div className={styles['public-input-container']}>
              <p className={`${styles['bg-card']} ${styles.text}`}>
                Use Privote&apos;s trusted coordinator service to publish results
              </p>
              <button
                className={styles['publish-btn']}
                disabled={showLoader}
                onClick={() => finalizePoll({ setFinalizeStatus })}
              >
                {btnTextMap[finalizeStatus]}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {isDisabled && (
        <Tooltip
          id={tooltipId}
          place='top'
          variant='error'
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '6px',
            fontSize: '12px',
            padding: '8px 12px',
            maxWidth: '280px',
            textAlign: 'center',
            zIndex: 1000
          }}
        />
      )}

      <FinalizeLoader isOpen={showLoader} status={finalizeStatus} onClose={() => setIsModalVisible(false)} />
    </div>
  );
};

export default CoordinatorConfig;
