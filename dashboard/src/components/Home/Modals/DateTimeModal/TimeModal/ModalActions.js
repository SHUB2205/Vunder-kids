import React from 'react';
import styles from './TimeModal.module.css';

function ModalActions({ handleToggleTimeModal,handleShowDateModal }) {
  return (
    <div className={styles.modalActions}>
      <button className={styles.cancelButton} onClick={handleToggleTimeModal}>Cancel</button>
      <button className={styles.okButton} onClick={handleShowDateModal}>Ok</button>
    </div>
  );
}

export default ModalActions;