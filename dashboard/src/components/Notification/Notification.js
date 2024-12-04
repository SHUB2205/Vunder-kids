import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import styles from "./notification.module.css";

const Notification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Set active state based on the current route
  const [activeHeads, setActiveHeads] = useState(location.pathname.includes("matches") ? false : true);

  const handleHeadClick = (value) => {
    setActiveHeads(value);
    if (value) {
      navigate("/notification/all");  // Navigate to /notification/all
    } else {
      navigate("/notification/matches");  // Navigate to /notification/matches
    }
  };

  useEffect(() => {
    // Ensure active state is updated when the route changes
    setActiveHeads(location.pathname.includes("matches") ? false : true);
  }, [location]);

  return (
    <div className={styles.mainContent}>
      <div className={styles.notificationHeader}>
        <h2 className={styles.notificationHeading}>Notification</h2>
      </div>

      {/* Notification Toggle Buttons */}
      <div className={styles.notificationToggle}>
        <button
          className={activeHeads === true ? styles.activeToggle : styles.inactiveToggle}
          onClick={() => handleHeadClick(true)}
        >
          All
        </button>
        <button
          className={activeHeads === false ? styles.activeToggle : styles.inactiveToggle}
          onClick={() => handleHeadClick(false)}
        >
          Matches
        </button>
      </div>

      {/* Notification Content */}
      <div className={styles.notificationWrapper}>
        {/* Render the nested routes (either AllNotifications or MatchNotifications) */}
        <Outlet />
      </div>
    </div>
  );
};

export default Notification;
