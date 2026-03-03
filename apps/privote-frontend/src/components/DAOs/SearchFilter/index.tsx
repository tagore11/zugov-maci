'use client';
import { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import styles from './index.module.css';

export interface FilterOptions {
  category: string;
  chain: string;
  sortBy: string;
}

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'DeFi', label: 'DeFi' },
  { value: 'Infrastructure', label: 'Infrastructure' },
  { value: 'NFT', label: 'NFT' },
  { value: 'Protocol', label: 'Protocol' },
  { value: 'Social', label: 'Social' }
];

const chains = [
  { value: 'all', label: 'All Chains' },
  { value: 'Ethereum', label: 'Ethereum' },
  { value: 'Arbitrum', label: 'Arbitrum' },
  { value: 'Optimism', label: 'Optimism' }
];

const sortOptions = [
  { value: 'participants', label: 'Most Participants' },
  { value: 'proposals', label: 'Most Proposals' },
  { value: 'treasury', label: 'Treasury Value' },
  { value: 'recent', label: 'Recently Active' }
];

export const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    chain: 'all',
    sortBy: 'participants'
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className={styles.container}>
      {/* Search Bar */}
      <div className={styles.searchBar}>
        <div className={styles.searchInput}>
          <Search className={styles.searchIcon} />
          <input
            type='text'
            placeholder='Search DAOs by name, description, or category...'
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.input}
          />
        </div>
        <button className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
          <Filter className='w-4 h-4' />
          Filters
          <ChevronDown className={`w-4 h-4 ${showFilters ? styles.rotate : ''}`} />
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Category</label>
            <select
              value={filters.category}
              onChange={e => handleFilterChange('category', e.target.value)}
              className={styles.select}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Chain</label>
            <select
              value={filters.chain}
              onChange={e => handleFilterChange('chain', e.target.value)}
              className={styles.select}
            >
              {chains.map(chain => (
                <option key={chain.value} value={chain.value}>
                  {chain.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={e => handleFilterChange('sortBy', e.target.value)}
              className={styles.select}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
