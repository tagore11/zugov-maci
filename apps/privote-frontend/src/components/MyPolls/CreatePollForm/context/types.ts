import { type Hex } from 'viem';

export interface IDeployPollArgs {
  sessionKeyAddress?: Hex;
  approval?: string;
  chain: string;
  privoteAddress: Hex;
  config: IDeployPollConfig;
}

export interface IConstantInitialVoiceCreditProxyArgs {
  amount: number;
}

export interface IEASPolicyArgs {
  easAddress: string;
  schema: string;
  attester: string;
}

export interface IZupassPolicyArgs {
  signer1: string;
  signer2: string;
  eventId: string;
  zupassVerifier: string;
}

export interface IHatsPolicyArgs {
  hatsProtocolAddress: string;
  critrionHats: string[];
}

export interface ISemaphorePolicyArgs {
  semaphoreContract: string;
  groupId: string;
}

export interface IMerkleProofPolicyArgs {
  root: string;
}

export interface ITokenPolicyArgs {
  token: string;
}

export interface IAnonAadhaarPolicyArgs {
  verifier: string;
  nullifierSeed: string;
}

export interface IGitcoinPassportPolicyArgs {
  decoderAddress: string;
  passingScore: string;
}

export interface IERC20VotesPolicyArgs {
  token: string;
  threshold: bigint | string;
  snapshotBlock: bigint | string;
}

export interface IERC20PolicyArgs {
  token: string;
  threshold: string;
}

export interface IVerifyingKeysRegistryArgs {
  stateTreeDepth: bigint | string;
  pollStateTreeDepth: bigint | string;
  tallyProcessingStateTreeDepth: bigint | string;
  voteOptionTreeDepth: bigint | string;
  messageBatchSize: number;
}

export type IPolicyArgs =
  | IEASPolicyArgs
  | IZupassPolicyArgs
  | IHatsPolicyArgs
  | ISemaphorePolicyArgs
  | IMerkleProofPolicyArgs
  | ITokenPolicyArgs
  | IAnonAadhaarPolicyArgs
  | IGitcoinPassportPolicyArgs
  | IERC20VotesPolicyArgs
  | IERC20PolicyArgs;

export enum EMode {
  QV,
  NON_QV,
  FULL,
  RANKED
}

export enum EPolicies {
  FreeForAll = '@excubiae/contracts/contracts/extensions/freeForAll/FreeForAllPolicy.sol:FreeForAllPolicy',
  Token = '@excubiae/contracts/contracts/extensions/token/TokenPolicy.sol:TokenPolicy',
  EAS = '@excubiae/contracts/contracts/extensions/eas/EASPolicy.sol:EASPolicy',
  GitcoinPassport = '@excubiae/contracts/contracts/extensions/gitcoin/GitcoinPassportPolicy.sol:GitcoinPassportPolicy',
  Hats = '@excubiae/contracts/contracts/extensions/hats/HatsPolicy.sol:HatsPolicy',
  Zupass = '@excubiae/contracts/contracts/extensions/zupass/ZupassPolicy.sol:ZupassPolicy',
  Semaphore = '@excubiae/contracts/contracts/extensions/semaphore/SemaphorePolicy.sol:SemaphorePolicy',
  MerkleProof = '@excubiae/contracts/contracts/extensions/merkle/MerkleProofPolicy.sol:MerkleProofPolicy',
  AnonAadhaar = '@excubiae/contracts/contracts/extensions/anonAadhaar/AnonAadhaarPolicy.sol:AnonAadhaarPolicy',
  ERC20Votes = '@excubiae/contracts/contracts/extensions/erc20votes/ERC20VotesPolicy.sol:ERC20VotesPolicy',
  ERC20 = '@excubiae/contracts/contracts/extensions/erc20/ERC20Policy.sol:ERC20Policy'
}

export enum EInitialVoiceCreditProxiesFactories {
  Constant = 'ConstantInitialVoiceCreditProxyFactory',
  ERC20Votes = 'ERC20VotesInitialVoiceCreditProxyFactory'
}

export enum EInitialVoiceCreditProxies {
  Constant = 'ConstantInitialVoiceCreditProxy',
  ERC20Votes = 'ERC20VotesInitialVoiceCreditProxy'
}

export interface IDeployPolicyConfig {
  type: EPolicies;
  args?: IPolicyArgs;
}

export type IInitialVoiceCreditProxyArgs = IConstantInitialVoiceCreditProxyArgs;

export interface IDeployPollConfig {
  name: string;
  options: string[];
  optionsInfo: Hex[];
  metadata: string;
  startDate: number;
  endDate: number;
  mode: EMode;
  policy: IDeployPolicyConfig;
  initialVoiceCreditsProxy: {
    factoryType: EInitialVoiceCreditProxiesFactories;
    type: EInitialVoiceCreditProxies;
    args: IInitialVoiceCreditProxyArgs;
    address?: Hex;
  };
  relayers?: string[];
}
