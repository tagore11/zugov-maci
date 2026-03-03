'use client';
import React, { useState } from 'react';
import { FaCheck, FaCopy, FaFacebook, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import Modal from '../Modal';
import styles from './ShareModal.module.css';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, description }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(description || 'Check out this poll!');

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
    }

    window.open(shareUrl, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Share Poll'>
      <div className={styles.shareModalContent}>
        <div className={styles.urlContainer}>
          <input type='text' value={url} readOnly className={styles.urlInput} />
          <button className={styles.copyButton} onClick={handleCopy} title={copied ? 'Copied!' : 'Copy to clipboard'}>
            {copied ? <FaCheck /> : <FaCopy />}
          </button>
        </div>

        <div className={styles.shareOptions}>
          <button className={`${styles.shareButton} ${styles.whatsapp}`} onClick={() => shareToSocial('whatsapp')}>
            <FaWhatsapp />
            <span>WhatsApp</span>
          </button>
          <button className={`${styles.shareButton} ${styles.twitter}`} onClick={() => shareToSocial('twitter')}>
            <FaTwitter />
            <span>Twitter</span>
          </button>
          <button className={`${styles.shareButton} ${styles.facebook}`} onClick={() => shareToSocial('facebook')}>
            <FaFacebook />
            <span>Facebook</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
