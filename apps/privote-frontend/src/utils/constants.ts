import { PollPolicyType } from '@/types';

// Zero address constant (0x0 address) for Ethereum
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Zero bytes32 value
export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

// MACI Subgraph enpoint
export const SUBGRAPH_PROJECT_ID = process.env.NEXT_PUBLIC_SUBGRAPH_PROJECT_ID;
export const SUBGRAPH_VERSION = process.env.NEXT_PUBLIC_SUBGRAPH_VERSION;
export const PUBLIC_COORDINATOR_SERVICE_URL = process.env.NEXT_PUBLIC_COORDINATOR_SERVICE_URL;
export const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY;

const appName = 'PRIVOTE';
const purpose = 'This signature will be used to generate your secure MACI private key.';
export const SIGNATURE_MESSAGE = `Welcome to ${appName}! ${purpose}`;

export const DEFAULT_VOICE_CREDITS = 1n;
export const MAX_VOICE_CREDITS = 100n;
export const DEFAULT_SG_DATA = '0x';
export const DEFAULT_IVCP_DATA = '0x';

export const ONE_MINUTE_MS = 60 * 1000;
export const ONE_HOUR_MS = 60 * 60 * 1000;

// Retry and fallback timing constants
export const RETRY_ATTEMPTS = 3;
export const SUBGRAPH_INDEXING_BLOCKS = 3; // Wait for 3 blocks for subgraph to index transaction
export const SIGNUP_SUBGRAPH_WAIT_BLOCKS = 2; // Wait for 2 blocks for signup subgraph indexing

// Error patterns to detect eth_getLogs failures
export const ETH_GET_LOGS_ERROR_PATTERNS = ['eth_getLogs', 'could not coalesce error'] as const;

// Wallet connector names and IDs
export const PORTO_CONNECTOR_NAME = 'Email or Passkey';
export const PORTO_CONNECTOR_ID = 'xyz.ithaca.porto';

export const ZUPASS_DEVCON_DEFAULTS = {
  eventId: '1f36ddce-e538-4c7a-9f31-6a4b2221ecac',
  signer1: '0x044e711fd3a1792a825aa896104da5276bbe710fd9b59dddea1aaf8d84535aaf',
  signer2: '0x2b259329f0adf98c9b6cf2a11db7225fdcaa4f8796c61864e86154477da10663'
} as const;

export const POLICY_ICONS = {
  [PollPolicyType.AnonAadhaar]: '/icons/aadhaar-icon.svg',
  [PollPolicyType.EAS]: '/icons/eas-icon.png',
  [PollPolicyType.ERC20]: '/icons/token-icon.svg',
  [PollPolicyType.ERC20Votes]: '/icons/erc20Votes-icon.svg',
  [PollPolicyType.FreeForAll]: '/icons/free-icon.svg',
  [PollPolicyType.GitcoinPassport]: '/icons/passport-icon.svg',
  // [PollPolicyType.Hats]: null,
  [PollPolicyType.MerkleProof]: '/icons/merkle-icon.svg',
  [PollPolicyType.Semaphore]: '/semaphore-icon.svg',
  [PollPolicyType.Token]: '/icons/nft-icon.svg',
  [PollPolicyType.Zupass]: '/icons/zupass-icon.png'
};
