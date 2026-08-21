export const EXECUTABLE_PRIVACY = "privacy_preserving" as const;
export const EXECUTABLE_EXECUTION_LOCATION = "onchain" as const;
export const EXECUTABLE_TALLY_MECHANISMS = ["simple", "quadratic", "ranked", "full"] as const;

// specs/013-zupoll-decision-adapter, research.md #4 — before this adapter, isExecutableCombination
// hard-blocked every executionLocation: "offchain" proposal with zero exceptions; off-chain
// execution didn't exist as a real, buildable path until Zupoll needed it. Kept as an explicit
// whitelist of tuples (not a second single-execution-location constant mirroring the onchain
// case above) since a future off-chain adapter may need a different votingProtocolType than
// "simple" without silently becoming executable for every offchain/simple combination regardless
// of adapter.
export const EXECUTABLE_OFFCHAIN_COMBINATIONS: ReadonlyArray<{
  privacy: string;
  executionLocation: string;
  votingProtocolType: string;
}> = [{ privacy: "privacy_preserving", executionLocation: "offchain", votingProtocolType: "simple" }];

export function isExecutableCombination(
  privacy: string,
  executionLocation: string,
  votingProtocolType: string,
): boolean {
  const onchainExecutable =
    privacy === EXECUTABLE_PRIVACY &&
    executionLocation === EXECUTABLE_EXECUTION_LOCATION &&
    (EXECUTABLE_TALLY_MECHANISMS as readonly string[]).includes(votingProtocolType);

  const offchainExecutable = EXECUTABLE_OFFCHAIN_COMBINATIONS.some(
    (combination) =>
      combination.privacy === privacy &&
      combination.executionLocation === executionLocation &&
      combination.votingProtocolType === votingProtocolType,
  );

  return onchainExecutable || offchainExecutable;
}
