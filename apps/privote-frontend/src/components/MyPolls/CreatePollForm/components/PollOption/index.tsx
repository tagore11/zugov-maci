import { IoMdClose } from 'react-icons/io';
import { type PollOptionProps } from '../../types';
import WithImageInput from '../WithImageInput';
import styles from './index.module.css';

const PollOption = ({
  option,
  index,
  file,
  onOptionChange,
  onFileChange,
  onFileRemove,
  onRemoveOption
}: PollOptionProps) => {
  return (
    <div className={styles['candidate-input']}>
      <div className={styles['option-fields']}>
        <div className={styles['image-option']}>
          <WithImageInput
            required
            index={index}
            type='text'
            option={option}
            file={file}
            onChange={(e, field) => onOptionChange(index, e.target.value, field)}
            onFileRemove={() => onFileRemove(index)}
            onFileChange={e => {
              const file = e.target.files?.[0];
              if (file) onFileChange(index, file);
            }}
          />
        </div>
      </div>
      {index > 0 && (
        <button type='button' onClick={() => onRemoveOption(index)} className={styles['remove-option-btn']}>
          <IoMdClose size={20} />
        </button>
      )}
    </div>
  );
};

export default PollOption;
