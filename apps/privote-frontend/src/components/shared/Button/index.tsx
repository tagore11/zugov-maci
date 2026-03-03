import styles from './index.module.css';

export default function Button({
  type,
  children,
  action,
  className,
  disabled
}: Readonly<{
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  action: () => void;
  className?: string;
  disabled?: boolean;
}>) {
  return (
    <button className={`${styles.button} ${className}`} type={type} onClick={action} disabled={disabled}>
      {children}
    </button>
  );
}
