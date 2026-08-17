import { Contract, Interface, type Signer } from "ethers";
import type { Hex } from "viem";
import { appConstants, type SignUpPolicyArgs } from "@/src/config";

/** Shared by every policy instance (sign-up policies and poll eligibility policies alike) —
 * `enforce()` only accepts calls from this single address, and `setTarget` overwrites it. See
 * @excubiae/contracts' Policy.sol: `onlyTarget`/`onlyOwner`. Retargeting an already-live policy
 * (e.g. a community's active sign-up policy, or a still-open poll's policy) revokes its current
 * consumer's access — only safe to do for policies whose prior consumer no longer needs them. */
export const SET_TARGET_ABI = ["function setTarget(address _guarded)"];

const CLONE_DEPLOYED_EVENT_ABI = ["event CloneDeployed(address indexed clone)"];
const POLICY_DEPLOY_ABI = ["function deploy(address checkerAddress) returns (address)"];

const CHECKER_DEPLOY_ABI: Record<string, string[]> = {
  FreeForAll: ["function deploy() returns (address)"],
  EAS: ["function deploy(address eas, address attester, bytes32 schema) returns (address)"],
  Zupass: ["function deploy(uint256 eventId, uint256 signer1, uint256 signer2, address verifier) returns (address)"],
  GitcoinPassport: ["function deploy(address passportDecoder, uint256 thresholdScore) returns (address)"],
  Semaphore: ["function deploy(address semaphore, uint256 groupId) returns (address)"],
  AnonAadhaar: ["function deploy(address anonAadhaarVerifier, uint256 nullifierSeed) returns (address)"],
  ERC20Token: ["function deploy(address _token, uint256 _threshold) returns (address)"],
  ERC20Votes: ["function deploy(address _token, uint256 _snapshotBlock, uint256 _threshold) returns (address)"],
  Token: ["function deploy(address token) returns (address)"],
  MerkleProof: ["function deploy(bytes32 root) returns (address)"],
  HatsProtocol: ["function deploy(address hats, uint256[] criterionHats) returns (address)"],
};

async function deployClone(factoryAddr: Hex, abi: string[], args: unknown[], signer: Signer): Promise<Hex> {
  const factory = new Contract(factoryAddr, abi, signer);
  const tx = await (factory.deploy as (...a: unknown[]) => Promise<{ wait: () => Promise<unknown> }>)(...args);
  const receipt = (await tx.wait()) as {
    status: number;
    logs: Array<{ topics: string[]; data: string }>;
  };
  if (!receipt || receipt.status !== 1) throw new Error("Clone deployment failed");

  const iface = new Interface(CLONE_DEPLOYED_EVENT_ABI);
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog({ topics: log.topics, data: log.data });
      if (parsed?.name === "CloneDeployed") return parsed.args[0] as Hex;
    } catch {
      // not our event
    }
  }
  throw new Error("CloneDeployed event not found");
}

/** Deploys a fresh checker+policy contract pair for the given policy type and args, returning
 * the policy contract's address. Shared between a community's sign-up policy (useCreateCommunity)
 * and a poll's eligibility policy (useDeployPoll) — both are the same on-chain shape, just used
 * against a different `target` (MACI vs. a specific Poll). */
