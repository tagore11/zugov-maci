import { createPublicClient, http, type Address } from "viem";
import { scrollSepolia } from "viem/chains";

export class UnsupportedChainError extends Error {
  constructor(chainId: number) {
    super(`Chain ${chainId} is not supported for ownership verification`);
  }
}

export class RpcFailureError extends Error {
  constructor(cause?: unknown) {
    super(`RPC call failed: ${String(cause)}`);
  }
}

export class InvalidContractError extends Error {
  constructor(address: string) {
    super(`Contract at ${address} does not implement owner()`);
  }
}

export class NotOwnerError extends Error {
  public readonly sessionWallet: string;
  public readonly actualOwner: string;

  constructor(sessionWallet: string, actualOwner: string) {
    super(`Wallet ${sessionWallet} is not the owner of the contract (owner: ${actualOwner})`);
    this.sessionWallet = sessionWallet;
    this.actualOwner = actualOwner;
  }
}

const CHAIN_RPC_MAP: Record<number, string> = {
  [scrollSepolia.id]: process.env.SCROLL_SEPOLIA_RPC_URL ?? scrollSepolia.rpcUrls.default.http[0] ?? "",
};

const OWNER_ABI = [
  {
    name: "owner",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
    inputs: [],
  },
] as const;

export async function verifyOwner(contractAddress: string, chainId: number, sessionWallet: string): Promise<void> {
  const rpcUrl = CHAIN_RPC_MAP[chainId];
  if (!rpcUrl) {
    throw new UnsupportedChainError(chainId);
  }

  const chain = chainId === scrollSepolia.id ? scrollSepolia : scrollSepolia;
  const client = createPublicClient({ chain, transport: http(rpcUrl) });

  let owner: string;
  try {
    owner = (await client.readContract({
      address: contractAddress as Address,
      abi: OWNER_ABI,
      functionName: "owner",
    })) as string;
  } catch (err) {
    const msg = String(err);
    if (msg.includes("revert") || msg.includes("execution reverted")) {
      throw new InvalidContractError(contractAddress);
    }
    throw new RpcFailureError(err);
  }

  if (owner.toLowerCase() !== sessionWallet.toLowerCase()) {
    throw new NotOwnerError(sessionWallet, owner);
  }
}
