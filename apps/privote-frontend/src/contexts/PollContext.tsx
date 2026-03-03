import useAppConstants from '@/hooks/useAppConstants';
import useEthersSigner from '@/hooks/useEthersSigner';
import usePoll from '@/hooks/usePoll';
import usePollArtifacts from '@/hooks/usePollArtifacts';
import { PollStatus } from '@/types';
import {
  DEFAULT_IVCP_DATA,
  DEFAULT_SG_DATA,
  SIGNATURE_MESSAGE,
  PORTO_CONNECTOR_ID,
  RETRY_ATTEMPTS,
  SUBGRAPH_INDEXING_BLOCKS,
  SIGNUP_SUBGRAPH_WAIT_BLOCKS
} from '@/utils/constants';
import { isEthGetLogsError, isBalanceTooLowError } from '@/utils/errorHandlers';
import { handleNotice, notification } from '@/utils/notification';
import { computePollStatus, notifyStatusChange, shouldNotifyStatusChange } from '@/utils/pollStatus';
import { getJoinedUserData, getKeys, getSignedupUserData } from '@/utils/subgraph';
import { Keypair } from '@maci-protocol/domainobjs';
import {
  generateSignUpTreeFromKeys,
  isTallied,
  joinPoll,
  signup,
  getSignedupUserData as getSignedupUserDataOnChain
} from '@maci-protocol/sdk/browser';
import { type LeanIMTMerkleProof } from '@zk-kit/lean-imt';
import { createContext, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Hex, parseAbi, keccak256 } from 'viem';
import { usePublicClient, useAccount, useSignMessage, useChainId, useSwitchChain } from 'wagmi';
import { type IPollContextType } from './types';
import useFaucetContext from '@/hooks/useFaucetContext';
import { useSigContext } from './SigContext';
import { generateKeypairFromSeed } from '@/utils/keypair';
import { retryWithBackoff } from '@/utils/retry';
import { getSubgraphUrl } from '@/utils/subgraphUrl';

export const PollContext = createContext<IPollContextType | undefined>(undefined);

