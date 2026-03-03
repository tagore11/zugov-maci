import styles from '../index.module.css';

interface WithoutImageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  className?: string;
  name?: string;
}

const WithoutImageInput = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  name = '',
  ...rest
}: WithoutImageInputProps) => {
  return (
    <input
      className={`${styles['img-input']} ${className}`}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      name={name}
      {...rest}
    />
  );
};

export default WithoutImageInput;
