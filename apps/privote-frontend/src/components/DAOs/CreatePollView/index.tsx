'use client';
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Calendar, Users, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Proposal } from '../ProposalCard';
import styles from './index.module.css';

interface CreatePollViewProps {
  daoName: string;
  onBack: () => void;
  onCreate: (poll: Omit<Proposal, 'id'>) => void;
}

const CreatePollView: React.FC<CreatePollViewProps> = ({ daoName, onBack, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'onchain' as 'onchain' | 'offchain',
    visibility: 'public' as 'public' | 'private',
    startDate: '',
    endDate: '',
    quorum: '100000',
    votingOptions: ['Option 1', 'Option 2']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Proposal title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.description.length < 100) {
      newErrors.description = 'Description must be at least 100 characters';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.quorum || parseInt(formData.quorum) <= 0) {
      newErrors.quorum = 'Quorum must be greater than 0';
    }

    if (formData.votingOptions.length < 2) {
      newErrors.votingOptions = 'At least 2 voting options are required';
    }

    const hasEmptyOption = formData.votingOptions.some(option => !option.trim());
    if (hasEmptyOption) {
      newErrors.votingOptions = 'All voting options must have content';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const poll: Omit<Proposal, 'id'> = {
      title: formData.title,
      description: formData.description,
      status: 'pending',
      type: formData.type,
      visibility: formData.visibility,
      startDate: new Date(formData.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      endDate: new Date(formData.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      quorum: parseInt(formData.quorum),
      currentQuorum: 0,
      isEligible: true,
      eligibilityReason: '',
      hasVoted: false,
      votingPower: '1,250 tokens'
    };

    onCreate(poll);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addVotingOption = () => {
    setFormData(prev => ({
      ...prev,
      votingOptions: [...prev.votingOptions, `Option ${prev.votingOptions.length + 1}`]
    }));
  };

  const removeVotingOption = (index: number) => {
    if (formData.votingOptions.length > 2) {
      setFormData(prev => ({
        ...prev,
        votingOptions: prev.votingOptions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateVotingOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      votingOptions: prev.votingOptions.map((option, i) => (i === index ? value : option))
    }));
  };

  // Set default dates
  React.useEffect(() => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    setFormData(prev => ({
      ...prev,
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0]
    }));
  }, []);

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button onClick={onBack} className={styles.backButton}>
              <ArrowLeft className='w-5 h-5' />
            </button>
            <div>
              <h2 className={styles.title}>Create Proposal</h2>
              <p className={styles.subtitle}>Create a new proposal for {daoName}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Basic Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Proposal Details</h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Proposal Title *</label>
              <input
                type='text'
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                className={`${styles.input} ${errors.title ? styles.error : ''}`}
                placeholder='Enter a clear, concise title for your proposal'
              />
              {errors.title && <span className={styles.errorText}>{errors.title}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description *</label>
              <textarea
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                className={`${styles.textarea} ${errors.description ? styles.error : ''}`}
                placeholder='Provide a detailed description of your proposal, including background, objectives, and expected outcomes...'
                rows={6}
              />
              {errors.description && <span className={styles.errorText}>{errors.description}</span>}
              <p className={styles.helpText}>
                Minimum 100 characters. Be comprehensive to help members make informed decisions.
              </p>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Proposal Type</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type='radio'
                      name='type'
                      value='onchain'
                      checked={formData.type === 'onchain'}
                      onChange={e => handleInputChange('type', e.target.value)}
                      className={styles.radio}
                    />
                    <span>On-chain</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type='radio'
                      name='type'
                      value='offchain'
                      checked={formData.type === 'offchain'}
                      onChange={e => handleInputChange('type', e.target.value)}
                      className={styles.radio}
                    />
                    <span>Off-chain</span>
                  </label>
                </div>
                <p className={styles.helpText}>
                  On-chain proposals execute automatically, off-chain require manual implementation
                </p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Visibility</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type='radio'
                      name='visibility'
                      value='public'
                      checked={formData.visibility === 'public'}
                      onChange={e => handleInputChange('visibility', e.target.value)}
                      className={styles.radio}
                    />
                    <Globe className='w-4 h-4' />
                    <span>Public</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type='radio'
                      name='visibility'
                      value='private'
                      checked={formData.visibility === 'private'}
                      onChange={e => handleInputChange('visibility', e.target.value)}
                      className={styles.radio}
                    />
                    <Lock className='w-4 h-4' />
                    <span>Private</span>
                  </label>
                </div>
                <p className={styles.helpText}>Private proposals are only visible to eligible members</p>
              </div>
            </div>
          </div>

          {/* Voting Settings */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Voting Settings</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Start Date *</label>
                <div className={styles.inputWithIcon}>
                  <Calendar className={styles.inputIcon} />
                  <input
                    type='date'
                    value={formData.startDate}
                    onChange={e => handleInputChange('startDate', e.target.value)}
                    className={`${styles.input} ${errors.startDate ? styles.error : ''}`}
                  />
                </div>
                {errors.startDate && <span className={styles.errorText}>{errors.startDate}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>End Date *</label>
                <div className={styles.inputWithIcon}>
                  <Calendar className={styles.inputIcon} />
                  <input
                    type='date'
                    value={formData.endDate}
                    onChange={e => handleInputChange('endDate', e.target.value)}
                    className={`${styles.input} ${errors.endDate ? styles.error : ''}`}
                  />
                </div>
                {errors.endDate && <span className={styles.errorText}>{errors.endDate}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Quorum *</label>
              <div className={styles.inputWithIcon}>
                <Users className={styles.inputIcon} />
                <input
                  type='number'
                  value={formData.quorum}
                  onChange={e => handleInputChange('quorum', e.target.value)}
                  className={`${styles.input} ${errors.quorum ? styles.error : ''}`}
                  placeholder='Minimum votes required'
                  min='1'
                />
              </div>
              {errors.quorum && <span className={styles.errorText}>{errors.quorum}</span>}
              <p className={styles.helpText}>Minimum number of votes required for the proposal to be valid</p>
            </div>
          </div>

          {/* Voting Options */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Voting Options</h3>

            <div className={styles.votingOptions}>
              {formData.votingOptions.map((option, index) => (
                <div key={index} className={styles.votingOption}>
                  <input
                    type='text'
                    value={option}
                    onChange={e => updateVotingOption(index, e.target.value)}
                    className={`${styles.input} ${errors.votingOptions ? styles.error : ''}`}
                    placeholder={`Option ${index + 1}`}
                  />
                  {formData.votingOptions.length > 2 && (
                    <button type='button' onClick={() => removeVotingOption(index)} className={styles.removeButton}>
                      <Trash2 className='w-4 h-4' />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {errors.votingOptions && <span className={styles.errorText}>{errors.votingOptions}</span>}

            <Button type='button' variant='outline' onClick={addVotingOption} className={styles.addButton}>
              <Plus className='w-4 h-4' />
              Add Option
            </Button>

            <p className={styles.helpText}>
              Add different options that members can vote for. Minimum 2 options required.
            </p>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <Button type='button' variant='outline' onClick={onBack} className={styles.cancelButton}>
              Cancel
            </Button>
            <Button type='submit' className={styles.submitButton}>
              Create Proposal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollView;
