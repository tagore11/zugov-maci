'use client';
import { useState, useMemo } from 'react';
import { SearchFilter, DAOCard, DAO, FilterOptions, DAODetail } from '@/components/DAOs';
import { appConstants } from '@/config/constants';
import { supportedChains } from '@/config/chains';
import styles from './page.module.css';

// Build the DAO list from the real config across all supported chains.
// Each entry in appConstants[chainId].daos becomes a DAO card.
const allDaos: DAO[] = supportedChains.flatMap(chain => {
  const chainConstants = appConstants[chain.id as (typeof supportedChains)[number]['id']];
  if (!chainConstants) return [];
  return Object.entries(chainConstants.daos).map(([key, dao]) => ({
    id: key,
    chainId: chain.id,
    name: dao.displayName ?? key,
    chain: chain.name,
    logo: dao.logoUrl,
    description: dao.description
  }));
});

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDAO, setSelectedDAO] = useState<DAO | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    chain: 'all',
    sortBy: 'participants'
  });

  const filteredDAOs = useMemo(() => {
    let result = [...allDaos];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        dao =>
          dao.name.toLowerCase().includes(query) ||
          dao.chain.toLowerCase().includes(query) ||
          (dao.description ?? '').toLowerCase().includes(query)
      );
    }

    if (filters.chain !== 'all') {
      result = result.filter(dao => dao.chain === filters.chain);
    }

    return result;
  }, [searchQuery, filters]);

  if (selectedDAO) {
    return <DAODetail dao={selectedDAO} onBack={() => setSelectedDAO(null)} />;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Explore Decentralized Governance</h1>
          <p className={styles.heroDescription}>
            Browse voting processes across DAOs and participate in decentralized governance with multiple authentication
            methods.
          </p>
        </div>

        <SearchFilter onSearch={setSearchQuery} onFilterChange={setFilters} />

        <div className={styles.resultsCount}>
          <p>
            Showing {filteredDAOs.length} {filteredDAOs.length === 1 ? 'DAO' : 'DAOs'}
          </p>
        </div>

        <div className={styles.daoGrid}>
          {filteredDAOs.map(dao => (
            <DAOCard key={`${dao.chainId}-${dao.id}`} dao={dao} onClick={setSelectedDAO} />
          ))}
        </div>

        {filteredDAOs.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3 className={styles.emptyTitle}>No DAOs found</h3>
            <p className={styles.emptyDescription}>Try adjusting your search or filters</p>
          </div>
        )}
      </main>
    </div>
  );
}
