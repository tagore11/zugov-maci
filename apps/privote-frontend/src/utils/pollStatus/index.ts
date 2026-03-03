import { PollStatus } from '@/types';
import { notification } from '@/utils/notification';

/**
 * Computes the current poll status based on start and end times
 */
export const computePollStatus = (startDate: string | number, endDate: string | number): PollStatus => {
  const now = Date.now() / 1000;
  const startTime = Number(startDate);
  const endTime = Number(endDate);

  if (now < startTime) {
    return PollStatus.NOT_STARTED;
  } else if (now >= startTime && now < endTime) {
    return PollStatus.OPEN;
  } else {
    return PollStatus.CLOSED;
  }
};

/**
 * Determines if a poll status transition should trigger a notification
 */
export const shouldNotifyStatusChange = (
  previousStatus: PollStatus | null,
  currentStatus: PollStatus | null
): boolean => {
  if (!previousStatus || !currentStatus) return false;

  // Only notify on specific transitions
  const validTransitions = [
    { from: PollStatus.NOT_STARTED, to: PollStatus.OPEN },
    { from: PollStatus.OPEN, to: PollStatus.CLOSED }
  ];

  return validTransitions.some(transition => transition.from === previousStatus && transition.to === currentStatus);
};

/**
 * Shows appropriate notification for poll status transitions
 */
export const notifyStatusChange = (previousStatus: PollStatus, currentStatus: PollStatus): void => {
  if (previousStatus === PollStatus.NOT_STARTED && currentStatus === PollStatus.OPEN) {
    notification.success('🗳️ Poll is now open for voting!');
  } else if (previousStatus === PollStatus.OPEN && currentStatus === PollStatus.CLOSED) {
    notification.info('⏰ Poll has ended. Voting is now closed.');
  }
};

/**
 * Gets user-friendly status text
 */
export const getStatusText = (status: PollStatus): string => {
  switch (status) {
    case PollStatus.NOT_STARTED:
      return 'Not Started';
    case PollStatus.OPEN:
      return 'Open';
    case PollStatus.CLOSED:
      return 'Closed';
    case PollStatus.RESULT_COMPUTED:
      return 'Results Published';
    default:
      return 'Unknown';
  }
};

/**
 * Gets status color for UI elements
 */
export const getStatusColor = (status: PollStatus): string => {
  switch (status) {
    case PollStatus.NOT_STARTED:
      return '#fbbf24'; // yellow
    case PollStatus.OPEN:
      return '#10b981'; // green
    case PollStatus.CLOSED:
      return '#ef4444'; // red
    case PollStatus.RESULT_COMPUTED:
      return '#3b82f6'; // blue
    default:
      return '#6b7280'; // gray
  }
};

/**
 * Formats time remaining until status change
 */
export const formatTimeRemaining = (timeInSeconds: number): string => {
  if (timeInSeconds <= 0) return '00:00:00';

  const days = Math.floor(timeInSeconds / 86400);
  const hours = Math.floor((timeInSeconds % 86400) / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Gets the next status transition time
 */
export const getNextTransitionTime = (
  status: PollStatus,
  startDate: string | number,
  endDate: string | number
): number => {
  const now = Date.now() / 1000;
  const startTime = Number(startDate);
  const endTime = Number(endDate);

  switch (status) {
    case PollStatus.NOT_STARTED:
      return startTime - now;
    case PollStatus.OPEN:
      return endTime - now;
    default:
      return 0;
  }
};

/**
 * Checks if user can perform specific actions based on poll status
 */
export const canPerformAction = (
  action: 'join' | 'vote' | 'publish',
  status: PollStatus,
  userAddress?: string,
  pollOwner?: string,
  hasJoined?: boolean,
  isTallied?: boolean
): boolean => {
  switch (action) {
    case 'join':
      return (status === PollStatus.NOT_STARTED || status === PollStatus.OPEN) && !hasJoined;
    case 'vote':
      return status === PollStatus.OPEN && (hasJoined ?? false);
    case 'publish':
      return (
        status === PollStatus.CLOSED && !(isTallied ?? false) && userAddress?.toLowerCase() === pollOwner?.toLowerCase()
      );
    default:
      return false;
  }
};
