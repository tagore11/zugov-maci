# MACI Governance Architecture Diagrams

## Overview

This document contains comprehensive diagrams and explanations of the MACI (Minimum Anti-Collusion Infrastructure) governance system, showing how contracts interact and the complete user journey from setup to execution.

## Contract Architecture Overview

The MACI system is a privacy-preserving governance mechanism that supports different governance systems through a modular architecture.

### Currently Implemented Contracts

**Core Contracts:**

- **MACI.sol**: The main contract that manages user signups, poll deployment, and maintains the global state tree. It serves as the central hub for all governance activities.
- **Poll.sol**: Individual poll contracts that handle encrypted message submission, poll joining, and vote processing. Each poll has its own state tree and voting period.
- **MessageProcessor.sol**: Processes encrypted messages and generates proofs for vote tallying.
- **Tally.sol**: Handles the final vote tallying and result computation using zero-knowledge proofs.

**Factory Contracts:**

- **PollFactory.sol**: Deploys new Poll contracts with proper initialization
- **MessageProcessorFactory.sol**: Creates MessageProcessor instances for polls
- **TallyFactory.sol**: Creates Tally instances for polls

**Policy Contracts (Authentication/Eligibility):**

- **FreeForAllPolicy**: Allows anyone to sign up and vote
- **EASPolicy**: Uses Ethereum Attestation Service for eligibility verification
- **GitcoinPassportPolicy**: Integrates with Gitcoin Passport for identity verification
- **ZupassPolicy**: Uses Zupass for authentication
- **SemaphorePolicy**: Integrates with Semaphore for anonymous authentication
- **HatsPolicy**: Uses Hats Protocol for role-based access
- **MerkleProofPolicy**: Uses Merkle proofs for allowlist-based access
- **ERC20VotesPolicy**: Token-based voting with snapshot support
- **ERC20Policy**: Simple token-based eligibility

**Supporting Contracts:**

- **VerifyingKeysRegistry.sol**: Manages zk-SNARK verifying keys
- **InitialVoiceCreditProxy contracts**: Determine voice credit allocation
- **Crypto utilities**: BabyJubJub, Poseidon hash functions, Verifier contracts
- **Tree implementations**: LeanIMT and LazyIMT for efficient Merkle trees

### Contracts That Need Implementation (Based on TODO)

**Missing Components:**

1. **CoordinatorPublicKeyManager**: A separate contract to hold coordinator public keys (mentioned in TODO - this would allow creating new DAOs without redeploying all MACI contracts)
2. **Advanced Policy Combiners**: Support for AND/OR logic between multiple policies (TODO mentions "poll requires a policy (we need to support and & or)")
3. **Payable Vote Functions**: Wrapper contracts to handle payable voting functions (TODO mentions "vote functions should be payable")
4. **Future ID Scheme Support**: Flexible identity verification system for future ID schemes

## Architecture Diagram

