import { JsonRpcProvider } from "ethers";
import { Poll__factory } from "@maci-protocol/contracts/typechain-types";
import { GovernanceTypes, type GovernanceType } from "../config";

const SCROLL_SEPOLIA_RPC = "https://sepolia-rpc.scroll.io";

/**
 * Reads the number of messages (votes) submitted to a poll contract.
 * @param governanceType - must be GovernanceTypes.MACI
 * @param pollAddress - address of the Poll contract
 */
export async function fetchNumMessages(governanceType: GovernanceType, pollAddress: string): Promise<number> {
  if (governanceType !== GovernanceTypes.MACI) {
    throw new Error(`fetchNumMessages: unsupported governance type "${governanceType}"`);
  }

  const provider = new JsonRpcProvider(SCROLL_SEPOLIA_RPC);
  const poll = Poll__factory.connect(pollAddress, provider);
  const count = await poll.numMessages();
  return Number(count);
}
