import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount, useChainId } from "wagmi";
import { BrowserProvider, Contract, ContractFactory, Interface, type Signer } from "ethers";
import type { Hex } from "viem";
import { MACI__factory } from "@maci-protocol/contracts/typechain-types";
import { generateEmptyBallotRoots } from "@maci-protocol/sdk";
import { PublicKey } from "@maci-protocol/domainobjs";
import { FIXED_POLL_DEPLOY_CONSTANTS, appConstants, type SignUpPolicyArgs, type PollDeployConfig } from "@/src/config";
import { STATE_TREE_DEPTH } from "@/src/constants";
import { DEFAULT_MEMBERSHIP_TIERS } from "@/app/lib/placeholder-data";
import {
  savePendingCheckpoint,
  getPendingCheckpoint,
  clearPendingCheckpoint,
  type DeployPhase,
  type MACIDeploymentConfig,
  type PendingDeploymentCheckpoint,
} from "@/src/services/checkpointStore";

export type { DeployPhase };
import * as communityApi from "@/src/services/communityApi";
import { useSiwe } from "@/src/hooks/useSiwe";
import { useZuGovRegistry, type RegistryStatus, type RegistryData } from "./useZuGovRegistry";

export type WizardStep =
  | "mechanism"
  | "community_info"
  | "maci_config"
  | "network_check"
  | "review"
  | "deploying"
  | "success"
  | "error";

export interface DeploymentSummary {
  displayName: string;
  description: string;
  signUpPolicyType: string;
  allowedPolicies: number[];
  supportedModes: number[];
  stateTreeDepth: 10;
  deployerAddress: Hex;
  chainName: string;
}

export interface WizardState {
  step: WizardStep;
  config: Partial<MACIDeploymentConfig>;
  registryStatus: RegistryStatus | undefined;
  summary: DeploymentSummary | undefined;
  currentPhase: DeployPhase | undefined;
  completedPhases: DeployPhase[];
  currentTxHash: Hex | undefined;
  errorMessage: string | undefined;
  retryFromPhase: DeployPhase | undefined;
  deployedCommunityId: string | undefined;
}

export interface UseCreateCommunityResult {
  state: WizardState;
  goToStep: (step: WizardStep) => void;
  goBack: () => void;
  setMechanism: (mechanism: "maci") => void;
  setCommunityInfo: (name: string, description: string) => void;
  setMaciConfig: (config: Pick<MACIDeploymentConfig, "signUpPolicy" | "allowedPolicies" | "supportedModes">) => void;
  startNetworkCheck: () => Promise<void>;
  startDeployment: () => Promise<void>;
  retryDeployment: () => Promise<void>;
  saveCommunity: () => Promise<void>;
  reset: () => void;
}

// ─── ABIs ──────────────────────────────────────────────────────────────────

const CLONE_DEPLOYED_EVENT_ABI = ["event CloneDeployed(address indexed clone)"];
const SET_TARGET_ABI = ["function setTarget(address _guarded)"];
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

// ─── Constants ─────────────────────────────────────────────────────────────

const STEP_ORDER: WizardStep[] = [
  "mechanism",
  "community_info",
  "maci_config",
  "network_check",
  "review",
  "deploying",
  "success",
];

const ALL_PHASES: DeployPhase[] = ["deploy_sign_up_policy", "deploy_maci", "set_target", "save_community"];

const INITIAL_STATE: WizardState = {
  step: "mechanism",
  config: {},
  registryStatus: undefined,
  summary: undefined,
  currentPhase: undefined,
  completedPhases: [],
  currentTxHash: undefined,
  errorMessage: undefined,
  retryFromPhase: undefined,
  deployedCommunityId: undefined,
};

// ─── Helpers ───────────────────────────────────────────────────────────────

async function getEthersSigner(): Promise<Signer> {
  if (!window.ethereum) throw new Error("No wallet found");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const provider = new BrowserProvider(window.ethereum as any);
  return provider.getSigner();
}

/**
 * Every value here is a known, static, per-chain constant today — no new on-chain deployment or
 * dynamic computation (research.md #1). The registry-derived coordinator key is read live via
 * `registryData` (the same on-chain `getInfrastructure()` read already used for the MACI
 * deployment step above), rather than a separately-sourced generated-config copy, so this can
 * never drift from what's actually configured on-chain.
 */
