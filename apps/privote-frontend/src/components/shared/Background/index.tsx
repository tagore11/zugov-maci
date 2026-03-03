import styles from './index.module.css';

const Background = () => {
  return (
    <div className={styles['bg-wrapper']}>
      <div className={styles['grid-wrapper']}>
        <div className={styles['grid-1']}></div>
        <div className={styles['grid-2']}></div>
        <div className={styles['grid-3']}></div>
        <div className={styles['grid-4']}></div>
      </div>
      <div className={styles['color-wrapper']}>
        <div className={styles['top-color']}></div>
        <div className={styles['bottom-color']}></div>
      </div>
    </div>
  );
};

export default Background;