export async function deployPolicyContract(
  policyArgs: SignUpPolicyArgs,
  signer: Signer,
  chainId: number,
): Promise<Hex> {
  const chainConstants = appConstants[chainId as keyof typeof appConstants];
  if (!chainConstants) throw new Error(`Unsupported chain: ${chainId}`);

  const { policyFactories, policyInfrastructure } = chainConstants;
  const ZERO = "0x0000000000000000000000000000000000000000";

  // FreeForAllChecker is stateless (its check() always passes, unconditionally) — there is
  // exactly one already deployed per chain (chainConstants.freeForAllChecker), so every
  // FreeForAll policy reuses it rather than cloning a fresh, functionally-identical checker
  // per poll/community.
  if (policyArgs.type === "FreeForAll") {
    if (chainConstants.freeForAllChecker === ZERO) {
      throw new Error("FreeForAllChecker is not deployed on this network.");
    }
    if (policyFactories.freeForAll.policy === ZERO) {
      throw new Error("Policy factories for FreeForAll are not deployed on this network.");
    }
    return deployClone(
      policyFactories.freeForAll.policy,
      POLICY_DEPLOY_ABI,
      [chainConstants.freeForAllChecker],
      signer,
    );
  }

  const { type } = policyArgs;
  const { checker: checkerFactoryAddr, policy: policyFactoryAddr } =
    policyFactories[
      type === "EAS"
        ? "eas"
        : type === "Zupass"
          ? "zupass"
          : type === "GitcoinPassport"
            ? "gitcoinPassport"
            : type === "Semaphore"
              ? "semaphore"
              : type === "AnonAadhaar"
                ? "anonAadhaar"
                : type === "ERC20Token"
                  ? "erc20Token"
                  : type === "ERC20Votes"
                    ? "erc20Votes"
                    : type === "Token"
                      ? "token"
                      : type === "MerkleProof"
                        ? "merkleProof"
                        : "hatsProtocol"
    ];

  if (checkerFactoryAddr === ZERO || policyFactoryAddr === ZERO) {
    throw new Error(`Policy factories for ${type} are not deployed on this network.`);
  }

  let checkerArgs: unknown[];
  switch (policyArgs.type) {
    case "EAS":
      if (policyInfrastructure.easAddress === ZERO) throw new Error("EAS contract not configured for this network");
      checkerArgs = [policyInfrastructure.easAddress, policyArgs.attesterAddress, policyArgs.schemaUid];
      break;
    case "Zupass":
      if (policyInfrastructure.zupassVerifier === ZERO)
        throw new Error("Zupass verifier not configured for this network");
      checkerArgs = [
        BigInt(policyArgs.eventId),
        BigInt(policyArgs.signer1),
        BigInt(policyArgs.signer2),
        policyInfrastructure.zupassVerifier,
      ];
      break;
    case "GitcoinPassport":
      if (policyInfrastructure.gitcoinDecoder === ZERO)
        throw new Error("Gitcoin Passport decoder not configured for this network");
      checkerArgs = [policyInfrastructure.gitcoinDecoder, BigInt(policyArgs.thresholdScore)];
      break;
    case "Semaphore":
      if (policyInfrastructure.semaphoreAddress === ZERO)
        throw new Error("Semaphore contract not configured for this network");
      checkerArgs = [policyInfrastructure.semaphoreAddress, BigInt(policyArgs.groupId)];
      break;
    case "AnonAadhaar":
      if (policyInfrastructure.anonAadhaarVerifier === ZERO)
        throw new Error("AnonAadhaar verifier not configured for this network");
      checkerArgs = [policyInfrastructure.anonAadhaarVerifier, policyArgs.nullifierSeed];
      break;
    case "ERC20Token":
      checkerArgs = [policyArgs.tokenAddress, policyArgs.threshold];
      break;
    case "ERC20Votes":
      checkerArgs = [policyArgs.tokenAddress, policyArgs.snapshotBlock, policyArgs.threshold];
      break;
    case "Token":
      checkerArgs = [policyArgs.tokenAddress];
      break;
    case "MerkleProof":
      checkerArgs = [policyArgs.merkleRoot];
      break;
    case "HatsProtocol":
      if (policyInfrastructure.hatsAddress === ZERO)
        throw new Error("Hats Protocol contract not configured for this network");
      checkerArgs = [policyInfrastructure.hatsAddress, policyArgs.criterionHats.map((h) => BigInt(h))];
      break;
  }

  const checkerAddr = await deployClone(checkerFactoryAddr, CHECKER_DEPLOY_ABI[type], checkerArgs, signer);
  return deployClone(policyFactoryAddr, POLICY_DEPLOY_ABI, [checkerAddr], signer);
}
