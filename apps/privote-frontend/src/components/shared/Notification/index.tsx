import React from 'react';
import { Toast, ToastPosition, toast } from 'react-hot-toast';
import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiMiniExclamationCircle,
  HiXMark
} from 'react-icons/hi2';
import styles from './index.module.css';

type NotificationProps = {
  content: React.ReactNode;
  status: 'success' | 'info' | 'loading' | 'error' | 'warning';
  duration?: number;
  icon?: string;
  position?: ToastPosition;
};

const ENUM_STATUSES = {
  success: <HiCheckCircle size={22} className={styles.successIcon} />,
  loading: <span className={`spinner ${styles.loadingIcon}`}></span>,
  error: <HiMiniExclamationCircle size={22} className={styles.errorIcon} />,
  info: <HiInformationCircle size={22} className={styles.infoIcon} />,
  warning: <HiExclamationTriangle size={22} className={styles.warningIcon} />
};

const DEFAULT_DURATION = 3000;
const DEFAULT_POSITION: ToastPosition = 'top-center';

/**
 * Custom Notification
 */
const Notification = ({
  content,
  status,
  duration = DEFAULT_DURATION,
  icon,
  position = DEFAULT_POSITION
}: NotificationProps) => {
  return toast.custom(
    (t: Toast) => (
      <div
        className={`${styles.notificationContainer} ${
          position.substring(0, 3) === 'top'
            ? `${styles.topPositionHover} ${t.visible ? styles.topPosition : styles.topPositionHidden}`
            : `${styles.bottomPositionHover} ${t.visible ? styles.bottomPosition : styles.bottomPositionHidden}`
        }`}
      >
        <div className={styles.iconContainer}>{icon ? icon : ENUM_STATUSES[status]}</div>
        <div className={`${styles.contentContainer} ${icon ? styles.contentWithIcon : ''}`}>{content}</div>

        <div
          className={`${styles.closeButton} ${icon ? styles.closeButtonWithIcon : ''}`}
          onClick={() => toast.dismiss(t.id)}
        >
          <HiXMark className={styles.closeIcon} size={22} onClick={() => toast.remove(t.id)} />
        </div>
      </div>
    ),
    {
      duration: status === 'loading' ? Infinity : duration,
      position
    }
  );
};

export default Notification;