```mermaid
graph TB
    subgraph "Governance Layer"
        MACI[MACI Core Contract]
        Space[Space Contract - Future]
    end

    subgraph "Policy Layer"
        Auth[Authenticators]
        PropVal[ProposalValidation]
        VoteStrat[VotingStrategies]
        ExecStrat[ExecutionStrategies]
    end

    subgraph "Current MACI Policies"
        FFA[FreeForAllPolicy]
        EAS[EASPolicy]
        GP[GitcoinPassportPolicy]
        ZP[ZupassPolicy]
        SP[SemaphorePolicy]
        HP[HatsPolicy]
        MP[MerkleProofPolicy]
        ERC20[ERC20Policy]
        ERC20V[ERC20VotesPolicy]
    end

    subgraph "Poll Management"
        PollFac[PollFactory]
        MPFac[MessageProcessorFactory]
        TallyFac[TallyFactory]
    end

    subgraph "Individual Polls"
        Poll1[Poll 1]
        Poll2[Poll 2]
        PollN[Poll N]
    end

    subgraph "Processing Layer"
        MsgProc[MessageProcessor]
        Tally[Tally Contract]
    end

    subgraph "Infrastructure"
        VKR[VerifyingKeysRegistry]
        VCP[VoiceCreditProxy]
        CoordMgr[CoordinatorPublicKey Manager - TODO]
        Verifier[Verifier Contract]
    end

    subgraph "Crypto Utilities"
        Poseidon[Poseidon Hash]
        BabyJub[BabyJubJub Curve]
        IMT[Merkle Trees]
    end

    %% Connections
    MACI --> PollFac
    MACI --> Auth
    MACI --> VKR

    PollFac --> Poll1
    PollFac --> Poll2
    PollFac --> PollN

    Poll1 --> MPFac
    Poll1 --> TallyFac
    Poll2 --> MPFac
    Poll2 --> TallyFac
    PollN --> MPFac
    PollN --> TallyFac

    MPFac --> MsgProc
    TallyFac --> Tally

    Auth --> FFA
    Auth --> EAS
    Auth --> GP
    Auth --> ZP
    Auth --> SP
    Auth --> HP
    Auth --> MP
    Auth --> ERC20
    Auth --> ERC20V

    MACI --> VCP
    MACI --> CoordMgr
    MsgProc --> Verifier
    Tally --> Verifier

    Poll1 --> IMT
    Poll2 --> IMT
    PollN --> IMT

    Verifier --> Poseidon
    Verifier --> BabyJub

    %% Future connections
    Space -.-> Auth
    Space -.-> PropVal
    Space -.-> VoteStrat
    Space -.-> ExecStrat

    classDef implemented fill:#e1f5fe
    classDef todo fill:#fff3e0
    classDef future fill:#f3e5f5

    class MACI,PollFac,MPFac,TallyFac,Poll1,Poll2,PollN,MsgProc,Tally,VKR,VCP,Verifier,IMT,Poseidon,BabyJub,FFA,EAS,GP,ZP,SP,HP,MP,ERC20,ERC20V implemented
    class CoordMgr todo
    class Space,PropVal,VoteStrat,ExecStrat future
```

## User Journey Flow Diagram

