/**
 * Unpacks vote options from a packed bigint value
 * @param packed The packed bigint value containing the votes
 * @param numVotes The number of votes to unpack (default: 12, max: 12)
 * @returns Array of numbers, each between 0-12
 */
export const unpackVoteOptions = (packed: bigint, numVotes = 12): bigint[] => {
  if (numVotes > 12 || numVotes < 1) {
    throw new Error("Number of votes must be between 1 and 12");
  }
  const votes: bigint[] = [];

  for (let i = 0; i < numVotes; i += 1) {
    // eslint-disable-next-line no-bitwise
    votes.push((packed >> BigInt(i * 4)) & 15n);
  }
  return votes;
};
