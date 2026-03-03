import { Notification } from '@/components/shared';
import React from 'react';
import { ToastPosition, toast } from 'react-hot-toast';

type NotificationOptions = {
  duration?: number;
  icon?: string;
  position?: ToastPosition;
};

export const notification = {
  success: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: 'success', ...options });
  },
  info: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: 'info', ...options });
  },
  warning: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: 'warning', ...options });
  },
  error: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: 'error', ...options });
  },
  loading: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: 'loading', ...options });
  },
  remove: (toastId: string) => {
    toast.remove(toastId);
  }
};

export const handleNotice = ({
  message,
  type,
  id
}: {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  id?: string;
}) => {
  if (id) notification.remove(id);
  return notification[type](message);
};
