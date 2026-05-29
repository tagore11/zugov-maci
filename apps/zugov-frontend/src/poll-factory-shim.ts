import { Contract, type ContractRunner } from "ethers";

const MACI_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "_stateIndex", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "_timestamp", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "_userPublicKeyX", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "_userPublicKeyY", type: "uint256" },
    ],
    name: "SignUp",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint256", name: "x", type: "uint256" },
          { internalType: "uint256", name: "y", type: "uint256" },
        ],
        internalType: "struct DomainObjs.PublicKey",
        name: "_publicKey",
        type: "tuple",
      },
      { internalType: "bytes", name: "_signUpPolicyData", type: "bytes" },
    ],
    name: "signUp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_publicKeyHash", type: "uint256" }],
    name: "getStateIndex",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "stateTreeDepth",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextPollId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSignups",
    outputs: [{ internalType: "uint256", name: "signUps", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_pollId", type: "uint256" }],
    name: "getPoll",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "metadata", type: "string" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "string[]", name: "options", type: "string[]" },
          { internalType: "bytes[]", name: "optionInfo", type: "bytes[]" },
          {
            components: [
              { internalType: "uint256", name: "x", type: "uint256" },
              { internalType: "uint256", name: "y", type: "uint256" },
            ],
            internalType: "struct DomainObjs.PublicKey",
            name: "coordinatorPubKey",
            type: "tuple",
          },
          { internalType: "address", name: "pollDeployer", type: "address" },
          { internalType: "enum DomainObjs.Mode", name: "mode", type: "uint8" },
          { internalType: "address", name: "policy", type: "address" },
          { internalType: "enum DomainObjs.Policy", name: "policyType", type: "uint8" },
        ],
        internalType: "struct IMACI.PollData",
        name: "pollData",
        type: "tuple",
      },
      {
        components: [
          { internalType: "address", name: "poll", type: "address" },
          { internalType: "address", name: "messageProcessor", type: "address" },
          { internalType: "address", name: "tally", type: "address" },
        ],
        internalType: "struct IMACI.PollContracts",
        name: "contracts",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint256", name: "startDate", type: "uint256" },
          { internalType: "uint256", name: "endDate", type: "uint256" },
          {
            components: [
              { internalType: "uint8", name: "tallyProcessingStateTreeDepth", type: "uint8" },
              { internalType: "uint8", name: "voteOptionTreeDepth", type: "uint8" },
              { internalType: "uint8", name: "stateTreeDepth", type: "uint8" },
            ],
            internalType: "struct Params.TreeDepths",
            name: "treeDepths",
            type: "tuple",
          },
          { internalType: "uint8", name: "messageBatchSize", type: "uint8" },
          {
            components: [
              { internalType: "uint256", name: "x", type: "uint256" },
              { internalType: "uint256", name: "y", type: "uint256" },
            ],
            internalType: "struct DomainObjs.PublicKey",
            name: "coordinatorPublicKey",
            type: "tuple",
          },
          { internalType: "enum DomainObjs.Mode", name: "mode", type: "uint8" },
          { internalType: "address", name: "policy", type: "address" },
          { internalType: "address", name: "initialVoiceCreditProxy", type: "address" },
          { internalType: "address[]", name: "relayers", type: "address[]" },
          { internalType: "uint256", name: "voteOptions", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "metadata", type: "string" },
          { internalType: "string[]", name: "options", type: "string[]" },
          { internalType: "bytes[]", name: "optionInfo", type: "bytes[]" },
          { internalType: "enum DomainObjs.Policy", name: "policyType", type: "uint8" },
        ],
        internalType: "struct IMACI.DeployPollArgs",
        name: "_pollArgs",
        type: "tuple",
      },
      { internalType: "address", name: "deployer", type: "address" },
    ],
    name: "deployPoll",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "metadata", type: "string" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "string[]", name: "options", type: "string[]" },
          { internalType: "bytes[]", name: "optionInfo", type: "bytes[]" },
          {
            components: [
              { internalType: "uint256", name: "x", type: "uint256" },
              { internalType: "uint256", name: "y", type: "uint256" },
            ],
            internalType: "struct DomainObjs.PublicKey",
            name: "coordinatorPubKey",
            type: "tuple",
          },
          { internalType: "address", name: "pollDeployer", type: "address" },
          { internalType: "enum DomainObjs.Mode", name: "mode", type: "uint8" },
          { internalType: "address", name: "policy", type: "address" },
          { internalType: "enum DomainObjs.Policy", name: "policyType", type: "uint8" },
        ],
        internalType: "struct IMACI.PollData",
        name: "pollData",
        type: "tuple",
      },
      {
        components: [
          { internalType: "address", name: "poll", type: "address" },
          { internalType: "address", name: "messageProcessor", type: "address" },
          { internalType: "address", name: "tally", type: "address" },
        ],
        internalType: "struct IMACI.PollContracts",
        name: "contracts",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const MACI__factory = {
  connect: (address: string, runner: ContractRunner | null) => new Contract(address, MACI_ABI, runner),
};

const POLL_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "_pollPublicKeyX", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "_pollPublicKeyY", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "_voiceCreditBalance", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "_nullifier", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "_pollStateIndex", type: "uint256" },
    ],
    name: "PollJoined",
    type: "event",
  },
  {
    inputs: [],
    name: "numMessages",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "pollNullifiers",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_nullifier", type: "uint256" },
      {
        components: [
          { internalType: "uint256", name: "x", type: "uint256" },
          { internalType: "uint256", name: "y", type: "uint256" },
        ],
        internalType: "struct DomainObjs.PublicKey",
        name: "_publicKey",
        type: "tuple",
      },
      { internalType: "uint256", name: "_stateRootIndex", type: "uint256" },
      { internalType: "uint256[8]", name: "_proof", type: "uint256[8]" },
      { internalType: "bytes", name: "_signUpPolicyData", type: "bytes" },
      { internalType: "bytes", name: "_initialVoiceCreditProxyData", type: "bytes" },
    ],
    name: "joinPoll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "coordinatorPublicKey",
    outputs: [
      { internalType: "uint256", name: "x", type: "uint256" },
      { internalType: "uint256", name: "y", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "endDate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStartAndEndDate",
    outputs: [
      { internalType: "uint256", name: "pollStartDate", type: "uint256" },
      { internalType: "uint256", name: "pollEndDate", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mergedStateRoot",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "messageBatchSize",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "stateMerged",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSignups",
    outputs: [{ internalType: "uint256", name: "signups", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treeDepths",
    outputs: [
      { internalType: "uint8", name: "tallyProcessingStateTreeDepth", type: "uint8" },
      { internalType: "uint8", name: "voteOptionTreeDepth", type: "uint8" },
      { internalType: "uint8", name: "stateTreeDepth", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "voteOptions",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [{ internalType: "uint256[10]", name: "data", type: "uint256[10]" }],
        internalType: "struct DomainObjs.Message",
        name: "_message",
        type: "tuple",
      },
      {
        components: [
          { internalType: "uint256", name: "x", type: "uint256" },
          { internalType: "uint256", name: "y", type: "uint256" },
        ],
        internalType: "struct DomainObjs.PublicKey",
        name: "_encryptionPublicKey",
        type: "tuple",
      },
    ],
    name: "publishMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [{ internalType: "uint256[10]", name: "data", type: "uint256[10]" }],
        internalType: "struct DomainObjs.Message[]",
        name: "_messages",
        type: "tuple[]",
      },
      {
        components: [
          { internalType: "uint256", name: "x", type: "uint256" },
          { internalType: "uint256", name: "y", type: "uint256" },
        ],
        internalType: "struct DomainObjs.PublicKey[]",
        name: "_encryptionPublicKeys",
        type: "tuple[]",
      },
    ],
    name: "publishMessageBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "extContracts",
    outputs: [
      { internalType: "contract IMACI", name: "maci", type: "address" },
      { internalType: "contract IVerifier", name: "verifier", type: "address" },
      { internalType: "contract IVerifyingKeysRegistry", name: "verifyingKeysRegistry", type: "address" },
      { internalType: "contract IBasePolicy", name: "policy", type: "address" },
      { internalType: "contract IInitialVoiceCreditProxy", name: "initialVoiceCreditProxy", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const Poll__factory = {
  connect: (address: string, runner: ContractRunner | null) => new Contract(address, POLL_ABI, runner),
};

const BASE_POLICY_ABI = [
  {
    inputs: [],
    name: "BASE_CHECKER",
    outputs: [{ internalType: "contract BaseChecker", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const BASE_CHECKER_ABI = [
  {
    inputs: [
      { internalType: "address", name: "subject", type: "address" },
      { internalType: "bytes", name: "evidence", type: "bytes" },
    ],
    name: "check",
    outputs: [{ internalType: "bool", name: "checked", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const BasePolicy__factory = {
  connect: (address: string, runner: ContractRunner | null) => new Contract(address, BASE_POLICY_ABI, runner),
};

export const BaseChecker__factory = {
  connect: (address: string, runner: ContractRunner | null) => new Contract(address, BASE_CHECKER_ABI, runner),
};

const FREE_FOR_ALL_POLICY_ABI = [
  {
    inputs: [{ internalType: "address", name: "_target", type: "address" }],
    name: "setTarget",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const FreeForAllPolicy__factory = {
  connect: (address: string, runner: ContractRunner | null) => new Contract(address, FREE_FOR_ALL_POLICY_ABI, runner),
};

const FREE_FOR_ALL_POLICY_FACTORY_ABI = [
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "clone", type: "address" }],
    name: "CloneDeployed",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "checker", type: "address" }],
    name: "deploy",
    outputs: [{ internalType: "address", name: "clone", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const FreeForAllPolicyFactory__factory = {
  connect: (address: string, runner: ContractRunner | null) =>
    new Contract(address, FREE_FOR_ALL_POLICY_FACTORY_ABI, runner),
};

const CONSTANT_VOICE_CREDIT_PROXY_FACTORY_ABI = [
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "clone", type: "address" }],
    name: "CloneDeployed",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "balance", type: "uint256" }],
    name: "deploy",
    outputs: [{ internalType: "address", name: "clone", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const ConstantVoiceCreditProxyFactory__factory = {
  connect: (address: string, runner: ContractRunner | null) =>
    new Contract(address, CONSTANT_VOICE_CREDIT_PROXY_FACTORY_ABI, runner),
};
