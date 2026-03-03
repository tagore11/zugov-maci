import { PublicKey } from '@maci-protocol/domainobjs';
import { PollPolicyType } from '@/types';
import type { IPollData, PolicyConfigType } from '@/components/MyPolls/CreatePollForm/types';
import { isAddress } from 'viem';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates basic poll form fields
 */
export const validateBasicFields = (pollData: IPollData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!pollData.title.trim()) {
    errors.push({ field: 'title', message: 'Please enter a title' });
  }

  if (pollData.startTime.getTime() > pollData.endTime.getTime()) {
    errors.push({ field: 'startTime', message: 'Start time should be less than end time' });
  }

  if (pollData.startTime.getTime() < Date.now()) {
    errors.push({ field: 'startTime', message: 'Start time should be greater than current time' });
  }

  if (pollData.pollType === null) {
    errors.push({ field: 'pollType', message: 'Please select a poll type' });
  }

  if (pollData.mode === null) {
    errors.push({ field: 'mode', message: 'Please select a voting mode' });
  }

  return errors;
};

/**
 * Validates poll options
 */
export const validatePollOptions = (pollData: IPollData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (pollData.options.filter(opt => !opt.title?.trim()).length > 0) {
    errors.push({ field: 'options', message: 'Please add at least 1 option' });
  }

  // URL validation for option links
  const validUrlRegex = new RegExp(
    '((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)'
  );

  for (const option of pollData.options) {
    if (option.link && !validUrlRegex.test(option.link)) {
      errors.push({
        field: 'options',
        message: `Please enter a valid URL for Candidate: ${option.title}`
      });
    }
  }

  return errors;
};

/**
 * Validates poll configuration (public key)
 */
export const validatePollConfiguration = (pollConfig: number, publicKey: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (pollConfig !== 1 && pollConfig !== 2) {
    errors.push({ field: 'pollConfig', message: 'Please select a valid Poll Configuration' });
  }

  if (pollConfig === 1 && !PublicKey.isValidSerialized(publicKey)) {
    errors.push({ field: 'publicKey', message: 'Please enter a valid public key' });
  }

  return errors;
};

/**
 * Validates policy-specific configuration based on policy type
 */
