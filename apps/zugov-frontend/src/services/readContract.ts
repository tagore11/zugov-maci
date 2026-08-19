import { JsonRpcProvider } from "ethers";
import { Poll__factory, BasePolicy__factory, BaseChecker__factory } from "../poll-factory-shim";
import { GovernanceTypes, PolicyType, type GovernanceType } from "../config";

/**
 * Reads the number of messages (votes) submitted to a poll contract.
 * @param governanceType - must be GovernanceTypes.MACI
 * @param pollAddress - address of the Poll contract
 * @param rpcUrl - RPC endpoint for the chain the poll is actually deployed on (see
 * appConstants[chainId].rpcUrl) — never hardcode a single chain's endpoint here, communities
 * can be deployed on any supported chain.
 */
export async function fetchNumMessages(
  governanceType: GovernanceType,
  pollAddress: string,
  rpcUrl: string,
): Promise<number> {
  if (governanceType !== GovernanceTypes.MACI) {
    throw new Error(`fetchNumMessages: unsupported governance type "${governanceType}"`);
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const poll = Poll__factory.connect(pollAddress, provider);
  const count = await poll.numMessages();
  return Number(count);
}

/**
 * Checks whether a wallet address satisfies a poll's signup policy.
 * Resolves the checker via BasePolicy.BASE_CHECKER() then calls check(subject, "0x").
 * ZK-proof-based policies (Zupass, Semaphore, MerkleProof, AnonAadhaar) cannot be
 * verified client-side without a proof, so they fall back to true (let the user try).
 * @param rpcUrl - RPC endpoint for the chain the poll is actually deployed on — see
 * fetchNumMessages's note above.
 */
export async function fetchIsEligible(
  governanceType: GovernanceType,
  policyAddress: string,
  policyType: string,
  userAddress: string,
  rpcUrl: string,
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

  const provider = new JsonRpcProvider(rpcUrl);
  const policy = BasePolicy__factory.connect(policyAddress, provider);
  const checkerAddress = await policy.BASE_CHECKER();
  const checker = BaseChecker__factory.connect(checkerAddress, provider);
  return checker.check(userAddress, "0x");
}
