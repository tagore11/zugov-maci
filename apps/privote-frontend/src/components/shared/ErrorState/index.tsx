'use client';
import Button from '../Button';
import styles from './index.module.css';

interface IErrorState {
  title: string;
  retryAction: () => void;
  error?: Error | null;
}

const ErrorState: React.FC<IErrorState> = ({ title, error, retryAction }) => {
  return (
    <div className={styles['error-state']}>
      <h3>{title}</h3>
      {error && <p>{error.message}</p>}
      {retryAction && (
        <Button className={styles['retry-btn']} action={retryAction}>
          Retry
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
