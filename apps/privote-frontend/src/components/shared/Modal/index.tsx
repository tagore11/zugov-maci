'use client';
import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  showCloseButton?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
  padding?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth,
  showCloseButton = true,
  padding = '24px'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} ref={modalRef} style={{ maxWidth, padding }}>
        {(showCloseButton || title) && (
          <div className={styles.modalHeader}>
            {title && <h2>{title}</h2>}
            {showCloseButton && (
              <button className={styles.closeButton} onClick={onClose}>
                <FaTimes />
              </button>
            )}
          </div>
        )}
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
