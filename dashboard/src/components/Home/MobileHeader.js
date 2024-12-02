import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MobileHeader.module.css";
import LogoIcon from "../images/Logo.png";

const Header = () => {
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    navigate("/notification"); // Redirect to the notification page
  };

  return (
    <>
      <div className={styles.logoContainer}>
        <img src={LogoIcon} alt="Isiko logo" className={styles.logoImage} />
        <div className={styles.iconContainer}>
          <div className={styles.iconHeader} role="img" aria-label="Calendar">
            📆
          </div>
          <div
            className={styles.iconHeader}
            role="img"
            aria-label="Notifications"
            onClick={handleNotificationClick} // Add click handler
            style={{ cursor: "pointer" }} // Optional: to indicate it's clickable
          >
            🔔
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
