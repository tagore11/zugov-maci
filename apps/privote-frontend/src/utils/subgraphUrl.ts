/**
 * Get subgraph URL for a specific DAO
 * @param daoId - Config key of the DAO (e.g. "default", "zukas")
 * @param daos - DAOs object from app constants
 * @param slugs - Slugs object from app constants (kept for signature compatibility)
 * @returns Subgraph URL or undefined if DAO not found
 */
export const getSubgraphUrl = (daoId: string | undefined, daos: any, slugs: any): string | undefined => {
  if (!daoId) return undefined;

  const daoKey = Object.keys(daos).find(key => key.toLowerCase() === daoId.toLowerCase());

  if (daoKey && daos[daoKey]?.subgraphUrl) {
    return daos[daoKey].subgraphUrl as string;
  }

  return undefined;
};
