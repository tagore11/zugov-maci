import Image from 'next/image';
import { type CandidateSelectionProps } from '../../types';
import PollOption from '../PollOption';
import styles from './index.module.css';

const CandidateSelection = ({
  candidateSelection,
  handleAddOption,
  handleOptionChange,
  options,
  files,
  onFileChange,
  onFileRemove,
  onRemoveOption
}: CandidateSelectionProps) => {
  return (
    <div className={styles['candidate-box']}>
      <div className={styles['candidate-header']}>
        <h1>Add your Options</h1>
        <div className={styles['candidate-add']}>
          <button type='button' className={styles['add-candidate-btn']} onClick={handleAddOption}>
            <Image src={'/plus-circle.svg'} width={32} height={32} alt='plus circle' />
            Add option
          </button>
        </div>
      </div>

      <div>
        <div className={styles['candidates-list']}>
          {options.map((option, index) => (
            <PollOption
              key={index}
              option={option}
              index={index}
              file={files?.[index] || null}
              onOptionChange={handleOptionChange}
              onFileChange={onFileChange}
              onFileRemove={onFileRemove}
              onRemoveOption={onRemoveOption}
              candidateSelection={candidateSelection}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateSelection;
