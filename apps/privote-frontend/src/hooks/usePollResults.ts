import { getResults, type IResult } from '@maci-protocol/sdk/browser';
import { useQuery, type Query } from '@tanstack/react-query';
import useEthersSigner from './useEthersSigner';
import usePollContext from './usePollContext';
import { EMode } from '@/types';
import { DEFAULT_VOICE_CREDITS } from '@/utils/constants';

const usePollResults = () => {
  const { poll, checkIsTallied, dynamicPollStatus } = usePollContext();
  const signer = useEthersSigner();
  const privoteContractAddress = poll?.privoteContractAddress;
  const { pollId, mode } = poll || {};
  const status = dynamicPollStatus || poll?.status;

  return useQuery({
    enabled: !!signer && !!poll && !!privoteContractAddress && status === 'Closed',
    queryKey: [
      'get-poll-results',
      {
        pollId: String(pollId),
        signerAddress: signer?.address,
        privoteContractAddress
      }
    ],
    queryFn: async () => {
      let tallied = false;
      let results: IResult[] | undefined = undefined;

      const voteEndDate = Number(poll?.endDate.toString());
      const voteStartDate = Number(poll?.startDate.toString());
      const now = Math.round(Date.now() / 1000);
      const voteEnded = voteEndDate < now;
      let total: bigint = 0n;

      // fetch results only if the vote has ended
      if (voteEnded && signer && pollId) {
        try {
          tallied = await checkIsTallied();
          if (tallied) {
            results = await getResults({
              maciAddress: privoteContractAddress as string,
              pollId: pollId.toString(),
              signer: signer as any
            });
            if (mode === EMode.FULL) {
              results = results.map(r => ({ ...r, value: r.value / DEFAULT_VOICE_CREDITS }));
            }
            total = results.reduce((acc: bigint, cur: IResult) => acc + cur.value, 0n);
          }
        } catch (error) {
          console.log(error);
        }
      }

      return {
        voteStartDate,
        voteEndDate,
        now,
        voteEnded,
        tallied,
        results,
        total
      };
    },
    refetchOnWindowFocus: true
  });
};

export default usePollResults;
