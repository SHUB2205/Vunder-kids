import React from 'react';
import styles from './Logo.module.css';

function Logo() {
  return (
    <div className={styles.logoContainer}>
      <img src="http://b.io/ext_20-" alt="Isiko logo" className={styles.logoImage} />
      <h1 className={styles.logoText}>isiko</h1>
    </div>
  );
}

export default Logo;