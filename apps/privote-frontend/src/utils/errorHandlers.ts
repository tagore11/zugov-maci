import { ETH_GET_LOGS_ERROR_PATTERNS } from './constants';

/**
 * Check if an error is related to eth_getLogs failures
 * These errors typically occur when the RPC provider fails to retrieve logs
 * from the blockchain, often due to rate limiting or node issues.
 *
 * @param error - The error to check
 * @returns true if the error is related to eth_getLogs
 */
export const isEthGetLogsError = (error: unknown): boolean => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return ETH_GET_LOGS_ERROR_PATTERNS.some(pattern => errorMessage.includes(pattern));
};

/**
 * Check if an error is a balance too low error
 * @param error - The error to check
 * @returns true if the error indicates insufficient balance
 */
export const isBalanceTooLowError = (error: unknown): boolean => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  // 0xa3281672 -> signature of BalanceTooLow()
  return errorMessage.includes('0xa3281672');
};
