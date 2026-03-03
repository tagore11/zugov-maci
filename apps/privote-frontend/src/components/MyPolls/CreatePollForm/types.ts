import type { EMode, PollPolicyType, PollType } from '@/types';
import { type Keypair } from '@maci-protocol/domainobjs';

export interface CreatePollFormProps {
  onClose: () => void;
}

export interface IPollData {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  maxVotePerPerson: bigint;
  pollType: PollType;
  mode: EMode | null;
  options: PollOption[];
  keyPair: Keypair;
  publicKey: string;
  policyType: PollPolicyType;
  policyConfig: PolicyConfigType;
}

export interface PollOption {
  title?: string;
  description?: string;
  link?: string;
  cid: `0x${string}`;
  isUploadedToIPFS: boolean;
}

export interface PolicyConfigType {
  // Anon Aadhaar policy
  verifierAddress?: string;
  nullifierSeed?: string;

  // ERC20, ERC20Votes and Token policy
  tokenAddress?: string;
  threshold?: string;
  snapshotBlock?: string; // only for ERC20Votes

  // Merkle proof policy
  merkleRoot?: string;
  merkleTreeData?: string;

  // EAS policy
  easContract?: string;
  attester?: string;
  schema?: string;

  // Gitcoin policy
  gitcoinDecoderAddress?: string;
  passingScore?: string;

  // Semaphore policy
  semaphoreContract?: string;
  groupId?: string;

  // Zupass policy
  eventId?: string;
  signer1?: string;
  signer2?: string;
  zupassVerifier?: string;

  // Hats policy
  hatsContract?: string;
  hatsCriterions?: string[];

  // Additional policy configurations can be added here as needed
  [key: string]: string | string[] | undefined;
}

export interface VerificationProps {
  handlePolicyTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  policyType: PollPolicyType;
  policyConfig?: PolicyConfigType;
  onPolicyConfigChange?: (config: PolicyConfigType) => void;
}

export interface CandidateSelectionProps {
  candidateSelection: 'none' | 'withImage' | 'withoutImage';
  setCandidateSelection: (value: 'none' | 'withImage' | 'withoutImage') => void;
  handleAddOption: () => void;
  handleOptionChange: (index: number, value: string, field: 'value' | 'title' | 'description' | 'link') => void;
  options: PollOption[];
  files: (File | null)[] | null;
  onFileChange: (index: number, file: File) => void;
  onFileRemove: (index: number) => void;
  onRemoveOption: (index: number) => void;
}

export interface PollConfigurationProps {
  pollConfig: number;
  setPollConfig: React.Dispatch<React.SetStateAction<number>>;
  publicKey: string;
  handlePubKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface PollOptionProps {
  option: PollOption;
  index: number;
  file?: File | null;
  onOptionChange: (index: number, value: string, field: 'value' | 'title' | 'description' | 'link') => void;
  onFileChange: (index: number, file: File) => void;
  onFileRemove: (index: number) => void;
  onRemoveOption: (index: number) => void;
  candidateSelection: 'none' | 'withImage' | 'withoutImage';
}

export interface PollSettingsProps {
  pollData: IPollData;
  onPollTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onModeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onMaxVoteChange: (e: React.ChangeEvent<HTMLInputElement> | number, action?: 'add' | 'remove') => void;
}
