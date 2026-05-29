import { JsonRpcProvider } from "ethers";
import { Poll__factory, BasePolicy__factory, BaseChecker__factory } from "../poll-factory-shim";
import { GovernanceTypes, PolicyType, type GovernanceType } from "../config";

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

/**
 * Checks whether a wallet address satisfies a poll's signup policy.
 * Resolves the checker via BasePolicy.BASE_CHECKER() then calls check(subject, "0x").
 * ZK-proof-based policies (Zupass, Semaphore, MerkleProof, AnonAadhaar) cannot be
 * verified client-side without a proof, so they fall back to true (let the user try).
 */
export async function fetchIsEligible(
  governanceType: GovernanceType,
  policyAddress: string,
  policyType: string,
  userAddress: string,
): Promise<boolean> {
  if (governanceType !== GovernanceTypes.MACI) {
    throw new Error(`fetchIsEligible: unsupported governance type "${governanceType}"`);
  }

  const proofRequiredPolicies = [
    PolicyType.MerkleProof,
    PolicyType.Zupass,
    PolicyType.Semaphore,
    PolicyType.AnonAadhaar,
  ];
  if (proofRequiredPolicies.includes(policyType as (typeof proofRequiredPolicies)[number])) {
    return false;
  }

  const provider = new JsonRpcProvider(SCROLL_SEPOLIA_RPC);
  const policy = BasePolicy__factory.connect(policyAddress, provider);
  const checkerAddress = await policy.BASE_CHECKER();
  const checker = BaseChecker__factory.connect(checkerAddress, provider);
  return checker.check(userAddress, "0x");
}
