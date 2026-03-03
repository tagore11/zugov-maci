'use client';
import React from 'react';
import styles from './index.module.css';

export interface DAO {
  id: string; // config key (e.g. "default", "zukas")
  chainId: number; // viem chain ID, used for context switching in DAODetail
  name: string; // displayName from config, or id as fallback
  chain: string; // human-readable chain name (e.g. "Scroll Sepolia")
  logo?: string; // logoUrl from config
  description?: string; // description from config
}

interface DAOCardProps {
  dao: DAO;
  onClick: (dao: DAO) => void;
}

const DAOCard: React.FC<DAOCardProps> = ({ dao, onClick }) => {
  return (
    <div className={styles.card} onClick={() => onClick(dao)}>
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          {dao.logo ? (
            <img
              src={dao.logo}
              alt={dao.name}
              className={styles.logo}
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dao.name)}&background=6366f1&color=fff&size=40`;
              }}
            />
          ) : (
            <span className={styles.logoPlaceholder}>{dao.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className={styles.daoInfo}>
          <h3 className={styles.name}>{dao.name}</h3>
          <span className={styles.chain}>{dao.chain}</span>
        </div>
      </div>

      {dao.description && <p className={styles.description}>{dao.description}</p>}
    </div>
  );
};

export default DAOCard;
