export const EXECUTABLE_PRIVACY = "privacy_preserving" as const;
export const EXECUTABLE_EXECUTION_LOCATION = "onchain" as const;
export const EXECUTABLE_TALLY_MECHANISMS = ["simple", "quadratic", "ranked", "full"] as const;

export function isExecutableCombination(
  privacy: string,
  executionLocation: string,
  votingProtocolType: string,
): boolean {
  return (
    privacy === EXECUTABLE_PRIVACY &&
    executionLocation === EXECUTABLE_EXECUTION_LOCATION &&
    (EXECUTABLE_TALLY_MECHANISMS as readonly string[]).includes(votingProtocolType)
  );
}
