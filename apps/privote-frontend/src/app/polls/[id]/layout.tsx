import { appConstants } from '@/config/constants';
import { supportedChains } from '@/config/chains';
import { getSubgraphUrl } from '@/utils/subgraphUrl';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

async function getPollData(pollId: string) {
  const GET_POLL_QUERY = `
    query GetPoll($id: Bytes!) {
      poll(id: $id) {
        id
        name
        description
      }
    }
  `;

  for (const chain of supportedChains) {
    const chainConstants = appConstants[chain.id];
    const daoKeys = Object.keys(chainConstants.daos);
    const defaultDaoName = daoKeys[0];
    const subgraphUrl = getSubgraphUrl(defaultDaoName, chainConstants.daos, chainConstants.slugs);

    if (!subgraphUrl) continue;

    try {
      const response = await fetch(subgraphUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GET_POLL_QUERY,
          variables: { id: pollId }
        })
      });

      const { data } = await response.json();
      if (data?.poll) return data.poll;
    } catch (e) {
      continue;
    }
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const poll = await getPollData(id);

  if (!poll) {
    return {
      title: 'Poll Details'
    };
  }

  const description = poll.description || `Vote on "${poll.name}" - Private, secure, and verifiable voting on Privote.`;

  return {
    title: poll.name,
    description,
    openGraph: {
      title: poll.name,
      description,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: poll.name,
      description
    }
  };
}

export default function PollLayout({ children }: Props) {
  return <>{children}</>;
}