export const validatePolicyConfig = (policyType: PollPolicyType, policyConfig: PolicyConfigType): ValidationError[] => {
  const errors: ValidationError[] = [];

  switch (policyType) {
    case PollPolicyType.FreeForAll:
      // No additional validation needed for FreeForAll
      break;

    case PollPolicyType.AnonAadhaar:
      if (!policyConfig.verifierAddress?.trim()) {
        errors.push({ field: 'verifierAddress', message: 'Verifier address is required for Anon Aadhaar policy' });
      } else if (!isAddress(policyConfig.verifierAddress)) {
        errors.push({ field: 'verifierAddress', message: 'Please enter a valid Ethereum address for verifier' });
      }

      if (!policyConfig.nullifierSeed?.trim()) {
        errors.push({ field: 'nullifierSeed', message: 'Nullifier seed is required for Anon Aadhaar policy' });
      }
      break;

    case PollPolicyType.ERC20:
      if (!policyConfig.tokenAddress?.trim()) {
        errors.push({ field: 'tokenAddress', message: 'Token address is required for ERC20 policy' });
      } else if (!isAddress(policyConfig.tokenAddress)) {
        errors.push({ field: 'tokenAddress', message: 'Please enter a valid Ethereum address for token' });
      }

      if (!policyConfig.threshold?.trim()) {
        errors.push({ field: 'threshold', message: 'Threshold is required for ERC20 policy' });
      } else if (isNaN(Number(policyConfig.threshold)) || Number(policyConfig.threshold) <= 0) {
        errors.push({ field: 'threshold', message: 'Please enter a valid positive number for threshold' });
      }
      break;

    case PollPolicyType.ERC20Votes:
      if (!policyConfig.tokenAddress?.trim()) {
        errors.push({ field: 'tokenAddress', message: 'Token address is required for ERC20Votes policy' });
      } else if (!isAddress(policyConfig.tokenAddress)) {
        errors.push({ field: 'tokenAddress', message: 'Please enter a valid Ethereum address for token' });
      }

      if (!policyConfig.snapshotBlock?.trim()) {
        errors.push({ field: 'snapshotBlock', message: 'Snapshot block is required for ERC20Votes policy' });
      } else if (isNaN(Number(policyConfig.snapshotBlock)) || Number(policyConfig.snapshotBlock) <= 0) {
        errors.push({ field: 'snapshotBlock', message: 'Please enter a valid block number for snapshot' });
      }

      if (!policyConfig.threshold?.trim()) {
        errors.push({ field: 'threshold', message: 'Threshold is required for ERC20Votes policy' });
      } else if (isNaN(Number(policyConfig.threshold)) || Number(policyConfig.threshold) <= 0) {
        errors.push({ field: 'threshold', message: 'Please enter a valid positive number for threshold' });
      }
      break;

    case PollPolicyType.Token:
      if (!policyConfig.tokenAddress?.trim()) {
        errors.push({ field: 'tokenAddress', message: 'Token address is required for Token policy' });
      } else if (!isAddress(policyConfig.tokenAddress)) {
        errors.push({ field: 'tokenAddress', message: 'Please enter a valid Ethereum address for token' });
      }
      break;

    case PollPolicyType.MerkleProof:
      if (!policyConfig.merkleRoot?.trim()) {
        errors.push({ field: 'merkleRoot', message: 'Merkle root is required for Merkle Proof policy' });
      } else if (!/^0x[a-fA-F0-9]{64}$/.test(policyConfig.merkleRoot)) {
        errors.push({ field: 'merkleRoot', message: 'Please enter a valid Merkle root (0x + 64 hex characters)' });
      }
      break;

    case PollPolicyType.EAS:
      if (!policyConfig.easContract?.trim()) {
        errors.push({ field: 'easContract', message: 'EAS contract address is required for EAS policy' });
      } else if (!isAddress(policyConfig.easContract)) {
        errors.push({ field: 'easContract', message: 'Please enter a valid Ethereum address for EAS contract' });
      }

      if (!policyConfig.attester?.trim()) {
        errors.push({ field: 'attester', message: 'Attester address is required for EAS policy' });
      } else if (!isAddress(policyConfig.attester)) {
        errors.push({ field: 'attester', message: 'Please enter a valid Ethereum address for attester' });
      }

      if (!policyConfig.schema?.trim()) {
        errors.push({ field: 'schema', message: 'Schema is required for EAS policy' });
      } else if (!/^0x[a-fA-F0-9]{64}$/.test(policyConfig.schema)) {
        errors.push({ field: 'schema', message: 'Please enter a valid schema (0x + 64 hex characters)' });
      }
      break;

    case PollPolicyType.GitcoinPassport:
      if (!policyConfig.gitcoinDecoderAddress?.trim()) {
        errors.push({
          field: 'gitcoinDecoderAddress',
          message: 'Gitcoin decoder address is required for Gitcoin Passport policy'
        });
      } else if (!isAddress(policyConfig.gitcoinDecoderAddress)) {
        errors.push({
          field: 'gitcoinDecoderAddress',
          message: 'Please enter a valid Ethereum address for Gitcoin decoder'
        });
      }

      if (!policyConfig.passingScore?.trim()) {
        errors.push({ field: 'passingScore', message: 'Passing score is required for Gitcoin Passport policy' });
      } else if (isNaN(Number(policyConfig.passingScore)) || Number(policyConfig.passingScore) <= 0) {
        errors.push({ field: 'passingScore', message: 'Please enter a valid positive number for passing score' });
      }
      break;

    default:
      // Handle any other policy types that might be added in the future
      console.warn(`Validation not implemented for policy type: ${policyType}`);
      break;
  }

  return errors;
};

/**
 * Main validation function that validates the entire poll form
 */
export const validatePollForm = (pollData: IPollData, pollConfig: number): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate basic fields
  errors.push(...validateBasicFields(pollData));

  // Validate poll options
  errors.push(...validatePollOptions(pollData));

  // Validate poll configuration
  errors.push(...validatePollConfiguration(pollConfig, pollData.publicKey));

  // Validate policy-specific configuration
  errors.push(...validatePolicyConfig(pollData.policyType, pollData.policyConfig));

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Helper function to get the first error message for display
 */
export const getFirstErrorMessage = (errors: ValidationError[]): string => {
  return errors.length > 0 ? errors[0].message : '';
};

/**
 * Helper function to get errors for a specific field
 */
export const getFieldErrors = (errors: ValidationError[], field: string): ValidationError[] => {
  return errors.filter(error => error.field === field);
};
