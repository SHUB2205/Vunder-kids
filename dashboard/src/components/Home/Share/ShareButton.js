import React from 'react';
import styles from './ShareComponent.module.css';

const ShareButton = ({ icon, text }) => (
  <button className={styles.shareOption}>
    <img src={icon} alt="" className={styles.shareIcon} />
    <span className={styles.shareText}>{text}</span>
  </button>
);

export default ShareButton;