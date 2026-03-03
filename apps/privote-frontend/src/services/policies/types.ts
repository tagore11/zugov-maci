import { ISignupState } from '@/components/Poll/JoinPollModal/JoinPollModal';
import { Hex } from 'viem';

/**
 * Common interface for policy hook results
 */
export interface PolicyHookResult {
  /**
   * Whether the user can join the poll based on the policy requirements
   */
  canJoin: boolean;

  /**
   * Function to get the signup data required by the policy
   */
  getSignupData: () => Promise<string>;

  /**
   * UI component to render for the policy (login buttons, etc.)
   */
  PolicyComponent: React.FC;

  /**
   * Message explaining the requirements to join
   */
  requirementsDescription: string;

  /**
   * Loading state for async policy checks
   */
  isLoading: boolean;
}

/**
 * Common props for all policy hooks
 */
export interface PolicyProps {
  policyData?: Hex;
  signupState: ISignupState;
  setSignupState: React.Dispatch<React.SetStateAction<ISignupState>>;
  onNext: () => void;
  onBack: () => void;
}

export interface ICommonProps {
  canJoin: boolean;
  isLoading: boolean;
  requirementsDescription: string | React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  children: React.ReactNode;
}
