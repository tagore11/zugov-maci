'use client';
import styles from './index.module.css';

interface IEmptyState {
  title: string;
  description: string;
}

const EmptyState: React.FC<IEmptyState> = ({ title, description }) => {
  return (
    <div className={styles['empty-state']}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default EmptyState;
