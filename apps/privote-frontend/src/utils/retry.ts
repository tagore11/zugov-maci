/**
 * Retry wrapper for async operations with linear backoff
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds (default: 2000)
 * @param enableLogging - Enable console logging for debugging (default: false)
 * @returns Promise with the result or null if all retries fail
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000,
  enableLogging: boolean = false
): Promise<T | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (enableLogging) {
        console.log(`Attempt ${attempt}/${maxRetries}...`);
      }
      const result = await fn();
      return result;
    } catch (error) {
      if (enableLogging) {
        console.error(`Attempt ${attempt} failed:`, error);
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * attempt;
        if (enableLogging) {
          console.log(`Retrying in ${delay}ms...`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  if (enableLogging) {
    console.error('All retry attempts failed');
  }
  return null;
};
