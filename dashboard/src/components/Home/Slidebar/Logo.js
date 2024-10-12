import React from 'react';
import styles from './Logo.module.css';
import LogoIcon from '../../images/Logo.png'

function Logo() {
  return (
    <div className={styles.logoContainer}>
      <img src={LogoIcon} alt="Isiko logo" className={styles.logoImage} />
    </div>
  );
}

export default Logo;