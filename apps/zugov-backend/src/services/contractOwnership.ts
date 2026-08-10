import { createPublicClient, http, type Address } from "viem";
import { getRpcUrl } from "./chainRpc.js";

const OWNABLE_ABI = [
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
] as const;

export class RpcUnavailableError extends Error {
  constructor(chainId: number) {
    super(`No RPC configured, or the RPC is unreachable, for chain ${chainId}`);
  }
}

export class ContractNotFoundError extends Error {
  constructor(address: string, chainId: number) {
    super(`No contract found at ${address} on chain ${chainId}`);
  }
}

export class NotOwnableError extends Error {
  constructor(address: string) {
    super(`Contract at ${address} does not implement owner() (not an Ownable contract)`);
  }
}

export class OwnershipMismatchError extends Error {
  constructor(
    public readonly sessionAddress: string,
    public readonly actualOwner: string,
  ) {
    super(`Session wallet ${sessionAddress} does not match the contract owner ${actualOwner}`);
  }
}

/**
 * Verifies that `sessionAddress` is the on-chain owner() of `contractAddress`, per specs/002
 * FR-013. Distinguishes, in order: contract doesn't exist on this chain (checked before ever
 * calling owner(), per FR-012's required ordering) → contract isn't Ownable → owner mismatch —
 * so callers can return the exact error the spec requires for each case, and never accept a
 * registration without a successful owner check.
 */
export async function verifyContractOwner(
  chainId: number,
  contractAddress: string,
  sessionAddress: string,
): Promise<void> {
  const rpcUrl = getRpcUrl(chainId);
  if (!rpcUrl) throw new RpcUnavailableError(chainId);

  const client = createPublicClient({ transport: http(rpcUrl) });

  let code: string | undefined;
  try {
    code = await client.getCode({ address: contractAddress as Address });
  } catch {
    throw new RpcUnavailableError(chainId);
  }
  if (!code || code === "0x") throw new ContractNotFoundError(contractAddress, chainId);

  let owner: string;
  try {
    owner = await client.readContract({
      address: contractAddress as Address,
      abi: OWNABLE_ABI,
      functionName: "owner",
    });
  } catch {
    throw new NotOwnableError(contractAddress);
  }

  if (owner.toLowerCase() !== sessionAddress.toLowerCase()) {
    throw new OwnershipMismatchError(sessionAddress, owner);
  }
}
