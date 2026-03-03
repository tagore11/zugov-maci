import { Hex } from 'viem';

export const PollStatus = {
  NOT_STARTED: 'Not Started',
  OPEN: 'Open',
  CLOSED: 'Closed',
  RESULT_COMPUTED: 'Result Computed'
} as const;

export type PollStatus = (typeof PollStatus)[keyof typeof PollStatus];

export type PollOption = {
  id: string;
  name: string;
  description: string;
  link: string;
  cid: string;
};

export interface IMACI {
  id: string;
}

export interface RawPoll {
  id: string;
  pollId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  voteOptions: string;
  owner: string;
  policyTrait: PollPolicyType;
  coordinatorPublicKey?: bigint[];
  policyData?: Hex;
  options?: PollOption[];
  pollType?: string;
  mode?: string;
  totalSignups?: string;
  numMessages?: string;
  pollUsers?: PollUser[];
  maci: IMACI;
}

export interface Poll extends RawPoll {
  status: PollStatus;
}

export interface BaseUser {
  id: string;
  createdAt: string;
}

export interface User extends BaseUser {
  accounts: Account[];
}

export interface PollUser extends BaseUser {
  accounts: PollAccount[];
}

export interface Account {
  id: string;
  voiceCreditBalance: string;
  createdAt: string;
}

export interface PollAccount extends Account {
  nullifier: string;
}

export const PollType = {
  NOT_SELECTED: 'NOT_SELECTED',
  SINGLE_VOTE: 'SINGLE_VOTE',
  MULTIPLE_VOTE: 'MULTIPLE_VOTE',
  RANKED_VOTE: 'RANKED_VOTE'
} as const;

export const PollPolicyType = {
  FreeForAll: 'FreeForAll',
  AnonAadhaar: 'AnonAadhaar',
  EAS: 'EAS',
  ERC20: 'ERC20',
  ERC20Votes: 'ERC20Votes',
  GitcoinPassport: 'GitcoinPassport',
  // Hats: 'Hats',
  MerkleProof: 'MerkleProof',
  Semaphore: 'Semaphore',
  Token: 'Token',
  Zupass: 'Zupass'
} as const;

export const EMode = {
  QV: 'QV',
  NON_QV: 'NON_QV',
  FULL: 'FULL',
  RANKED: 'RANKED'
} as const;

export type PollType = (typeof PollType)[keyof typeof PollType];
export type PollPolicyType = (typeof PollPolicyType)[keyof typeof PollPolicyType];
export type EMode = (typeof EMode)[keyof typeof EMode];

// Type for the transformed poll object that will be returned by the hook
export type TransformedPoll = RawPoll & {
  status: PollStatus;
  pollType: PollType;
  mode: EMode;
  privoteContractAddress: Hex;
};
