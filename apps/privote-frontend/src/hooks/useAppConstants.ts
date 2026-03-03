'use client';
import { AppConstantsContext } from '@/contexts/AppConstantsContext';
import { useContext } from 'react';

const useAppConstants = () => {
  const context = useContext(AppConstantsContext);
  if (!context) {
    throw new Error('useAppConstants must be used within an AppConstantsProvider');
  }
  return context;
};

export default useAppConstants;
