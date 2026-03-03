import { useState, useEffect } from 'react';
import { IPolicyConfigProps } from '../types';
import { isAddress } from 'viem';
import { uuidToBigInt } from '@pcd/util';
import useAppConstants from '@/hooks/useAppConstants';
import { ZUPASS_DEVCON_DEFAULTS } from '@/utils/constants';
import styles from '../index.module.css';

type ZupassMode = 'devcon' | 'custom';

/**
 * Configuration form for Zupass policy
 * Allows poll creators to specify event ID, signer public keys, and verifier contract
 */
const ZupassPolicyConfig = ({ config, onConfigChange }: IPolicyConfigProps) => {
  const { contracts } = useAppConstants();

  const [mode, setMode] = useState<ZupassMode>();
  const [eventId, setEventId] = useState(config.eventId || '');
  const [signer1, setSigner1] = useState(config.signer1 || '');
  const [signer2, setSigner2] = useState(config.signer2 || '');
  const [zupassVerifier, setZupassVerifier] = useState(config.zupassVerifier || contracts.zupassVerifier || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill Devcon defaults when mode is set to devcon
  useEffect(() => {
    if (mode === 'devcon') {
      const eventIdBigInt = uuidToBigInt(ZUPASS_DEVCON_DEFAULTS.eventId).toString();
      setEventId(eventIdBigInt);
      setSigner1(ZUPASS_DEVCON_DEFAULTS.signer1);
      setSigner2(ZUPASS_DEVCON_DEFAULTS.signer2);
      if (contracts.zupassVerifier && contracts.zupassVerifier !== '0x') {
        setZupassVerifier(contracts.zupassVerifier);
      }
    } else if (mode === 'custom') {
      // Reset all fields except verifier when switching to custom mode
      setEventId('');
      setSigner1('');
      setSigner2('');
      // Keep verifier from contracts if available
      if (contracts.zupassVerifier && contracts.zupassVerifier !== '0x') {
        setZupassVerifier(contracts.zupassVerifier);
      } else {
        setZupassVerifier('');
      }
    }
  }, [mode, contracts.zupassVerifier]);

  // Validate UUID format for eventId
  const validateEventId = (value: string): boolean => {
    if (!value) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  };

  // Validate signer keys as uint256 (can be hex or decimal)
  const validateSignerKey = (value: string): boolean => {
    if (!value) return false;

    try {
      // Accept hex format (with or without 0x prefix)
      if (value.startsWith('0x')) {
        const hexValue = value.slice(2);
        if (!/^[0-9a-fA-F]+$/.test(hexValue)) return false;
        BigInt(value);
        return true;
      }

      // Accept decimal format
      if (/^\d+$/.test(value)) {
        BigInt(value);
        return true;
      }

      // Accept plain hex without 0x
      if (/^[0-9a-fA-F]+$/.test(value)) {
        BigInt('0x' + value);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  // Validate Ethereum address
  const validateAddress = (value: string): boolean => {
    if (!value) return false;
    return isAddress(value);
  };

  // Update parent config whenever local state changes
  useEffect(() => {
    // In devcon mode, always use the pre-filled values (they're already validated)
    if (mode === 'devcon') {
      if (eventId && signer1 && signer2 && zupassVerifier) {
        onConfigChange({
          ...config,
          eventId,
          signer1,
          signer2,
          zupassVerifier
        });
        setErrors({});
        return;
      }
    }

    // In custom mode, validate all fields
    const newErrors: Record<string, string> = {};

    // Validate all fields
    if (eventId && !validateEventId(eventId)) {
      newErrors.eventId = 'Invalid UUID format (e.g., d2ce5bb2-99a3-5a61-b7e6-1cd46d2ee00d)';
    }
    if (signer1 && !validateSignerKey(signer1)) {
      newErrors.signer1 = 'Invalid uint256 value (hex or decimal format)';
    }
    if (signer2 && !validateSignerKey(signer2)) {
      newErrors.signer2 = 'Invalid uint256 value (hex or decimal format)';
    }
    if (zupassVerifier && !validateAddress(zupassVerifier)) {
      newErrors.zupassVerifier = 'Invalid Ethereum address';
    }

    setErrors(newErrors);

    // Only update parent if all fields are valid and filled
    if (Object.keys(newErrors).length === 0 && eventId && signer1 && signer2 && zupassVerifier) {
      // Convert UUID to BigInt for contract storage (only if it's in UUID format)
      const eventIdBigInt = eventId.includes('-') ? uuidToBigInt(eventId).toString() : eventId;

      onConfigChange({
        ...config,
        eventId: eventIdBigInt,
        signer1,
        signer2,
        zupassVerifier
      });
    } else if (mode === 'custom') {
      // Clear config if invalid (only in custom mode)
      onConfigChange({
        ...config,
        eventId: '',
        signer1: '',
        signer2: '',
        zupassVerifier: ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, eventId, signer1, signer2, zupassVerifier]);

  return (
    <div className={styles.policyConfig}>
      {/* Mode Selection */}
      <div className={styles.radioGroup}>
        <button
          type='button'
          className={`${styles.policyCard} ${mode === 'devcon' ? styles.selected : ''}`}
          onClick={() => setMode('devcon')}
          style={{ padding: '12px 24px', cursor: 'pointer' }}
        >
          <span className={styles.policyName}>Devcon</span>
        </button>
        <button
          type='button'
          className={`${styles.policyCard} ${mode === 'custom' ? styles.selected : ''}`}
          onClick={() => setMode('custom')}
          style={{ padding: '12px 24px', cursor: 'pointer' }}
        >
          <span className={styles.policyName}>Custom</span>
        </button>
      </div>

      {/* Show configuration fields only in custom mode */}
      {mode === 'custom' && (
        <>
          {/* Event ID Input */}
          <div className={styles.configField}>
            <label htmlFor='eventId'>
              Event ID (UUID)
              <span className={styles.helpText}>
                The UUID of the event in the Zupass system. Users must have a ticket for this event.
              </span>
            </label>
            <input
              type='text'
              id='eventId'
              placeholder='d2ce5bb2-99a3-5a61-b7e6-1cd46d2ee00d'
              value={eventId}
              onChange={e => setEventId(e.target.value)}
              className={errors.eventId ? styles.inputError : ''}
            />
            {errors.eventId && <span className={styles.errorText}>{errors.eventId}</span>}
          </div>

          {/* Signer Public Key Part 1 */}
          <div className={styles.configField}>
            <label htmlFor='signer1'>
              Signer Public Key (Part 1)
              <span className={styles.helpText}>
                First part of the EdDSA public key as uint256 (hex or decimal format).
              </span>
            </label>
            <input
              type='text'
              id='signer1'
              placeholder='0x044e711fd3a1792a825aa896104da5276bbe710fd9b59dddea1aaf8d84535aaf or 13908133709081944902758389525983124100292637002438232157513257158004852609027'
              value={signer1}
              onChange={e => setSigner1(e.target.value)}
              className={errors.signer1 ? styles.inputError : ''}
            />
            {errors.signer1 && <span className={styles.errorText}>{errors.signer1}</span>}
          </div>

          {/* Signer Public Key Part 2 */}
          <div className={styles.configField}>
            <label htmlFor='signer2'>
              Signer Public Key (Part 2)
              <span className={styles.helpText}>
                Second part of the EdDSA public key as uint256 (hex or decimal format).
              </span>
            </label>
            <input
              type='text'
              id='signer2'
              placeholder='0x2b259329f0adf98c9b6cf2a11db7225fdcaa4f8796c61864e86154477da10663 or 7654374482676219729919246464135900991450848628968334062174564799457623790084'
              value={signer2}
              onChange={e => setSigner2(e.target.value)}
              className={errors.signer2 ? styles.inputError : ''}
            />
            {errors.signer2 && <span className={styles.errorText}>{errors.signer2}</span>}
          </div>

          {/* Zupass Verifier Contract Address */}
          <div className={styles.configField}>
            <label htmlFor='zupassVerifier'>
              Zupass Verifier Contract Address
              <span className={styles.helpText}>
                The address of the deployed ZK proof verifier contract for Zupass tickets.
              </span>
            </label>
            <input
              type='text'
              id='zupassVerifier'
              placeholder='0x2272cdb3596617886d0F48524DA486044E0376d6'
              value={zupassVerifier}
              onChange={e => setZupassVerifier(e.target.value)}
              className={errors.zupassVerifier ? styles.inputError : ''}
            />
            {errors.zupassVerifier && <span className={styles.errorText}>{errors.zupassVerifier}</span>}
          </div>

          {/* Information Box */}
          <div className={styles.infoBox}>
            <h4>📋 Zupass Configuration:</h4>
            <ul>
              <li>
                <strong>Event ID:</strong> Unique identifier for your event in Zupass. Only users with tickets for this
                event can vote.
              </li>
              <li>
                <strong>Signer Keys:</strong> The EdDSA public key that signed the tickets. This is provided by Zupass
                and ensures ticket authenticity.
              </li>
              <li>
                <strong>Verifier Contract:</strong> On-chain contract that verifies the zero-knowledge proofs generated
                by Zupass.
              </li>
              <li>
                <strong>Privacy:</strong> Voters prove they have a valid ticket without revealing their identity or
                ticket details.
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ZupassPolicyConfig;