```mermaid
graph TB
    %% User Actors
    User[User/Voter]
    Coordinator[Coordinator]
    Deployer[DAO Deployer]

    %% Setup Phase
    subgraph "1. Initial Setup"
        Deployer -->|Deploy MACI| MACI[MACI Core]
        Deployer -->|Configure Policies| PolicyFactories[Policy Factories]
        Deployer -->|Setup Infrastructure| VKR[VerifyingKeysRegistry]
        Deployer -->|Initialize| VCP[VoiceCreditProxy]
    end

    %% User Registration
    subgraph "2. User Registration"
        User -->|signUp()| MACI
        MACI -->|Check eligibility| SignUpPolicy[SignupPolicy]
        SignUpPolicy -->|Verify| ExternalSystems[ExternalSystems<br/>NFT/Token/EAS/etc]
        MACI -->|Update State Tree| StateTree[GlobalStateTree]
    end

    %% Poll Creation
    subgraph "3. Poll Creation (Proposal)"
        Coordinator -->|deployPoll()| MACI
        MACI -->|Create Poll| PollFac[PollFactory]
        PollFac -->|Deploy| Poll[Poll Contract]
        PollFac -->|Create| MsgProc[MessageProcessor]
        PollFac -->|Create| Tally[Tally Contract]
        Poll -->|Configure| PollPolicy[PollPolicy]
        Poll -->|Set Voice Credits| PollVCP[PollVoiceCreditProxy]
    end

    %% Poll Participation
    subgraph "4. Join Poll"
        User -->|joinPoll()| Poll
        Poll -->|Verify ZK Proof| Verifier[VerifierContract]
        Poll -->|Check Policy| PollPolicy
        Poll -->|Get Voice Credits| PollVCP
        Poll -->|Update Poll State| PollStateTree[PollStateTree]
    end

    %% Voting
    subgraph "5. Voting Process"
        User -->|Encrypt Vote| Client[ClientSide<br/>Encryption]
        User -->|publishMessage()| Poll
        Poll -->|Add to Message Queue| MessageQueue[MessageQueue]
        Relayer[Relayer] -->|relayMessagesBatch()| Poll
        Poll -->|Batch Processing| BatchHashes[BatchHashes]
    end

    %% Processing & Tallying
    subgraph "6. Message Processing"
        Coordinator -->|processMessages()| MsgProc
        MsgProc -->|Generate ZK Proof| Verifier
        MsgProc -->|Update Ballots| BallotTree[BallotTree]
        Poll -->|mergeState()| Poll
        Poll -->|Finalize State| FinalState[FinalPollState]
    end

    subgraph "7. Tallying"
        Coordinator -->|tallyVotes()| Tally
        Tally -->|Generate ZK Proof| Verifier
        Tally -->|Compute Results| Results[TallyResults]
        Poll -->|getPollResult()| Results
    end

    %% Execution
    subgraph "8. Proposal Execution"
        Coordinator -->|Verify Results| Results
        Coordinator -->|Execute Proposal| Execution[ExecutionStrategy<br/>/ DAOContract]
        Execution -->|Call Target Contracts| TargetContracts[TargetContracts]
    end

    %% Settings Management
    subgraph "9. Settings Management"
        Deployer -->|Update Policies| MACI
        MACI -->|Configure| PolicyFactories
        Coordinator -->|Update Poll Settings| Poll
        Poll -->|Modify Parameters| PollSettings[PollSettings]
    end

    %% Supporting Infrastructure
    subgraph "Infrastructure Layer"
        Crypto[CryptoUtilities<br/>Poseidon/BabyJubJub]
        Trees[MerkleTrees<br/>LeanIMT/LazyIMT]
        Storage[ContractStorage<br/>State/Ballots]
    end

    %% Connections to Infrastructure
    MACI --> Trees
    Poll --> Trees
    MsgProc --> Crypto
    Tally --> Crypto
    Verifier --> VKR
    StateTree --> Storage
    PollStateTree --> Storage
    BallotTree --> Storage

    %% Policy Connections
    PolicyFactories --> FFA[FreeForAll]
    PolicyFactories --> EAS[EASPolicy]
    PolicyFactories --> ERC20[ERC20Policy]
    PolicyFactories --> Gitcoin[GitcoinPassport]
    PolicyFactories --> Zupass[Zupass]
    PolicyFactories --> Hats[HatsProtocol]
    PolicyFactories --> Merkle[MerkleProof]

    %% Styling
    classDef user fill:#e3f2fd
    classDef contract fill:#f3e5f5
    classDef process fill:#e8f5e8
    classDef infrastructure fill:#fff3e0
    classDef policy fill:#fce4ec

    class User,Coordinator,Deployer user
    class MACI,Poll,MsgProc,Tally,Verifier,VKR,VCP,PollFac contract
    class SignUpPolicy,PollPolicy,PollVCP,Execution,TargetContracts process
    class Crypto,Trees,Storage,StateTree,PollStateTree,BallotTree,MessageQueue,BatchHashes infrastructure
    class FFA,EAS,ERC20,Gitcoin,Zupass,Hats,Merkle,PolicyFactories policy
```

## User Journey Breakdown

### Phase 1: Initial Setup

- **DAO Deployer** deploys the core MACI contract
- Configures policy factories for different authentication methods
- Sets up verifying keys registry and voice credit proxies

### Phase 2: User Registration

- **Users** register with MACI using `signUp()`
- Signup policy verifies eligibility (token holdings, NFT ownership, etc.)
- User's public key is added to the global state tree

### Phase 3: Poll Creation (Proposal)

- **Coordinator** creates new polls using `deployPoll()`
- Poll factory deploys Poll, MessageProcessor, and Tally contracts
- Configures poll-specific policies and voice credit allocation

### Phase 4: Join Poll

- **Users** join specific polls using `joinPoll()`
- Zero-knowledge proof proves eligibility without revealing identity
- Poll-specific state tree is updated

### Phase 5: Voting

- **Users** encrypt votes client-side using coordinator's public key
- Submit encrypted messages via `publishMessage()`
- **Relayers** can batch process messages for efficiency

