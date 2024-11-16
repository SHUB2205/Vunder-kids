import React from 'react';
import ShareButton from './ShareButton';
import styles from './ShareComponent.module.css';

const shareOptions = [
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/e01b8d3c9f054e922b1c956e9cd040c0db1c1492d02afd1a0e545a2849495b3e?apiKey=f523408d85c94fc8913d645c993f4c42&", text: "Copy Link" },
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/4858f9b85a81e38d0aa5bf249617c714f8f1bb9a6cec1ee79fa042c7e5dd49b8?apiKey=f523408d85c94fc8913d645c993f4c42&", text: "Send" },
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/af64d2fbe6d1de0fa05f932e919e16288fa80579ab40b75f61eade0e50ef6aa1?apiKey=f523408d85c94fc8913d645c993f4c42&", text: "Direct Message" }
];

const ShareModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <section className={styles.shareContainer} role="dialog" aria-modal="true" aria-labelledby="shareModalTitle">
        <h2 id="shareModalTitle" className={styles.visuallyHidden}>Share Options</h2>
        {shareOptions.map((option, index) => (
          <ShareButton key={index} icon={option.icon} text={option.text} />
        ))}
        <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
      </section>
    </div>
  );
};

export default ShareModal;