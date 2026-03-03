import { PollStatus, TransformedPoll } from '@/types';
import { type Keypair } from '@maci-protocol/domainobjs';
import { type IProof, type ITallyData } from '@maci-protocol/sdk/browser';
import { type QueryObserverResult, type RefetchOptions } from '@tanstack/react-query';

export interface IVoteArgs {
  voteOptionIndex: bigint;
  newVoteWeight: bigint;
}

export interface IGenerateData {
  processProofs: IProof[];
  tallyData: ITallyData;
}

export interface IProofGenerationProgress {
  batchIndex: number;
  totalBatches: number;
  processedCount: number;
  totalCount: number;
  proofs: IProof[];
}
export type TCoordinatorServiceResult<T, E = Error> = { success: true; data: T } | { success: false; error: E };

export type FinalizeStatus =
  | 'notStarted'
  | 'signing'
  | 'merging'
  | 'proving'
  | 'submitting'
  | 'submitted'
  | 'redirecting';

export interface IFinalizePollArgs {
  setFinalizeStatus: (status: FinalizeStatus) => void;
}

export interface ICoordinatorContextType {
  finalizePoll: (args: IFinalizePollArgs) => Promise<void>;
}

export interface IPollContextType {
  error?: string | null;
  poll?: TransformedPoll | null;
  pollLoading: boolean;
  isPollError: boolean;
  pollError: Error | null;
  hasJoinedPoll: boolean;
  initialVoiceCredits: number;
  pollStateIndex?: string;
  isRegistered?: boolean;
  maciKeypair?: Keypair | null;
  stateIndex?: string;
  subgraphUrl?: string;
  onJoinPoll: (signupData?: string) => Promise<boolean>;
  onSignup: () => Promise<void>;
  checkIsTallied: () => Promise<boolean>;
  checkMergeStatus: () => Promise<boolean>;
  refetchPoll: (options?: RefetchOptions) => Promise<QueryObserverResult<TransformedPoll | null, Error>>;
  dynamicPollStatus: PollStatus | null;
  isJoiningPoll: boolean;
  isSignupLoading: boolean;
  isPorto: boolean;
  isCheckingTallied: boolean;
  isCheckingUserJoinedPoll: boolean;
}

export interface IFaucetContext {
  checkBalance: () => boolean;
}

export const VoteOption = {
  Yes: 0,
  No: 1,
  Abstain: 2
};

export type VoteOptionType = keyof typeof VoteOption;