### Phase 6: Message Processing

- **Coordinator** processes messages using `processMessages()`
- ZK proofs ensure valid message processing
- Updates ballot tree with encrypted votes

### Phase 7: Tallying

- **Coordinator** tallies votes using `tallyVotes()`
- ZK proofs enable private result computation
- Results are published on-chain

### Phase 8: Execution

- **Coordinator** verifies results and executes proposals
- Execution strategies handle contract interactions
- Target contracts implement the governance decisions

### Phase 9: Settings Management

- **Deployer** can update MACI-level policies
- **Coordinator** can modify poll-specific settings
- Dynamic configuration allows for governance evolution

## Key Features Demonstrated

**Privacy**: All votes are encrypted and processed using ZK proofs
**Modularity**: Different policies can be swapped without core changes
**Scalability**: Batch processing and efficient Merkle trees
**Flexibility**: Supports multiple authentication methods and voting strategies
**Integrity**: Cryptographic proofs ensure vote validity and result accuracy

## Voting Modes and Policy Types

The system supports multiple voting modes and policy types:

```mermaid
graph LR
    subgraph "Voting Modes"
        QV[Quadratic Voting<br/>Mode.QV]
        NON_QV[Linear Voting<br/>Mode.NON_QV]
        FULL[Full Weight Voting<br/>Mode.FULL]
        RANKED[Ranked Choice<br/>Mode.RANKED]
    end

    subgraph "Policy Types"
        ERC20[ERC20 Token<br/>Policy.ERC20]
        FFA[Free For All<br/>Policy.FreeForAll]
        MERKLE[Merkle Proof<br/>Policy.MerkleProof]
        ERC20V[ERC20 Votes<br/>Policy.ERC20Votes]
        EAS[EAS Attestation<br/>Policy.EAS]
        GITCOIN[Gitcoin Passport<br/>Policy.GitcoinPassport]
        ZUPASS[Zupass<br/>Policy.Zupass]
        SEMAPHORE[Semaphore<br/>Policy.Semaphore]
        ANON[AnonAadhaar<br/>Policy.AnonAadhaar]
        TOKEN[Token<br/>Policy.Token]
        HATS[Hats Protocol<br/>Policy.Hats]
    end
```

## Detailed Message Flow and State Management

```mermaid
sequenceDiagram
    participant User
    participant MACI
    participant Poll
    participant MessageProcessor
    participant Tally
    participant Verifier

    Note over User,Tally: 1. Registration Phase
    User->>MACI: signUp(publicKey, policyData)
    MACI->>MACI: verifyPolicy()
    MACI->>MACI: updateStateTree()
    MACI-->>User: SignUp event

    Note over User,Tally: 2. Poll Creation
    Coordinator->>MACI: deployPoll(pollArgs)
    MACI->>PollFactory: createPoll()
    PollFactory->>Poll: initialize()
    PollFactory->>MessageProcessor: create()
    PollFactory->>Tally: create()

    Note over User,Tally: 3. Join Poll
    User->>Poll: joinPoll(nullifier, publicKey, proof)
    Poll->>Verifier: verifyJoiningProof()
    Verifier-->>Poll: valid/invalid
    Poll->>Poll: updatePollStateTree()
    Poll-->>User: PollJoined event

    Note over User,Tally: 4. Voting Phase
    User->>User: encryptVote()
    User->>Poll: publishMessage(encryptedMessage)
    Poll->>Poll: updateMessageQueue()
    Poll-->>User: PublishMessage event

    Note over User,Tally: 5. Processing Phase
    Coordinator->>MessageProcessor: processMessages()
    MessageProcessor->>Verifier: verifyProcessingProof()
    Verifier-->>MessageProcessor: valid
    MessageProcessor->>MessageProcessor: updateBallotTree()

    Note over User,Tally: 6. Tallying Phase
    Coordinator->>Poll: mergeState()
    Poll->>Poll: finalizeState()
    Coordinator->>Tally: tallyVotes()
    Tally->>Verifier: verifyTallyProof()
    Verifier-->>Tally: valid
    Tally->>Tally: computeResults()
    Tally-->>Coordinator: TallyResults event
```

