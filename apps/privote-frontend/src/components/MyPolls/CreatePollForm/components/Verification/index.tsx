import { PollPolicyType } from '@/types';
import { POLICY_ICONS } from '@/utils/constants';
import { useEffect, useState } from 'react';
import { MdPolicy } from 'react-icons/md';
import type { PolicyConfigType, VerificationProps } from '../../types';
import AnonAadhaarPolicyConfig from './AnonAadhaarPolicyConfig';
import EASPolicyConfig from './EASPolicyConfig';
import ERC20PolicyConfig from './ERC20PolicyConfig';
import GitcoinPolicyConfig from './GitcoinPolicyConfig';
import styles from './index.module.css';
import SemaphorePolicyConfig from './SemaphorePolicyConfig';
import Image from 'next/image';
import TokenPolicyConfig from './TokenPolicyConfig';
import ERC20VotesConfig from './ERC20VotesConfig';
import MerkleProofPolicyConfig from './MerkleProofPolicyConfig';
import useAppConstants from '@/hooks/useAppConstants';
import { Tooltip } from 'react-tooltip';
import ZupassPolicyConfig from './ZupassPolicyConfig';

// Display names for each policy
const POLICY_NAMES: Record<PollPolicyType, string> = {
  [PollPolicyType.AnonAadhaar]: 'Anon Aadhaar',
  [PollPolicyType.EAS]: 'Ethereum Attestation Service',
  [PollPolicyType.ERC20]: 'Token (ERC20)',
  [PollPolicyType.ERC20Votes]: 'ERC20 Votes',
  [PollPolicyType.FreeForAll]: 'None',
  [PollPolicyType.GitcoinPassport]: 'Gitcoin Passport',
  [PollPolicyType.MerkleProof]: 'Whitelist',
  [PollPolicyType.Semaphore]: 'Semaphore',
  [PollPolicyType.Token]: 'NFT',
  [PollPolicyType.Zupass]: 'Devcon / Zupass'
};

// Define which policies require additional configuration
const POLICIES_WITH_CONFIG: Record<PollPolicyType, boolean> = {
  [PollPolicyType.FreeForAll]: false,
  [PollPolicyType.AnonAadhaar]: true,
  [PollPolicyType.EAS]: true,
  [PollPolicyType.ERC20]: true,
  [PollPolicyType.ERC20Votes]: true,
  [PollPolicyType.GitcoinPassport]: true,
  [PollPolicyType.MerkleProof]: true,
  [PollPolicyType.Semaphore]: true,
  [PollPolicyType.Token]: true,
  [PollPolicyType.Zupass]: true
};

/**
 * Get the appropriate configuration component based on policy type
 */
const getPolicyConfigComponent = (
  policyType: PollPolicyType,
  config: PolicyConfigType,
  onConfigChange: (config: PolicyConfigType) => void
) => {
  switch (policyType) {
    case PollPolicyType.AnonAadhaar:
      return <AnonAadhaarPolicyConfig config={config} onConfigChange={onConfigChange} />;
    case PollPolicyType.ERC20:
      return <ERC20PolicyConfig config={config} onConfigChange={onConfigChange} />;
    case PollPolicyType.Token:
      return <TokenPolicyConfig config={config} onConfigChange={onConfigChange} />;
    case PollPolicyType.EAS:
      return <EASPolicyConfig config={config} onConfigChange={onConfigChange} />;
    case PollPolicyType.GitcoinPassport:
      return <GitcoinPolicyConfig config={config} onConfigChange={onConfigChange} />;
    case PollPolicyType.ERC20Votes:
      return <ERC20VotesConfig config={config} onConfigChange={onConfigChange} />;
    case PollPolicyType.MerkleProof:
      return <MerkleProofPolicyConfig config={config} onConfigChange={onConfigChange} />;
    case PollPolicyType.Semaphore:
      return <SemaphorePolicyConfig config={config} onConfigChange={onConfigChange} />;
    case PollPolicyType.Zupass:
      return <ZupassPolicyConfig config={config} onConfigChange={onConfigChange} />;
    default:
      return null;
  }
};

/**
 * Main Verification component
 */
const Verification = ({
  handlePolicyTypeChange,
  policyType,
  policyConfig,
  onPolicyConfigChange
}: VerificationProps) => {
  const [selectedPolicy, setSelectedPolicy] = useState<PollPolicyType>(policyType);
  const constants = useAppConstants();

  // Get supported policies for current chain
  const supportedPolicies = constants.supportedPolicies || [];

  // Update selected policy when policyType changes externally
  useEffect(() => {
    setSelectedPolicy(policyType);
  }, [policyType]);

  // Handle policy selection
  const handlePolicySelect = (policy: PollPolicyType) => {
    // Only allow selection if policy is supported
    if (!supportedPolicies.includes(policy)) {
      return;
    }

    setSelectedPolicy(policy);

    // Create a custom event to pass to the handler
    const event = {
      target: { value: policy }
    } as React.ChangeEvent<HTMLSelectElement>;

    handlePolicyTypeChange(event);
  };

  // Check if a policy is supported on current chain
  const isPolicySupported = (policy: PollPolicyType) => {
    return supportedPolicies.includes(policy);
  };

  // Get tooltip message for unsupported policy
  const getUnsupportedTooltip = (policy: PollPolicyType) => {
    const chainName = constants.chain.name || 'this network';
    return `${POLICY_NAMES[policy]} is not supported on ${chainName}`;
  };

  return (
    <div className={styles.verification}>
      <h1>Verification</h1>
      <p className={styles.description}>
        Select a verification method for your poll. This defines how users will authenticate to vote.
      </p>

      {/* Policy selection grid */}
      <div className={styles.policyGrid}>
        {Object.values(PollPolicyType).map(policy => {
          const isSupported = isPolicySupported(policy);
          const tooltipId = `policy-tooltip-${policy}`;

          return (
            <div key={policy} className={styles.policyCardWrapper}>
              <button
                type='button'
                className={`${styles.policyCard} ${
                  selectedPolicy === policy ? styles.selected : ''
                } ${!isSupported ? styles.disabled : ''}`}
                onClick={() => handlePolicySelect(policy)}
                disabled={!isSupported}
                aria-label={`Select ${POLICY_NAMES[policy]} verification method`}
                data-tooltip-id={!isSupported ? tooltipId : undefined}
                data-tooltip-content={!isSupported ? getUnsupportedTooltip(policy) : undefined}
              >
                {POLICY_ICONS[policy] ? (
                  <Image
                    width={31}
                    height={31}
                    alt={`${POLICY_NAMES[policy]} icon`}
                    src={POLICY_ICONS[policy]}
                    className={styles.policyIcon}
                  />
                ) : (
                  <MdPolicy size={31} fill='#fff' />
                )}
                <span className={styles.policyName}>{POLICY_NAMES[policy]}</span>
              </button>

              {/* Tooltip for unsupported policies */}
              {!isSupported && (
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
                    maxWidth: '200px',
                    textAlign: 'center',
                    zIndex: 1000
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Additional configuration for selected policy */}
      {selectedPolicy && POLICIES_WITH_CONFIG[selectedPolicy] && (
        <div className={styles.configContainer}>
          <h2 className={styles.configTitle}>{POLICY_NAMES[selectedPolicy]} Configuration</h2>
          {getPolicyConfigComponent(
            selectedPolicy,
            policyConfig || {},
            onPolicyConfigChange || (() => console.warn('Policy config change handler not provided'))
          )}
        </div>
      )}
    </div>
  );
};

export default Verification;
