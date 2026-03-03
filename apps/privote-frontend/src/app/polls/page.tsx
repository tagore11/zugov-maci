'use client';
import { PollsList } from '@/components/Polls';
import SearchBar from '@/components/SearchBar';
import styles from '@/styles/home.module.css';
import React, { useState } from 'react';

const AllPolls: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const handleSearch = () => {
    setActiveSearch(searchTerm);
  };

  return (
    <div className={styles.container}>
      <div className={styles['poll-wrapper']}>
        <div className={styles['polls-container']}>
          <h2>Polls</h2>
          <div className={styles['search-poll-container']}>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} />
            <PollsList searchTerm={activeSearch} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllPolls;