## State Tree Architecture

```mermaid
graph TB
    subgraph "Global MACI State"
        GlobalState[Global State Tree]
        User1[User 1 State Leaf]
        User2[User 2 State Leaf]
        UserN[User N State Leaf]

        GlobalState --> User1
        GlobalState --> User2
        GlobalState --> UserN
    end

    subgraph "Poll-Specific State"
        PollState[Poll State Tree]
        PollUser1[Poll User 1]
        PollUser2[Poll User 2]
        PollUserN[Poll User N]

        PollState --> PollUser1
        PollState --> PollUser2
        PollState --> PollUserN
    end

    subgraph "Ballot State"
        BallotTree[Ballot Tree]
        Ballot1[Ballot 1]
        Ballot2[Ballot 2]
        BallotN[Ballot N]

        BallotTree --> Ballot1
        BallotTree --> Ballot2
        BallotTree --> BallotN
    end

    User1 -.->|joinPoll| PollUser1
    User2 -.->|joinPoll| PollUser2
    UserN -.->|joinPoll| PollUserN

    PollUser1 -.->|vote| Ballot1
    PollUser2 -.->|vote| Ballot2
    PollUserN -.->|vote| BallotN
```

## Future Enhancements (Based on TODO)

### Policy Composition Architecture

Based on the TODO mentioning "support and & or" policies, here's the planned architecture:

```mermaid
graph TB
    subgraph "Policy Composition"
        BasePolicy[Base Policy Interface]

        subgraph "Atomic Policies"
            TokenPolicy[Token Policy]
            NFTPolicy[NFT Policy]
            EASPolicy[EAS Policy]
            TimePolicy[Time Policy]
        end

        subgraph "Combinatorial Policies"
            AndPolicy[AND Policy]
            OrPolicy[OR Policy]
            ThresholdPolicy[Threshold Policy]
            WeightedPolicy[Weighted Policy]
        end

        subgraph "Complex Examples"
            TokenAndNFT[Token AND NFT]
            MultiToken[2 of 3 Tokens]
            TimeAndToken[Time AND Token]
            CustomLogic[Custom Logic Policy]
        end

        BasePolicy --> TokenPolicy
        BasePolicy --> NFTPolicy
        BasePolicy --> EASPolicy
        BasePolicy --> TimePolicy

        BasePolicy --> AndPolicy
        BasePolicy --> OrPolicy
        BasePolicy --> ThresholdPolicy
        BasePolicy --> WeightedPolicy

        AndPolicy --> TokenAndNFT
        ThresholdPolicy --> MultiToken
        AndPolicy --> TimeAndToken
        BasePolicy --> CustomLogic

        TokenAndNFT --> TokenPolicy
        TokenAndNFT --> NFTPolicy

        MultiToken --> TokenPolicy
        MultiToken --> TokenPolicy
        MultiToken --> TokenPolicy

        TimeAndToken --> TimePolicy
        TimeAndToken --> TokenPolicy
    end
```

### Coordinator Key Management (TODO Item)

```mermaid
graph TB
    subgraph "Current Architecture"
        MACI[MACI Contract]
        CoordinatorKey[Coordinator Public Key<br/>Hardcoded]

        MACI --> CoordinatorKey
    end

    subgraph "Future Architecture (TODO)"
        MACI2[MACI Contract]
        KeyManager[Coordinator Key Manager]
        KeyRegistry[Key Registry]

        subgraph "Multiple Coordinators"
            Coord1[Coordinator 1]
            Coord2[Coordinator 2]
            CoordN[Coordinator N]
        end

        MACI2 --> KeyManager
        KeyManager --> KeyRegistry
        KeyRegistry --> Coord1
        KeyRegistry --> Coord2
        KeyRegistry --> CoordN

        KeyManager -.->|rotateKeys| KeyRegistry
        KeyManager -.->|addCoordinator| KeyRegistry
        KeyManager -.->|revokeCoordinator| KeyRegistry
    end
```

