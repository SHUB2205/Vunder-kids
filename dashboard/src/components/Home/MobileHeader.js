import React from "react";
import styles from "./MobileHeader.module.css";
import LogoIcon from "../images/Logo.png";
const Header = () => {
  return (
    <>
      <div className={styles.logoContainer}>
      <img src={LogoIcon} alt="Isiko logo" className={styles.logoImage} />
        <div className={styles.iconContainer}>
          <div className={styles.iconHeader} role="img" aria-label="Calendar">
            📆
          </div>
          <div className={styles.iconHeader} role="img" aria-label="Notifications">
            🔔
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
