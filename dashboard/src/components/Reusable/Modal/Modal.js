import React from "react";
import styles from "./Modal.module.css";
import CloseIcon from "../../images/CloseIcon.png";
const Modal = ({ isOpen, onClose, children, widthModalContent }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <main
        className={`${styles.modalContent} ${widthModalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <img
          onClick={onClose}
          className={styles.closeIcon}
          src={CloseIcon}
          alt="Close"
          aria-hidden="true"
        />
        <img
          onClick={onClose}
          className={styles.closeIcon}
          src={CloseIcon}
          alt="Close"
          aria-hidden="true"
        />
      </main>
    </div>
  );
};

export default Modal;
