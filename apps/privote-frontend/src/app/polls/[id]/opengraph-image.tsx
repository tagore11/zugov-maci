import { appConstants } from '@/config/constants';
import { supportedChains } from '@/config/chains';
import { getSubgraphUrl } from '@/utils/subgraphUrl';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Poll Details - Privote';
export const size = {
  width: 1200,
  height: 630
};

export const contentType = 'image/png';

const GET_POLL_QUERY = `
  query GetPoll($id: Bytes!) {
    poll(id: $id) {
      id
      name
      pollType
      startDate
      endDate
      options {
        id
        name
      }
    }
  }
`;

// Helper to truncate text
const truncate = (str: string, length: number) => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id: pollId } = await params;

  let pollData = null;

  // Try to find the poll across supported chains
  for (const chain of supportedChains) {
    const chainConstants = appConstants[chain.id];
    const daoKeys = Object.keys(chainConstants.daos);
    const defaultDaoName = daoKeys[0];
    const subgraphUrl = getSubgraphUrl(defaultDaoName, chainConstants.daos, chainConstants.slugs);

    if (!subgraphUrl) continue;

    try {
      const response = await fetch(subgraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: GET_POLL_QUERY,
          variables: { id: pollId }
        })
      });

      const { data } = await response.json();

      if (data?.poll) {
        pollData = data.poll;
        break;
      }
    } catch (e) {
      console.error(`Error fetching from ${chain.name}:`, e);
      continue;
    }
  }

  // Common styles
  const wrapperStyle = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#0a0a0f',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'relative' as const
  };

  const bgGradient = {
    position: 'absolute' as const,
    inset: 0,
    background:
      'radial-gradient(circle at 20% 30%, rgba(127, 88, 183, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(198, 94, 198, 0.15) 0%, transparent 50%)'
  };

  const gridPattern = {
    position: 'absolute' as const,
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
    backgroundSize: '50px 50px'
  };

  if (!pollData) {
    // Fallback for not found
    return new ImageResponse(
      (
        <div style={{ ...wrapperStyle, alignItems: 'center', justifyContent: 'center' }}>
          <div style={bgGradient} />
          <div style={gridPattern} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 10 }}>
            <div
              style={{
                fontSize: 60,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #c65ec6 0%, #7f58b7 100%)',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              PRIVOTE
            </div>
            <div style={{ fontSize: 30, color: '#888' }}>Poll Not Found</div>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const status = Number(pollData.endDate) * 1000 > Date.now() ? 'Active' : 'Ended';
  const statusColor = status === 'Active' ? '#4CAF50' : '#FF5252';

  return new ImageResponse(
    (
      <div style={wrapperStyle}>
        <div style={bgGradient} />
        <div style={gridPattern} />

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '60px', zIndex: 10 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 400,
                  color: '#fff',
                  letterSpacing: '9.473px',
                  display: 'flex',
                  textTransform: 'uppercase'
                }}
              >
                PRI<span style={{ color: '#c45ec6' }}>VOTE</span>
              </div>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '0.15em'
                }}
              >
                Privote.live
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 24px',
                borderRadius: '40px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                gap: '10px'
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: statusColor }} />
              <span style={{ fontSize: 24, fontWeight: 600 }}>{status}</span>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
            <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1, maxWidth: '90%' }}>
              {truncate(pollData.name, 56)}
            </div>
          </div>

          {/* Options Preview - Grid Layout */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              justifyContent: 'center'
            }}
          >
            {pollData.options.slice(0, 5).map((opt: any, i: number) => (
              <div
                key={opt.id}
                style={{
                  display: 'flex',
                  padding: '18px 26px',
                  background: 'linear-gradient(135deg, rgba(127, 88, 183, 0.1) 0%, rgba(198, 94, 198, 0.05) 100%)',
                  border: '1px solid rgba(198, 94, 198, 0.2)',
                  borderRadius: '20px',
                  fontSize: 26,
                  alignItems: 'center',
                  width: 'auto',
                  maxWidth: '48%',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    minWidth: 36,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #7f58b7 0%, #c65ec6 100%)',
                    marginRight: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    color: 'white',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(127, 88, 183, 0.4)'
                  }}
                >
                  {i + 1}
                </div>
                <span
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    color: '#fff',
                    fontWeight: 500
                  }}
                >
                  {truncate(opt.name, 35)}
                </span>
              </div>
            ))}
            {pollData.options.length > 5 && (
              <div
                style={{
                  display: 'flex',
                  padding: '16px 24px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  fontSize: 24,
                  color: '#888',
                  alignItems: 'center'
                }}
              >
                + {pollData.options.length - 5} more
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
