import useAppConstants from '@/hooks/useAppConstants';
import useFaucetContext from '@/hooks/useFaucetContext';
import usePrivoteContract from '@/hooks/usePrivoteContract';
import { PollPolicyType, PollType } from '@/types';
import { DEFAULT_VOICE_CREDITS, ONE_HOUR_MS, ONE_MINUTE_MS, PUBLIC_COORDINATOR_SERVICE_URL } from '@/utils/constants';
import { makeCoordinatorServicePostRequest } from '@/utils/coordinator';
import { getWrapperFunctionName } from '@/utils/getWrapperFunctionName';
import { uploadFileToLighthouse } from '@/utils/lighthouse';
import { handleNotice, notification } from '@/utils/notification';
import { encodeOptionInfo } from '@/utils/optionInfo';
import { Keypair } from '@maci-protocol/domainobjs';
import { CID } from 'multiformats';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { Abi, Hex } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import type { IPollData, PolicyConfigType } from '../types';
import { getCoordinatorPollArgs, getPollArgs } from './utils';
import { validatePollForm, getFirstErrorMessage } from '@/utils/pollValidation';

const initialPollData: IPollData = {
  title: '',
  description: '',
  startTime: new Date(Date.now() + 10 * ONE_MINUTE_MS),
  endTime: new Date(Date.now() + ONE_HOUR_MS + 10 * ONE_MINUTE_MS),
  maxVotePerPerson: DEFAULT_VOICE_CREDITS,
  pollType: PollType.NOT_SELECTED,
  mode: null,
  options: [
    {
      title: '',
      description: '',
      cid: '0x' as `0x${string}`,
      link: '',
      isUploadedToIPFS: false
    },
    {
      title: '',
      description: '',
      cid: '0x' as `0x${string}`,
      link: '',
      isUploadedToIPFS: false
    }
  ],
  keyPair: new Keypair(),
  publicKey: '',
  policyType: PollPolicyType.FreeForAll,
  policyConfig: {}
};

interface PollFormContextType {
  pollData: IPollData;
  setPollData: React.Dispatch<React.SetStateAction<IPollData>>;
  files: (File | null)[] | null;
  isLoading: boolean;
  pollConfig: number;
  setPollConfig: React.Dispatch<React.SetStateAction<number>>;
  candidateSelection: 'none' | 'withImage' | 'withoutImage';
  setCandidateSelection: React.Dispatch<React.SetStateAction<'none' | 'withImage' | 'withoutImage'>>;
  handleOptionChange: (index: number, value: string, field: 'value' | 'title' | 'description' | 'link') => void;
  handleFileChange: (index: number, file: File) => void;
  handleFileRemove: (index: number) => void;
  handleAddOption: () => void;
  handleRemoveOption: (index: number) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handlePolicyConfigChange: (config: PolicyConfigType) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handlePolicyTypeChange: (e: React.ChangeEvent<any>) => void;
}

const PollFormContext = createContext<PollFormContextType | undefined>(undefined);

