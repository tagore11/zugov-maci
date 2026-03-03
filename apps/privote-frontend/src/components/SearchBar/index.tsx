'use client';
import { SearchIcon, SendIcon } from '@/assets';
import Image from 'next/image';
import React from 'react';
import styles from './index.module.css';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm, onSearch }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <Image src={SearchIcon} alt='Search' className={styles.searchIcon} />
      <input
        type='text'
        placeholder='Search'
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className={styles.searchInput}
      />
      <button onClick={onSearch} className={styles.sendButton}>
        <Image src={SendIcon} alt='Send' />
      </button>
    </div>
  );
};

export default SearchBar;