export const PollProvider = ({
  pollAddress,
  daoName,
  children
}: {
  pollAddress: string;
  daoName?: string;
  children: ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSignupLoading, setIsSignupLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>();

  const { daos, slugs } = useAppConstants();
  // When daoName is not passed (e.g. from /polls/[id] page), fall back to the first
  // available DAO's subgraph URL on the current chain. This is needed for getJoinedUserData,
  // getInclusionProof, and the eth_getLogs fallback inside onJoinPoll.
  const subgraphUrl = getSubgraphUrl(daoName, daos, slugs) || Object.values(daos)[0]?.subgraphUrl || '';
  console.log('PollContext: subgraphUrl', subgraphUrl);
  console.log('PollContext: pollAddress', pollAddress);
  console.log('PollContext: daoName', daoName);

  // MACI contract
  const [inclusionProof, setInclusionProof] = useState<LeanIMTMerkleProof | null>(null);

  // variables for porto
  const [portoMaciKeypair, setPortoMaciKeypair] = useState<Keypair | null>(null);
  const [portoMaciStateIndex, setPortoMaciStateIndex] = useState<string | undefined>(undefined);
  const [portoIsRegistered, setPortoIsRegistered] = useState<boolean>(false);

  // Poll contract
  const [hasJoinedPoll, setHasJoinedPoll] = useState<boolean>(false);
  const [initialVoiceCredits, setInitialVoiceCredits] = useState<number>(0);
  const [pollStateIndex, setPollStateIndex] = useState<string | undefined>(undefined);

  // Dynamic poll status and loading states
  const [dynamicPollStatus, setDynamicPollStatus] = useState<PollStatus | null>(null);
  const [isCheckingTallied, setIsCheckingTallied] = useState<boolean>(false);
  const [isCheckingUserJoinedPoll, setIsCheckingUserJoinedPoll] = useState<boolean>(false);

  // Artifacts from custom hook (lazy loading - only load when user hasn't joined the poll)
  const { artifacts, error: artifactsError, loadArtifacts } = usePollArtifacts(!hasJoinedPoll);

  // Poll

  const {
    data: poll,
    isLoading: pollLoading,
    isError: isPollError,
    error: pollError,
    refetch: refetchPoll
  } = usePoll({ pollAddress, subgraphUrl });

  console.log('usePoll, poll:', poll);
  console.log('usePoll, poll.mode:', poll?.mode);
  console.log('usePoll, poll keys:', poll ? Object.keys(poll) : 'poll is null');
  // Wallet variables
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const client = usePublicClient();
  const { address, isConnected, connector } = useAccount();

  // Reset join state when the connected wallet address changes (different user).
  // We track this separately so the check-effect early-return doesn't reset a
  // confirmed join due to transient prerequisite unavailability (e.g. while
  // SigContext is re-checking registration status).
  const prevAddressRef = useRef<string | undefined>(address);
  useEffect(() => {
    if (prevAddressRef.current !== address) {
      prevAddressRef.current = address;
      setHasJoinedPoll(false);
      setInitialVoiceCredits(0);
      setPollStateIndex(undefined);
    }
  }, [address]);

  const privoteContractAddress = poll?.privoteContractAddress;
  console.log('privoteContractAddress', privoteContractAddress);
  const { shadowChain, blockTime } = useAppConstants();
  const signer = useEthersSigner({ chainId });
  console.log('Debug - Connection state:', { isConnected, address, chainId, signer: !!signer });
  console.log('pollAddress', pollAddress);
  console.log('pollError', pollError);
  const { maciKeypair, isRegistered, stateIndex, loadKeypairFromLocalStorage, generateKeypair, updateStatus } =
    useSigContext();
  const { checkBalance } = useFaucetContext();
  const isPorto = connector?.id === PORTO_CONNECTOR_ID;

  // Log connection state changes
  useEffect(() => {
    console.log('Connection state changed:', {
      isConnected,
      address,
      chainId,
      signer: !!signer,
      connector: connector?.name
    });
  }, [isConnected, address, chainId, signer, connector]);

  // temp variables
  const unifiedState = useMemo(() => {
    if (isPorto) {
      return {
        maciKeypair: portoMaciKeypair,
        isRegistered: portoIsRegistered,
        stateIndex: portoMaciStateIndex
      };
    }

    return {
      maciKeypair,
      isRegistered,
      stateIndex
    };
  }, [isPorto, portoMaciKeypair, portoIsRegistered, portoMaciStateIndex, maciKeypair, isRegistered, stateIndex]);
  const tempMaciKeypair = unifiedState.maciKeypair;
  const tempStateIndex = unifiedState.stateIndex;
  const tempIsRegistered = unifiedState.isRegistered;

  // Compute dynamic poll status based on current time
  const computeDynamicPollStatus = useCallback(() => {
    if (!poll) return null;
    return computePollStatus(poll.startDate, poll.endDate);
  }, [poll]);

  // Update dynamic status periodically and notify on changes
  useEffect(() => {
    if (!poll) return;

    const updateStatus = (interval?: NodeJS.Timeout) => {
      const newStatus = computeDynamicPollStatus();
      const previousStatus = dynamicPollStatus;

      setDynamicPollStatus(newStatus);

      // Show notification if status changed
      if (shouldNotifyStatusChange(previousStatus, newStatus) && previousStatus && newStatus) {
        notifyStatusChange(previousStatus, newStatus);
      }

      // Clear interval if poll is over
      if (newStatus === PollStatus.CLOSED) {
        clearInterval(interval);
      }
    };

    // Update immediately
    updateStatus();

    // Set up interval to update every second
    const interval = setInterval(() => {
      updateStatus(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [poll, computeDynamicPollStatus, dynamicPollStatus]);

  // Functions
  const handleChainSwitch = useCallback(
    async (targetChainId: number): Promise<boolean> => {
      if (targetChainId === chainId) {
        return true;
      }

      try {
        const result = await switchChainAsync({ chainId: targetChainId });

        if (result.id !== targetChainId) {
          setError('Error switching chain');
          notification.error('Error switching chain');
          return false;
        }

        console.log('Switched chain', result);

        // Wait for wallet state to fully synchronize after chain switch
        await new Promise(resolve => setTimeout(resolve, 3000));

        return true;
      } catch (error) {
        console.log('Error switching chain:', error);
        setError('Error switching chain');
        notification.error('Error switching chain');
        return false;
      }
    },
    [chainId, switchChainAsync]
  );

  const getInclusionProof = useCallback(async () => {
    if (!tempStateIndex) return;
    if (!tempMaciKeypair) return;
    if (!subgraphUrl) return;
    try {
      const keys = await getKeys(subgraphUrl);
      console.log('getInclusionProof: keys', keys);
      const signupTree = generateSignUpTreeFromKeys(keys);

      // Find the leaf's index directly from the tree to compare
      const treeIndex = signupTree.indexOf(tempMaciKeypair.publicKey.hash());
      const inclusionProof = treeIndex !== -1 ? signupTree.generateProof(treeIndex) : null;
      setInclusionProof(inclusionProof);

      return inclusionProof;
    } catch (error) {
      console.error('Error getting inclusion proof', error);
    }
  }, [tempMaciKeypair, tempStateIndex, subgraphUrl]);

  const onJoinPoll = useCallback(
    async (signupData: string = DEFAULT_SG_DATA): Promise<boolean> => {
      console.log('onJoinPoll: start', {
        signer: !!signer,
        isConnected,
        poll: !!poll,
        shadowChain,
        chainId,
        tempMaciKeypair: !!tempMaciKeypair,
        tempIsRegistered,
        privoteContractAddress,
        hasJoinedPoll
      });
      setError(undefined);
      setIsLoading(true);

      if (!signer || !isConnected) {
        console.log('onJoinPoll: guard failed - wallet not connected');
        setError('Wallet not connected');
        setIsLoading(false);

        notification.error('Wallet not connected');
        return false;
      }

      if (!poll || !poll.pollId) {
        console.log('onJoinPoll: guard failed - poll not found', { poll });
        setIsLoading(false);

        notification.error('Poll not found');
        return false;
      }

      if (shadowChain !== chainId) {
        console.log('onJoinPoll: chain mismatch, switching', { shadowChain, chainId });
        const switchSuccess = await handleChainSwitch(shadowChain);
        if (!switchSuccess) {
          console.log('onJoinPoll: guard failed - chain switch failed');
          setIsLoading(false);
          return false;
        }
      }

      if (!tempMaciKeypair) {
        console.log('onJoinPoll: guard failed - no keypair');
        setError('Keypair not found');
        setIsLoading(false);

        notification.error('Keypair not found');
        return false;
      }
      if (!tempIsRegistered) {
        console.log('onJoinPoll: guard failed - not registered with MACI');
        setError('User not registered');
        setIsLoading(false);

        notification.error('User not registered');
        return false;
      }
      if (!privoteContractAddress) {
        console.log('onJoinPoll: guard failed - no privote contract address');
        setError('Privote contract not found');
        setIsLoading(false);

        notification.error('Privote contract not found! Connect to a supported chain');
        return false;
      }

      if (hasJoinedPoll) {
        console.log('onJoinPoll: guard failed - already joined poll');
        setError('Already joined poll');
        setIsLoading(false);

        notification.error('Already joined poll');
        return false;
      }

      if (checkBalance()) {
        console.log('onJoinPoll: guard failed - balance check');
        setIsLoading(false);
        return false;
      }

      let notificationId = notification.loading('Loading Artifacts...');
      console.log('onJoinPoll: all guards passed, loading artifacts', { hasArtifacts: !!artifacts });

      const artifactsInternal = artifacts ?? (await loadArtifacts());

      if (!artifactsInternal) {
        const errorMsg = artifactsError || 'Failed to load artifacts';
        setError(errorMsg);
        setIsLoading(false);
        handleNotice({
          message: errorMsg,
          type: 'error',
          id: notificationId
        });
        return false;
      }

      notificationId = handleNotice({
        message: 'Joining poll...',
        type: 'loading',
        id: notificationId
      });

      const inclusionProofDirect = inclusionProof ?? (await getInclusionProof());

      let joinedPoll;

      try {
        joinedPoll = await joinPoll({
          maciAddress: privoteContractAddress,
          privateKey: tempMaciKeypair.privateKey.serialize(),
          signer: signer as any,
          pollId: BigInt(poll.pollId),
          inclusionProof: inclusionProofDirect ?? undefined,
          pollJoiningZkey: artifactsInternal.zKey as unknown as string,
          pollJoiningWasm: artifactsInternal.wasm as unknown as string,
          sgDataArg: signupData,
          ivcpDataArg: DEFAULT_IVCP_DATA,
          blocksPerBatch: 1000000,
          useLatestStateIndex: true
        });

        setHasJoinedPoll(true);
        setInitialVoiceCredits(Number(joinedPoll.voiceCredits));
        setPollStateIndex(joinedPoll.pollStateIndex);

        setIsLoading(false);
        handleNotice({
          message: 'Joined the poll',
          type: 'success',
          id: notificationId
        });
        return true;
      } catch (error) {
        console.error('Join poll error:', error);

        // Check for balance too low error
        if (isBalanceTooLowError(error)) {
          setError('Address balance is too low to join the poll');
          setIsLoading(false);
          handleNotice({
            message: 'Address balance is too low to join the poll',
            type: 'error',
            id: notificationId
          });
          return false;
        }

        // Check if error is related to eth_getLogs
        if (isEthGetLogsError(error)) {
          console.log('Detected eth_getLogs error in joinPoll, attempting fallback to subgraph...');

          // Wait for subgraph to index the transaction (3 blocks for safety)
          const subgraphWaitTime = blockTime * SUBGRAPH_INDEXING_BLOCKS;
          console.log(`Waiting ${subgraphWaitTime}ms (${SUBGRAPH_INDEXING_BLOCKS} blocks) for subgraph indexing...`);
          await new Promise(resolve => setTimeout(resolve, subgraphWaitTime));

          // Attempt to fetch poll user data from subgraph with retries
          const subgraphResult = await retryWithBackoff(
            async () => {
              const result = await getJoinedUserData(subgraphUrl, pollAddress, tempMaciKeypair);

              // Only return if user has actually joined
              if (!result.isJoined) {
                throw new Error('User not found in poll via subgraph');
              }

              return result;
            },
            RETRY_ATTEMPTS,
            blockTime
          );

          if (subgraphResult?.isJoined) {
            console.log('Successfully retrieved poll join data from subgraph');

            setHasJoinedPoll(true);
            setInitialVoiceCredits(Number(subgraphResult.voiceCredits ?? 0));
            setPollStateIndex(subgraphResult.pollStateIndex);

            setIsLoading(false);
            handleNotice({
              message: 'Joined the poll',
              type: 'success',
              id: notificationId
            });
            return true;
          }

          // If subgraph fallback also failed
          console.warn('Join poll transaction may have succeeded but data could not be verified');
          setIsLoading(false);
          handleNotice({
            message: 'Join poll may have succeeded. Please refresh the page to verify.',
            type: 'warning',
            id: notificationId
          });
          return false;
        } else {
          // Handle other types of errors
          setError('Error joining poll');
          setIsLoading(false);
          handleNotice({
            message: 'Error joining poll',
            type: 'error',
            id: notificationId
          });
          return false;
        }
      }
    },
    [
      artifacts,
      hasJoinedPoll,
      inclusionProof,
      tempIsRegistered,
      tempMaciKeypair,
      signer,
      poll,
      getInclusionProof,
      privoteContractAddress,
      loadArtifacts,
      artifactsError,
      checkBalance,
      handleChainSwitch,
      chainId,
      blockTime,
      subgraphUrl,
      pollAddress
    ]
  );

  const updatePortoStatus = useCallback((isRegistered: boolean, stateIndex: string | undefined) => {
    setPortoIsRegistered(isRegistered);
    setPortoMaciStateIndex(stateIndex);
  }, []);

  const onSignup = useCallback(async () => {
    console.log('=== onSignup called ===');
    console.log('Debug - Connection state:', { isConnected, address, chainId, signer: !!signer, poll: !!poll });

    setError(undefined);
    setIsSignupLoading(true);

    if (!isConnected) {
      setError('Wallet not connected');
      setIsSignupLoading(false);

      notification.error('Wallet not connected');
      return;
    }

    if (!poll) {
      setError('Poll not found');
      setIsSignupLoading(false);
      notification.error('Poll not found! Please refresh the page');
      return;
    }

    if (!signer) {
      setError('Signer not found. Please try reconnecting your wallet');
      setIsSignupLoading(false);
      notification.error('Signer not found. Please try reconnecting your wallet');
      return;
    }

    if (isPorto && !poll) {
      setError('Poll not found');
      setIsSignupLoading(false);

      notification.error('Poll not found! Please refresh the page');
      return;
    }

    if (shadowChain !== chainId) {
      const switchSuccess = await handleChainSwitch(shadowChain);
      if (!switchSuccess) {
        setIsSignupLoading(false);
        return;
      }
    }

    if (!privoteContractAddress) {
      setError('Privote contract not found');
      setIsSignupLoading(false);

      notification.error('Privote contract not found! Connect to a supported chain');
      return;
    }

    if (tempIsRegistered) {
      setError('Already registered');
      setIsSignupLoading(false);

      notification.error('Already registered');
      return;
    }

    if (checkBalance()) {
      setIsSignupLoading(false);
      return;
    }

    let keypair = tempMaciKeypair;
    if (!keypair) {
      try {
        keypair = isPorto
          ? ((await generateKeypairForPorto(pollAddress, poll?.endDate)) as Keypair)
          : ((await generateKeypair()) as Keypair);
      } catch (error) {
        setError('Error creating keypair');
        setIsSignupLoading(false);

        notification.error('Error creating keypair');
        console.log('Error creating keypair:', error);
        return;
      }
    }

    let notificationId = notification.loading('Checking if user is registered...');

    let isUserRegistered = false;
    try {
      const { isRegistered: _isRegistered, stateIndex: _stateIndex } = await getSignedupUserData(subgraphUrl, keypair);

      isUserRegistered = _isRegistered;
      if (isPorto) {
        updatePortoStatus(_isRegistered, _stateIndex);
      } else {
        updateStatus(_isRegistered, _stateIndex);
      }
    } catch (error) {
      setError('Error checking if user is registered');
      setIsSignupLoading(false);

      handleNotice({
        message: 'Error checking if user is registered',
        type: 'error',
        id: notificationId
      });
      console.log('Error checking if user is registered:', error);
      return;
    }

    if (isUserRegistered) {
      setIsSignupLoading(false);
      handleNotice({
        message: "You're already signed up to MACI contract",
        type: 'success',
        id: notificationId
      });
      return;
    }

    notificationId = handleNotice({
      message: 'Signing up...',
      type: 'loading',
      id: notificationId
    });
    try {
      const { stateIndex: _stateIndex } = await signup({
        maciAddress: privoteContractAddress,
        maciPublicKey: keypair.publicKey.serialize() as string,
        sgData: DEFAULT_SG_DATA,
        signer: signer as any
      });
      if (isPorto) {
        updatePortoStatus(true, _stateIndex);
      } else {
        updateStatus(true, _stateIndex);
      }
      setIsSignupLoading(false);
      notificationId = handleNotice({
        message: 'Signed up to PRIVOTE contract',
        type: 'success',
        id: notificationId
      });
    } catch (error) {
      console.error('Signup error:', error);

      // Check if error is related to eth_getLogs
      if (isEthGetLogsError(error)) {
        console.log('Detected eth_getLogs error, attempting fallback mechanisms...');

        // Wait for at least one block to be mined before attempting fallback
        console.log(`Waiting ${blockTime}ms (1 block) before fetching...`);
        await new Promise(resolve => setTimeout(resolve, blockTime));

        // Attempt 1: Try fetching state index from on-chain with retries
        const onChainResult = await retryWithBackoff(
          async () => {
            const result = await getSignedupUserDataOnChain({
              maciAddress: privoteContractAddress,
              maciPublicKey: keypair.publicKey.serialize() as string,
              signer: signer as any
            });

            // Only return if we got a valid state index
            if (!result.stateIndex) {
              throw new Error('State index not found in on-chain data');
            }

            return result;
          },
          RETRY_ATTEMPTS,
          blockTime
        );

        if (onChainResult?.stateIndex) {
          console.log('Successfully retrieved state index from on-chain');

          if (isPorto) {
            updatePortoStatus(true, onChainResult.stateIndex);
          } else {
            updateStatus(true, onChainResult.stateIndex);
          }

          setIsSignupLoading(false);
          handleNotice({
            message: 'Signed up to PRIVOTE contract',
            type: 'success',
            id: notificationId
          });
          return;
        }

        // Attempt 2: Fallback to subgraph after on-chain retries fail
        console.log('On-chain fetch failed, falling back to subgraph...');

        try {
          // Wait for subgraph to index the transaction (2 blocks for safety)
          const subgraphWaitTime = blockTime * SIGNUP_SUBGRAPH_WAIT_BLOCKS;
          console.log(`Waiting ${subgraphWaitTime}ms (${SIGNUP_SUBGRAPH_WAIT_BLOCKS} blocks) for subgraph indexing...`);
          await new Promise(resolve => setTimeout(resolve, subgraphWaitTime));

          const { isRegistered: _isRegistered, stateIndex: _stateIndex } = await getSignedupUserData(
            subgraphUrl,
            keypair
          );

          if (_isRegistered && _stateIndex) {
            console.log('Successfully retrieved state index from subgraph');

            if (isPorto) {
              updatePortoStatus(true, _stateIndex);
            } else {
              updateStatus(true, _stateIndex);
            }

            setIsSignupLoading(false);
            handleNotice({
              message: 'Signed up to PRIVOTE contract',
              type: 'success',
              id: notificationId
            });
            return;
          }

          // If still not registered in subgraph, show warning
          console.warn('Signup transaction may have succeeded but state index could not be verified');
          setIsSignupLoading(false);
          handleNotice({
            message: 'Signup may have succeeded. Please refresh the page to verify.',
            type: 'warning',
            id: notificationId
          });
        } catch (subgraphError) {
          console.error('Subgraph fallback failed:', subgraphError);
          setError('Error verifying signup status');
          setIsSignupLoading(false);
          handleNotice({
            message: 'Signup status unclear. Please refresh the page to verify.',
            type: 'warning',
            id: notificationId
          });
        }
      } else {
        // Handle other types of errors
        setError('Error signing up');
        setIsSignupLoading(false);
        handleNotice({
          message: 'Error signing up',
          type: 'error',
          id: notificationId
        });
      }
    }
  }, [
    isConnected,
    tempIsRegistered,
    tempMaciKeypair,
    poll,
    signer,
    privoteContractAddress,
    generateKeypair,
    subgraphUrl,
    handleChainSwitch,
    chainId,
    checkBalance,
    isPorto,
    pollAddress,
    updateStatus,
    updatePortoStatus,
    blockTime
  ]);

  const checkIsTallied = useCallback(async () => {
    if (!privoteContractAddress || !signer || !poll) {
      return false;
    }

    setIsCheckingTallied(true);
    try {
      const isPollTallied = await isTallied({
        maciAddress: privoteContractAddress,
        pollId: poll.pollId.toString(),
        signer: signer as any
      });
      return isPollTallied;
    } finally {
      setIsCheckingTallied(false);
    }
  }, [privoteContractAddress, signer, poll]);

  const checkMergeStatus = useCallback(async () => {
    if (!client) return false;

    try {
      const hasMerged = await client.readContract({
        address: pollAddress as Hex,
        abi: parseAbi(['function stateMerged() view returns (bool)']),
        functionName: 'stateMerged'
      });
      return hasMerged;
    } catch (error) {
      console.error(error);
      return false;
    }
  }, [client, pollAddress]);

  const savePortoKeypairToLocalStorage = useCallback(
    (keypair: Keypair, address: Hex, pollAddress: string, pollEndDate: string) => {
      if (!address) return;

      const storedKey = `maciKeypair-poll-${pollAddress}-${address}`;
      try {
        const privateKeyHex = keypair.privateKey.serialize();
        const value = {
          privateKey: privateKeyHex,
          timestamp: Number(pollEndDate) * 1000
        };
        window.localStorage.setItem(storedKey, JSON.stringify(value));
      } catch (error) {
        console.error('Error saving keypair to localStorage:', error);
      }
    },
    []
  );

  const generateKeypairForPorto = useCallback(
    async (pollAddress?: string, pollEndDate?: string) => {
      if (!address || !pollAddress || !pollEndDate) {
        console.log('Missing pollAddress or pollEndDate- ByPassing...');
        return;
      }

      if (!isPorto) {
        notification.error('Porto not enabled');
        return;
      }

      try {
        const storageKey = `maciKeypair-poll-${pollAddress}-${address}`;
        const pastKeypair = loadKeypairFromLocalStorage(storageKey);

        if (pastKeypair) {
          setPortoMaciKeypair(pastKeypair);
          return pastKeypair;
        }

        const signature = await signMessageAsync({ message: SIGNATURE_MESSAGE });
        const signatureSeed = keccak256(signature);

        const valid = await client?.verifyMessage({
          address: address,
          message: SIGNATURE_MESSAGE,
          signature
        });

        if (!valid) {
          throw new Error("Couldn't validate signature!");
        }
        const keypair = generateKeypairFromSeed(signatureSeed);
        savePortoKeypairToLocalStorage(keypair, address, pollAddress, pollEndDate);
        setPortoMaciKeypair(keypair);

        return keypair;
      } catch (err) {
        console.log(err);
      }
    },
    [
      address,
      isPorto,
      loadKeypairFromLocalStorage,
      signMessageAsync,
      client,
      savePortoKeypairToLocalStorage,
      setPortoMaciKeypair
    ]
  );

  useEffect(() => {
    if (!address || !isPorto || !poll) {
      setPortoMaciKeypair(null);
      return;
    }

    // Try to load existing keypair from localStorage
    const storageKey = `maciKeypair-poll-${pollAddress}-${address}`;
    const existingKeypair = loadKeypairFromLocalStorage(storageKey);
    if (existingKeypair) {
      setPortoMaciKeypair(existingKeypair);
    } else {
      setPortoMaciKeypair(null);
    }
  }, [address, isPorto, pollAddress, poll]);

  useEffect(() => {
    (async () => {
      if (!isPorto) {
        setPortoIsRegistered(false);
        setPortoMaciStateIndex(undefined);
        return;
      }

      if (!isConnected) {
        setPortoIsRegistered(false);
        return;
      }

      if (!portoMaciKeypair) {
        setPortoIsRegistered(false);
        setPortoMaciStateIndex(undefined);
        return;
      }

      try {
        const { isRegistered: _isRegistered, stateIndex: _stateIndex } = await getSignedupUserData(
          subgraphUrl,
          portoMaciKeypair
        );

        setPortoIsRegistered(_isRegistered);
        setPortoMaciStateIndex(_stateIndex);
      } catch (error) {
        console.log(error);
        setPortoIsRegistered(false);
      }
    })();
  }, [portoMaciKeypair, isConnected, subgraphUrl, isPorto]);

  // // generate maci state tree locally
  useEffect(() => {
    (async () => {
      if (!signer) {
        setInclusionProof(null);
        return;
      }

      if (!tempMaciKeypair) {
        setInclusionProof(null);
        return;
      }

      if (!tempIsRegistered) {
        setInclusionProof(null);
        return;
      }

      try {
        const localInclusionProof = await getInclusionProof();

        setInclusionProof(localInclusionProof ?? null);
      } catch (error) {
        console.log(error);
        setError('Error generating MACI state tree');
        setInclusionProof(null);
      }
    })();
  }, [tempMaciKeypair, tempIsRegistered, tempStateIndex, pollAddress, signer, getInclusionProof]);

  // check poll user data
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsCheckingUserJoinedPoll(true);

      // When prerequisites are missing, stop the check but do NOT reset hasJoinedPoll.
      // This branch fires transiently (e.g. while SigContext re-checks registration),
      // and resetting here would wipe a confirmed join. The address-change effect
      // handles the legitimate reset when the wallet actually switches.
      if (!signer || !tempMaciKeypair || !tempIsRegistered || !pollAddress) {
        if (!cancelled) {
          setIsCheckingUserJoinedPoll(false);
        }
        return;
      }

      try {
        const { isJoined, voiceCredits, pollStateIndex } = await getJoinedUserData(
          subgraphUrl,
          pollAddress,
          tempMaciKeypair
        );

        if (!cancelled) {
          // Never go from true → false: the subgraph may lag behind a recent join tx.
          setHasJoinedPoll(prev => prev || isJoined);
          if (isJoined) {
            setInitialVoiceCredits(Number(voiceCredits));
            setPollStateIndex(pollStateIndex);
          }
        }
      } catch (error) {
        console.log('PollContext: Error checking if user has joined poll:', error);
        if (!cancelled) {
          setError('Error checking if user has joined poll');
        }
      } finally {
        if (!cancelled) {
          setIsCheckingUserJoinedPoll(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tempIsRegistered, tempStateIndex, tempMaciKeypair, pollAddress, signer, subgraphUrl]);

  const value = useMemo<IPollContextType>(
    () => ({
      isJoiningPoll: isLoading,
      error: error,
      poll: poll ? { ...poll, status: dynamicPollStatus || poll.status } : poll,
      isRegistered: hasJoinedPoll,
      maciKeypair: tempMaciKeypair,
      pollLoading,
      isPollError,
      isPorto,
      pollError,
      hasJoinedPoll,
      initialVoiceCredits,
      pollStateIndex,
      tempStateIndex,
      subgraphUrl,
      onJoinPoll,
      onSignup,
      refetchPoll,
      checkMergeStatus,
      checkIsTallied,
      dynamicPollStatus,
      isSignupLoading,
      isCheckingTallied,
      isCheckingUserJoinedPoll
    }),
    [
      isLoading,
      error,
      poll,
      dynamicPollStatus,
      tempIsRegistered,
      tempMaciKeypair,
      pollLoading,
      isPollError,
      isPorto,
      pollError,
      hasJoinedPoll,
      initialVoiceCredits,
      pollStateIndex,
      tempStateIndex,
      onJoinPoll,
      onSignup,
      refetchPoll,
      checkMergeStatus,
      checkIsTallied,
      isSignupLoading,
      isCheckingTallied,
      isCheckingUserJoinedPoll
    ]
  );

  return <PollContext.Provider value={value as IPollContextType}>{children}</PollContext.Provider>;
};
