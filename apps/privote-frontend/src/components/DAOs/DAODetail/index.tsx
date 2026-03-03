import { ArrowLeft, FileText, MessageSquare, Plus, FolderTree } from 'lucide-react';
import { DAO } from '../DAOCard';
import Forum from '../Forum';
import { useState, useEffect } from 'react';
import CreatePollView from '../CreatePollView';
import { Button } from '@/components/ui/button';
import { PollProvider } from '@/contexts/PollContext';
import { VotingSection } from '@/components/Poll/VotingSection';
import usePolls from '@/hooks/usePolls';
import useAppConstants from '@/hooks/useAppConstants';
import { LoadingPulse } from '@/components/shared';
import { getSubgraphUrl } from '@/utils/subgraphUrl';
import styles from './index.module.css';

interface DAODetailProps {
  dao: DAO;
  onBack: () => void;
  onCreatePoll?: (poll: any) => void;
}

export function DAODetail({ dao, onBack, onCreatePoll }: DAODetailProps) {
  const { daos, slugs, updateChain, updateActiveDao } = useAppConstants();

  // Switch the app context to this DAO's chain and active DAO key so contract calls
  // and subgraph queries use the correct network and deployment.
  useEffect(() => {
    updateChain(dao.chainId);
    updateActiveDao(dao.id);
  }, [dao.chainId, dao.id]);

  const daoSubgraphUrl = getSubgraphUrl(dao.id, daos, slugs);

  const { data, isLoading, isError, refetch } = usePolls({
    subgraphUrl: daoSubgraphUrl || '',
    limit: 20
  });

  const polls = data?.pages?.flat() || [];

  const [activeTab, setActiveTab] = useState<'proposals' | 'forum' | 'subdaos'>('proposals');
  const [showCreatePoll, setShowCreatePoll] = useState(false);

  const handleCreatePoll = (poll: any) => {
    onCreatePoll?.(poll);
    setShowCreatePoll(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft className='w-5 h-5' />
          Back to Explore
        </button>

        {/* DAO Header */}
        <div className={styles.daoHeader}>
          <div className={styles.headerContent}>
            <div className={styles.logoContainer}>
              {dao.logo ? (
                <img src={dao.logo} alt={dao.name} className={styles.logo} />
              ) : (
                <span className={styles.logoPlaceholder}>{dao.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className={styles.daoInfo}>
              <div className={styles.titleSection}>
                <h1 className={styles.daoName}>{dao.name}</h1>
                <span className={styles.chainBadge}>{dao.chain}</span>
              </div>
              {dao.description && <p className={styles.description}>{dao.description}</p>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <div className={styles.tabList}>
            <button
              onClick={() => setActiveTab('proposals')}
              className={`${styles.tab} ${activeTab === 'proposals' ? styles.active : ''}`}
            >
              <FileText className='w-5 h-5' />
              <span className={styles.tabLabel}>Proposals</span>
              <span className={styles.tabBadge}>{polls.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('forum')}
              className={`${styles.tab} ${activeTab === 'forum' ? styles.active : ''}`}
            >
              <MessageSquare className='w-5 h-5' />
              <span className={styles.tabLabel}>Forum</span>
            </button>
            <button
              onClick={() => setActiveTab('subdaos')}
              className={`${styles.tab} ${activeTab === 'subdaos' ? styles.active : ''}`}
            >
              <FolderTree className='w-5 h-5' />
              <span className={styles.tabLabel}>SubDAOs</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'proposals' ? (
            <>
              <div className={styles.sectionHeader}>
                <p className={styles.sectionDescription}>Browse all proposals and cast your votes.</p>
                {onCreatePoll && (
                  <Button onClick={() => setShowCreatePoll(true)} className={styles.createButton}>
                    <Plus className='w-4 h-4' />
                    Create Poll
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className={styles.loadingContainer}>
                  <LoadingPulse size='medium' text='Loading polls...' variant='primary' />
                </div>
              ) : isError ? (
                <div className={styles.errorContainer}>
                  <p>Error loading polls. Please try again.</p>
                  <Button onClick={() => refetch()}>Retry</Button>
                </div>
              ) : polls.length === 0 ? (
                <div className={styles.emptyState}>
                  <FileText className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>No proposals yet</h3>
                  <p className={styles.emptyDescription}>This DAO has no active polls.</p>
                </div>
              ) : (
                <div className={styles.proposalsGrid}>
                  {polls.map((poll: any) => (
                    <PollProvider key={poll.id} pollAddress={poll.id} daoName={dao.id}>
                      <div className={styles.pollCard}>
                        <VotingSection pollAddress={poll.id} />
                      </div>
                    </PollProvider>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'forum' ? (
            <Forum daoName={dao.name} proposals={[]} />
          ) : (
            <div className={styles.emptyState}>
              <FolderTree className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>No SubDAOs yet</h3>
              <p className={styles.emptyDescription}>SubDAO support is coming soon.</p>
            </div>
          )}
        </div>
      </div>

      {showCreatePoll && onCreatePoll && (
        <CreatePollView daoName={dao.name} onBack={() => setShowCreatePoll(false)} onCreate={handleCreatePoll} />
      )}
    </div>
  );
}

export default DAODetail;
