import { Hex } from 'viem';

export interface Token {
  address: Hex;
  decimals: number;
  symbol: string;
  name: string;
}

export type AnonAadhaarPolicyData = {
  verifier: Hex;
  nullifierSeed: bigint;
};

export type EASPolicyData = {
  easAddress: Hex;
  attesterAddress: Hex;
  schema: Hex;
};

export type ERC20PolicyData = {
  token: Token;
  threshold: bigint;
};

export type ERC20VotesPolicyData = {
  token: Token;
  snapshotBlock: bigint;
  threshold: bigint;
};

export type GitcoinPassportPolicyData = {
  passportDecoder: Hex;
  thresholdScore: bigint;
};

export type HatsPolicyData = {
  hats: Hex;
  criterionHats: bigint[];
};

export type MerklePolicyData = {
  merkleRoot: Hex;
  merkleTreeVersion: string;
  merkleTreeUrl: string;
};

export type SemaphorePolicyData = {
  semaphore: Hex;
  groupId: bigint;
};

export type TokenPolicyData = {
  token: Token;
};

export type ZupassPolicyData = {
  eventId: bigint;
  signer1: bigint;
  signer2: bigint;
  zupassVerifier: Hex;
};

export type PolicyData =
  | AnonAadhaarPolicyData
  | EASPolicyData
  | ERC20PolicyData
  | ERC20VotesPolicyData
  | GitcoinPassportPolicyData
  | HatsPolicyData
  | MerklePolicyData
  | SemaphorePolicyData
  | TokenPolicyData
  | ZupassPolicyData
  | Record<string, never>;