export const PollFormProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [pollData, setPollData] = useState<IPollData>(initialPollData);
  const [files, setFiles] = useState<(File | null)[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [candidateSelection, setCandidateSelection] = useState<'none' | 'withImage' | 'withoutImage'>('none');
  const [pollConfig, setPollConfig] = useState(2);

  const { slugs } = useAppConstants();
  const { checkBalance } = useFaucetContext();
  const { writeContractAsync } = useWriteContract();
  const privoteContract = usePrivoteContract();
  const [txState, setTxState] = useState<{ hash: `0x${string}`; notificationId: string }>();

  const {
    isSuccess: isConfirmed,
    error: confirmError,
    data: receipt
  } = useWaitForTransactionReceipt({
    hash: txState?.hash,
    query: {
      enabled: !!txState?.hash
    }
  });

  useEffect(() => {
    if (!txState?.hash) return;
    if (isConfirmed && receipt) {
      handleNotice({
        message: 'Poll created successfully!',
        type: 'success',
        id: txState?.notificationId
      });
      router.push('/polls');
      setIsLoading(false);
    } else if (confirmError) {
      handleNotice({
        message: 'Poll creation failed!',
        type: 'error',
        id: txState?.notificationId
      });
      setIsLoading(false);
    }
  }, [isConfirmed, confirmError, receipt, txState, router]);

  const validateForm = (): boolean => {
    const validationResult = validatePollForm(pollData, pollConfig);

    if (!validationResult.isValid) {
      const errorMessage = getFirstErrorMessage(validationResult.errors);
      console.log('Validation failed:', errorMessage);
      notification.error(errorMessage);
      return false;
    }

    return true;
  };

  const handleOptionChange = (index: number, value: string, field: string) => {
    setPollData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    }));
  };

  const handleFileChange = (index: number, file: File) => {
    setFiles(prev => {
      const newFiles = prev ? [...prev] : [];
      newFiles[index] = file;
      return newFiles;
    });
  };

  const handleFileRemove = (index: number) => {
    setFiles(prev => {
      const newFiles = prev ? [...prev] : [];
      newFiles[index] = null;
      return newFiles;
    });
  };

  const handlePolicyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // When changing policy type, reset the policy config to prevent invalid configs
    setPollData(prev => ({
      ...prev,
      policyType: e.target.value as PollPolicyType,
      policyConfig: {} // Reset policy config when changing policy type
    }));
  };

  const handlePolicyConfigChange = useCallback(
    (config: PolicyConfigType) => {
      setPollData(prev => ({
        ...prev,
        policyConfig: {
          ...prev.policyConfig,
          ...config
        }
      }));
    },
    [setPollData]
  );

  const handleAddOption = () => {
    setPollData(prev => ({
      ...prev,
      options: [...prev.options, { value: '', cid: '0x' as `0x${string}`, isUploadedToIPFS: false }]
    }));
  };

  const handleRemoveOption = (index: number) => {
    setPollData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
    setFiles(prev => {
      if (!prev) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePollCreationUsingWrapper = async (
    finalPollData: IPollData,
    encodedOptions: Hex[],
    startTime: bigint,
    endTime: bigint,
    abi: Abi,
    contractAddress: Hex,
    notificationId?: string,
    merkleTreeUrl?: string
  ) => {
    // Generate the arguments for the contract call using the utility function
    const args = getPollArgs({
      pollData: finalPollData,
      encodedOptions,
      startTime,
      endTime,
      merkleTreeUrl
    });

    notificationId = handleNotice({
      message: 'Submitting poll creation transaction...',
      type: 'loading',
      id: notificationId
    });

    try {
      const txHash = await writeContractAsync({
        abi: abi,
        address: contractAddress,
        functionName: getWrapperFunctionName(finalPollData.policyType),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: args as any
      });

      notificationId = handleNotice({
        message: 'Waiting for transaction confirmation...',
        type: 'loading',
        id: notificationId
      });

      setTxState({
        hash: txHash,
        notificationId
      });
    } catch (error) {
      console.error('Error submitting poll creation transaction:', error);
      notification.remove(notificationId);
      throw error;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePollCreationUsingCoordinator = async (
    finalPollData: IPollData,
    encodedOptions: Hex[],
    startTime: bigint,
    endTime: bigint,
    privoteAddress: Hex,
    notificationId?: string
  ) => {
    const pollCoordinatorArgs = getCoordinatorPollArgs({
      pollData: finalPollData,
      encodedOptions,
      startTime,
      endTime,
      chain: slugs.coordinator,
      privoteAddress
    });

    notificationId = handleNotice({
      message: "Deploying poll using privote's coordinator...",
      type: 'loading',
      id: notificationId
    });
    try {
      const response = await makeCoordinatorServicePostRequest<{ pollId: string }>(
        `${PUBLIC_COORDINATOR_SERVICE_URL}/v1/deploy/poll`,
        JSON.stringify(pollCoordinatorArgs)
      );

      if (response.success) {
        handleNotice({
          message: `Poll with ID ${response.data.pollId} created successfully!`,
          type: 'success',
          id: notificationId
        });
        setIsLoading(false);
        router.push('/polls');
      } else {
        handleNotice({
          message: `Poll creation failed: ${response.error}`,
          type: 'error',
          id: notificationId
        });
        setIsLoading(false);
      }
    } catch (error) {
      notification.remove(notificationId);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (checkBalance()) return;

    if (!privoteContract) {
      notification.error('Please connect to supported chains!');
      return;
    }

    setIsLoading(true);
    let notificationId = '';
    try {
      const cids: `0x${string}`[] = [];

      if (files && files.length > 0) {
        notificationId = notification.loading('Uploading files to IPFS...');
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) {
            cids[i] = '0x';
            continue;
          }
          const data = await uploadFileToLighthouse([file]);
          const cid = CID.parse(data.Hash);
          cids[i] = `0x${Buffer.from(cid.bytes).toString('hex')}`;
        }
      }

      notificationId = handleNotice({
        id: notificationId,
        message: 'preparing to create poll',
        type: 'loading'
      });

      const finalPollData = {
        ...pollData,
        publicKey: pollConfig === 2 ? process.env.NEXT_PUBLIC_COORDINATOR_PUBLIC_KEY! : pollData.publicKey,
        options: pollData.options.map((option, i) => ({
          ...option,
          cid: cids[i] || '0x',
          isUploadedToIPFS: !!cids[i]
        }))
      };

      let merkleTreeUrl: string = '';
      if (pollData.policyType === PollPolicyType.MerkleProof) {
        if (!pollData.policyConfig.merkleTreeData) {
          notification.error('Merkle tree data is required');
          return;
        }
        const merkleTreeUrlResponse = await fetch('/api/json', {
          method: 'POST',
          body: pollData.policyConfig.merkleTreeData
        });
        merkleTreeUrl = await merkleTreeUrlResponse.json();
      }

      const startTime = BigInt(Math.floor(finalPollData.startTime.getTime() / 1000));
      const endTime = finalPollData.endTime ? BigInt(Math.floor(finalPollData.endTime.getTime() / 1000)) : 0n;

      const encodedOptions = await Promise.all(
        finalPollData.options.map(async option => {
          return encodeOptionInfo({
            cid: option.isUploadedToIPFS ? option.cid : ('0x' as `0x${string}`),
            description: option.description ?? '',
            link: option.link ?? ''
          });
        })
      );

      finalPollData.publicKey =
        pollConfig === 2 ? process.env.NEXT_PUBLIC_COORDINATOR_PUBLIC_KEY! : finalPollData.publicKey;
      await handlePollCreationUsingWrapper(
        finalPollData,
        encodedOptions,
        startTime,
        endTime,
        privoteContract.abi,
        privoteContract.address,
        notificationId,
        merkleTreeUrl
      );
    } catch (error) {
      console.error('Error creating poll:', error);
      const errorMessage =
        error instanceof Error && error.message.includes('User rejected')
          ? 'Transaction cancelled by user'
          : 'Failed to create poll. Please try again.';
      handleNotice({
        message: errorMessage,
        type: 'error',
        id: notificationId
      });
      setIsLoading(false);
    }
  };

  const value = {
    pollData,
    setPollData,
    files,
    isLoading,
    pollConfig,
    setPollConfig,
    candidateSelection,
    setCandidateSelection,
    handleOptionChange,
    handleFileChange,
    handleFileRemove,
    handleAddOption,
    handleRemoveOption,
    handleSubmit,
    handlePolicyTypeChange,
    handlePolicyConfigChange
  };

  return <PollFormContext.Provider value={value}>{children}</PollFormContext.Provider>;
};

export const usePollForm = () => {
  const context = useContext(PollFormContext);
  if (context === undefined) {
    throw new Error('usePollForm must be used within a PollFormProvider');
  }
  return context;
};