export function buildPollDeployConfig(
  registryData: RegistryData,
  chainConstants: (typeof appConstants)[keyof typeof appConstants],
): PollDeployConfig {
  return {
    coordinatorPublicKey: new PublicKey([registryData.coordinatorPubKeyX, registryData.coordinatorPubKeyY]).serialize(),
    treeDepths: {
      tallyProcessingStateTreeDepth: FIXED_POLL_DEPLOY_CONSTANTS.tallyProcessingStateTreeDepth,
      voteOptionTreeDepth: FIXED_POLL_DEPLOY_CONSTANTS.voteOptionTreeDepth,
      stateTreeDepth: STATE_TREE_DEPTH,
    },
    messageBatchSize: FIXED_POLL_DEPLOY_CONSTANTS.messageBatchSize,
    freeForAllPolicyFactory: chainConstants.policyFactories.freeForAll.policy,
    freeForAllChecker: chainConstants.freeForAllChecker,
    constantVoiceCreditProxyFactory: chainConstants.constantVoiceCreditProxyFactory,
    initialVoiceCreditAmount: FIXED_POLL_DEPLOY_CONSTANTS.initialVoiceCreditAmount,
  };
}

function linkPoseidon(bytecode: string, registry: RegistryData): string {
  const strip = (addr: string) => addr.replace(/^0x/, "").toLowerCase().padStart(40, "0");
  return bytecode
    .replace(new RegExp("__\\$6574937f64fc1d7710ec0e28b7a36713bb\\$__", "g"), strip(registry.poseidonT3))
    .replace(new RegExp("__\\$dc01a9744591ab014bc46a3b7671cdaefb\\$__", "g"), strip(registry.poseidonT4))
    .replace(new RegExp("__\\$ce9c2c925f157047e54fa833ec4e61409f\\$__", "g"), strip(registry.poseidonT5))
    .replace(new RegExp("__\\$20527677031d76601747626a9845039fe4\\$__", "g"), strip(registry.poseidonT6));
}

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

