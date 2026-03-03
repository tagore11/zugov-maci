import { request } from 'graphql-request';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const fetcher = <T>([url, query, variables]: [string, string, Record<string, any> | undefined]): Promise<T> => {
  console.log('fetcher - making request to:', url);
  console.log('fetcher - query:', query.substring(0, 100) + '...');
  console.log('fetcher - variables:', variables);

  return request(url, query, variables).catch(error => {
    console.error('fetcher - GraphQL request failed:', error);
    console.error('fetcher - URL that failed:', url);
    console.error('fetcher - Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.response?.url
    });

    // Provide more helpful error messages for common issues
    if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
      throw new Error(
        `Network error: Unable to connect to subgraph at ${url}. Please check your internet connection and verify the subgraph URL is correct.`
      );
    }

    if (error.response?.status === 404) {
      throw new Error(
        `Subgraph not found: The subgraph at ${url} does not exist or is not available. Please check the deployment ID and project name.`
      );
    }

    if (error.response?.status >= 500) {
      throw new Error(`Subgraph server error: The subgraph at ${url} is experiencing issues. Please try again later.`);
    }

    throw error;
  });
};
