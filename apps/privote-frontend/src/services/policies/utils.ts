import { type Address } from 'viem';

// Helper function to create scope from prover address and group ID
export function createScope(proverAddress: Address, groupId: bigint): bigint {
  // Convert address to bigint (160 bits)
  const addressBigInt = BigInt(proverAddress);

  // Shift address left by 96 bits and OR with group ID
  const scope = (addressBigInt << 96n) | (groupId & ((1n << 96n) - 1n));

  return scope;
}