async function deploySignUpPolicy(policyArgs: SignUpPolicyArgs, signer: Signer, chainId: number): Promise<Hex> {
  const chainConstants = appConstants[chainId as keyof typeof appConstants];
  if (!chainConstants) throw new Error(`Unsupported chain: ${chainId}`);

  const { policyFactories, policyInfrastructure } = chainConstants;
  const ZERO = "0x0000000000000000000000000000000000000000";

  const { type } = policyArgs;
  const { checker: checkerFactoryAddr, policy: policyFactoryAddr } =
    policyFactories[
      type === "FreeForAll"
        ? "freeForAll"
        : type === "EAS"
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
    case "FreeForAll":
      checkerArgs = [];
      break;
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
  const policyAddr = await deployClone(policyFactoryAddr, POLICY_DEPLOY_ABI, [checkerAddr], signer);
  return policyAddr;
}

export async function saveWithRetry(
  payload: communityApi.RegistrationPayload,
  signIn: () => Promise<void>,
): Promise<communityApi.Community> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await communityApi.register(payload);
    } catch (err) {
      if (err instanceof communityApi.AuthError) {
        try {
          await signIn();
          return await communityApi.register(payload);
        } catch (retryErr) {
          if (attempt === 2) throw retryErr;
          await new Promise<void>((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
          continue;
        }
      }
      if (attempt === 2) throw err;
      await new Promise<void>((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }
  throw new Error("Unreachable");
}

function getCompletedPhasesFromCheckpoint(lastPhase: DeployPhase | undefined): DeployPhase[] {
  if (!lastPhase) return [];
  const idx = ALL_PHASES.indexOf(lastPhase);
  return idx >= 0 ? ALL_PHASES.slice(0, idx + 1) : [];
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useCreateCommunity(): UseCreateCommunityResult {
  const { address } = useAccount();
  const chainId = useChainId();
  const registry = useZuGovRegistry();
  const { signIn } = useSiwe();
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const deployingRef = useRef(false);

  // On mount: restore in-progress deployment for current wallet
  useEffect(() => {
    if (!address) return;
    const checkpoint = getPendingCheckpoint(address as Hex);
    if (!checkpoint) return;

    setState((prev) => ({
      ...prev,
      step: "deploying",
      config: checkpoint.config,
      completedPhases: getCompletedPhasesFromCheckpoint(checkpoint.lastPhase),
      retryFromPhase: checkpoint.lastPhase,
    }));
  }, [address]);

  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      const idx = STEP_ORDER.indexOf(prev.step);
      if (idx <= 0) return prev;
      return { ...prev, step: STEP_ORDER[idx - 1] };
    });
  }, []);

  const setMechanism = useCallback((_mechanism: "maci") => {
    setState((prev) => ({ ...prev, step: "community_info" }));
  }, []);

  const setCommunityInfo = useCallback((displayName: string, description: string) => {
    setState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        displayName,
        description,
        membershipPolicy: "open",
        tierChangesRequireVote: false,
        tiers: DEFAULT_MEMBERSHIP_TIERS,
        defaultTierLabel: "Regular",
      },
      step: "maci_config",
    }));
  }, []);

  const setMaciConfig = useCallback(
    (config: Pick<MACIDeploymentConfig, "signUpPolicy" | "allowedPolicies" | "supportedModes">) => {
      setState((prev) => ({
        ...prev,
        config: { ...prev.config, ...config, stateTreeDepth: STATE_TREE_DEPTH },
        step: "network_check",
      }));
    },
    [],
  );

  const startNetworkCheck = useCallback(async () => {
    await registry.refetch();
    setState((prev) => ({ ...prev, registryStatus: registry }));
  }, [registry]);

  const runDeployment = useCallback(
    async (fromPhase: DeployPhase | undefined, existingCheckpoint?: PendingDeploymentCheckpoint) => {
      if (deployingRef.current) return;
      if (!address) throw new Error("Wallet not connected");
      if (!registry.data) throw new Error("Registry data not available");

      const config = state.config as MACIDeploymentConfig;
      if (!config.displayName) throw new Error("Community name is required");

      const registryData = registry.data;
      const chainConstants = appConstants[chainId as keyof typeof appConstants];
      const chainName = chainConstants?.chain.name ?? String(chainId);

      deployingRef.current = true;

      setState((prev) => ({
        ...prev,
        step: "deploying",
        errorMessage: undefined,
        retryFromPhase: undefined,
      }));

      const checkpoint: PendingDeploymentCheckpoint = existingCheckpoint ?? {
        config,
        lastPhase: "deploy_sign_up_policy",
        chainId,
        startedAt: Date.now(),
      };

      try {
        const signer = await getEthersSigner();
        let signUpPolicyAddress: Hex | undefined = checkpoint.deployedSignUpPolicyAddress;
        let maciAddress: Hex | undefined = checkpoint.deployedMaciAddress;
        let maciBlockNumber: number | undefined = checkpoint.deployedMaciBlockNumber;

        // Phase 1: Deploy sign-up policy
        if (!fromPhase || fromPhase === "deploy_sign_up_policy") {
          setPhase(setState, "deploy_sign_up_policy");
          signUpPolicyAddress = await deploySignUpPolicy(config.signUpPolicy, signer, chainId);
          checkpoint.deployedSignUpPolicyAddress = signUpPolicyAddress;
          checkpoint.lastPhase = "deploy_sign_up_policy";
          savePendingCheckpoint(address as Hex, checkpoint);
          addCompleted(setState, "deploy_sign_up_policy");
        }

        if (!signUpPolicyAddress) throw new Error("Sign-up policy address missing");

        // Phase 2: Deploy MACI
        if (!fromPhase || fromPhase === "deploy_sign_up_policy" || fromPhase === "deploy_maci") {
          setPhase(setState, "deploy_maci");
          const emptyBallotRoots = generateEmptyBallotRoots(STATE_TREE_DEPTH).slice(0, 5) as [
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
          ];
          const linkedBytecode = linkPoseidon(MACI__factory.bytecode, registryData);
          const maciFactory = new ContractFactory(MACI__factory.abi, linkedBytecode, signer);
          const maciContract = await maciFactory.deploy({
            pollFactory: registryData.pollFactory,
            messageProcessorFactory: registryData.messageProcessorFactory,
            tallyFactory: registryData.tallyFactory,
            signUpPolicy: signUpPolicyAddress,
            verifier: registryData.verifier,
            verifyingKeysRegistry: registryData.verifyingKeysRegistry,
            stateTreeDepth: STATE_TREE_DEPTH,
            emptyBallotRoots,
            owner: address,
            initialSupportedModes: config.supportedModes,
            initialAllowedPolicies: config.allowedPolicies,
          });
          const maciReceipt = (await maciContract.deploymentTransaction()?.wait()) as {
            status: number;
            hash: string;
            blockNumber: number;
          } | null;
          if (!maciReceipt || maciReceipt.status !== 1) throw new Error("MACI deployment failed");

          maciAddress = (await maciContract.getAddress()) as Hex;
          maciBlockNumber = maciReceipt.blockNumber;
          setState((prev) => ({ ...prev, currentTxHash: maciReceipt.hash as Hex }));
          checkpoint.deployedMaciAddress = maciAddress;
          checkpoint.deployedMaciBlockNumber = maciBlockNumber;
          checkpoint.lastPhase = "deploy_maci";
          savePendingCheckpoint(address as Hex, checkpoint);
          addCompleted(setState, "deploy_maci");
        }

        if (!maciAddress) throw new Error("MACI address missing");
        if (maciBlockNumber === undefined) throw new Error("MACI deployment block missing");

        // Phase 3: Set target (authorize MACI on the sign-up policy)
        if (
          !fromPhase ||
          fromPhase === "deploy_sign_up_policy" ||
          fromPhase === "deploy_maci" ||
          fromPhase === "set_target"
        ) {
          setPhase(setState, "set_target");
          const policy = new Contract(signUpPolicyAddress, SET_TARGET_ABI, signer);
          const setTargetTx = await (
            policy.setTarget as (addr: string) => Promise<{
              wait: () => Promise<{
                status: number;
              }>;
            }>
          )(maciAddress);
          const setTargetReceipt = await setTargetTx.wait();
          if (!setTargetReceipt || setTargetReceipt.status !== 1) throw new Error("setTarget failed");
          checkpoint.lastPhase = "set_target";
          savePendingCheckpoint(address as Hex, checkpoint);
          addCompleted(setState, "set_target");
        }

        // Phase 4: Register with backend
        setPhase(setState, "save_community");
        const payload: communityApi.RegistrationPayload = {
          id: maciAddress,
          displayName: config.displayName,
          description: config.description,
          logo: "🏛️",
          chainId,
          creatorAddress: address as Hex,
          allowedPolicies: config.allowedPolicies,
          supportedModes: config.supportedModes,
          signUpPolicyType: config.signUpPolicy.type,
          signUpPolicyAddress: signUpPolicyAddress,
          maciDeploymentBlock: maciBlockNumber,
          stateTreeDepth: STATE_TREE_DEPTH,
          source: "wizard",
          membershipPolicy: config.membershipPolicy,
          tierChangesRequireVote: config.tierChangesRequireVote,
          tiers: config.tiers,
          defaultTierLabel: config.defaultTierLabel,
          pollDeployConfig: chainConstants ? buildPollDeployConfig(registryData, chainConstants) : undefined,
        };

        const registered = await saveWithRetry(payload, signIn);
        addCompleted(setState, "save_community");

        clearPendingCheckpoint(address as Hex);

        window.dispatchEvent(
          new CustomEvent("zugov:community-created", {
            detail: {
              community: registered,
              signUpPolicyType: config.signUpPolicy.type,
              signUpPolicyAddress,
            },
          }),
        );

        setState((prev) => ({
          ...prev,
          step: "success",
          deployedCommunityId: maciAddress,
          currentPhase: undefined,
          summary: {
            displayName: config.displayName,
            description: config.description,
            signUpPolicyType: config.signUpPolicy.type,
            allowedPolicies: config.allowedPolicies,
            supportedModes: config.supportedModes,
            stateTreeDepth: STATE_TREE_DEPTH,
            deployerAddress: address as Hex,
            chainName,
          },
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setState((prev) => ({
          ...prev,
          step: "error",
          errorMessage: message,
          retryFromPhase: prev.currentPhase,
          currentPhase: undefined,
        }));
      } finally {
        deployingRef.current = false;
      }
    },
    [address, chainId, state.config, registry, signIn],
  );

  const startDeployment = useCallback(async () => {
    await runDeployment(undefined);
  }, [runDeployment]);

  const retryDeployment = useCallback(async () => {
    const checkpoint = address ? getPendingCheckpoint(address as Hex) : null;
    await runDeployment(state.retryFromPhase, checkpoint ?? undefined);
  }, [runDeployment, state.retryFromPhase, address]);

  const saveCommunity = useCallback(async () => {
    await runDeployment("save_community", address ? (getPendingCheckpoint(address as Hex) ?? undefined) : undefined);
  }, [runDeployment, address]);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const registryForState: RegistryStatus = {
    isLoading: registry.isLoading,
    isSupported: registry.isSupported,
    isReady: registry.isReady,
    data: registry.data,
    error: registry.error,
  };

  return {
    state: { ...state, registryStatus: registryForState },
    goToStep,
    goBack,
    setMechanism,
    setCommunityInfo,
    setMaciConfig,
    startNetworkCheck,
    startDeployment,
    retryDeployment,
    saveCommunity,
    reset,
  };
}

// ─── State helpers ─────────────────────────────────────────────────────────

function setPhase(setState: React.Dispatch<React.SetStateAction<WizardState>>, phase: DeployPhase) {
  setState((prev) => ({ ...prev, currentPhase: phase }));
}

function addCompleted(setState: React.Dispatch<React.SetStateAction<WizardState>>, phase: DeployPhase) {
  setState((prev) => ({ ...prev, completedPhases: [...prev.completedPhases, phase] }));
}