### Payable Voting Functions (TODO Item)

```mermaid
graph TB
    subgraph "Current Architecture"
        Poll[Poll Contract]
        VoteFunction[publishMessage()<br/>Non-payable]

        Poll --> VoteFunction
    end

    subgraph "Future Architecture (TODO)"
        Poll2[Poll Contract]
        VoteWrapper[Payable Vote Wrapper]
        PaymentProcessor[Payment Processor]
        Treasury[DAO Treasury]

        subgraph "Payment Logic"
            FeeStructure[Vote Fee Structure]
            RefundLogic[Refund Logic]
            IncentiveMechanism[Incentive Mechanism]
        end

        Poll2 --> VoteWrapper
        VoteWrapper --> PaymentProcessor
        PaymentProcessor --> Treasury
        PaymentProcessor --> FeeStructure
        PaymentProcessor --> RefundLogic
        PaymentProcessor --> IncentiveMechanism

        User[User] -->|payable vote| VoteWrapper
        VoteWrapper -.->|forward to| Poll2
        VoteWrapper -.->|process payment| PaymentProcessor
    end
```

### Integration with Existing DAOs

```mermaid
graph TB
    subgraph "Existing DAO Integration"
        ExistingDAO[Existing DAO Contract]
        GovToken[Governance Token]
        DAOSettings[DAO Settings]

        ExistingDAO --> GovToken
        ExistingDAO --> DAOSettings
    end

    subgraph "MACI Integration Layer"
        Adapter[DAO Adapter Contract]
        PolicyBridge[Policy Bridge]
        ExecutionBridge[Execution Bridge]

        Adapter --> PolicyBridge
        Adapter --> ExecutionBridge
    end

    subgraph "MACI System"
        MACI[MACI Core]
        Polls[Poll Contracts]
        Results[Tally Results]

        MACI --> Polls
        Polls --> Results
    end

    ExistingDAO -.->|delegate voting| Adapter
    Adapter -.->|create policies| PolicyBridge
    Adapter -.->|execute results| ExecutionBridge

    PolicyBridge --> MACI
    ExecutionBridge --> ExistingDAO

    Results --> ExecutionBridge
```

### Future ID Scheme Support (TODO Item)

```mermaid
graph TB
    subgraph "Current ID Systems"
        CurrentPolicies[Current Policies]
        ERC20[ERC20]
        NFT[NFT]
        EAS[EAS]
        Semaphore[Semaphore]

        CurrentPolicies --> ERC20
        CurrentPolicies --> NFT
        CurrentPolicies --> EAS
        CurrentPolicies --> Semaphore
    end

    subgraph "Future ID Systems (TODO)"
        FuturePolicies[Future-Proof Policy System]
        IDRegistry[ID Scheme Registry]

        subgraph "New ID Schemes"
            SBT[ Soul Bound Tokens]
            DID[ Decentralized IDs]
            PCD[ PCDs]
            ZKID[ Zero-Knowledge IDs]
            WebAuthn[ WebAuthn]
            SocialGraph[ Social Graph IDs]
        end

        FuturePolicies --> IDRegistry
        IDRegistry --> SBT
        IDRegistry --> DID
        IDRegistry --> PCD
        IDRegistry --> ZKID
        IDRegistry --> WebAuthn
        IDRegistry --> SocialGraph

        IDRegistry -.->|register new scheme| FuturePolicies
        IDRegistry -.->|deprecate old scheme| FuturePolicies
    end
```

## Key Takeaways for Future Development

1. **Policy Composition**: The system needs AND/OR policy combinators for complex eligibility rules
2. **Coordinator Management**: A separate key manager contract will enable multi-coordinator setups
3. **Payable Functions**: Vote wrappers can handle payment processing for vote fees or incentives
4. **DAO Integration**: Adapter contracts can bridge existing DAOs with MACI's privacy features
5. **Extensible ID System**: A registry-based approach allows adding new identity schemes without core changes

This architecture provides a solid foundation for building sophisticated, privacy-preserving governance systems that can evolve with the rapidly changing Web3 landscape.
