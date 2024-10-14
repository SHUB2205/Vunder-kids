import React, { useState } from "react";
import styles from "./UserStats.module.css";
import UserPhoto from "../images/UserPhoto.png";
const statItems = [
  { icon: "🤾‍♂️", value: "84", label: "Games Played" },
  { icon: "🏆", value: "56", label: "Trophies" },
  { icon: "🙆‍♂️", value: "28", label: "Assists" },
  { icon: "🎯", value: "84%", label: "Accuracy" },
];

function UserStats() {
  const [activeStats, setActiveStatus] = useState(true);
  const handleActiveStats = (value) => {
    setActiveStatus(value);
  };

  return (
    <section className={styles.userStats}>
      <h2 className={styles.statsTitle}>Game Play</h2>
      <div className={styles.statsContainer}>
        <div className={styles.playerInfo}>
          <span className={styles.playerName}>Khadar shaik</span>
          <img
            src={UserPhoto}
            alt="Khadar shaik"
            className={styles.playerAvatar}
          />
        </div>
        <div className={styles.statsToggle}>
          <button
            className={
              activeStats === true ? styles.activeToggle : styles.inactiveToggle
            }
            onClick={() => handleActiveStats(true)}
          >
            1 on 1
          </button>
          <button    className={
              activeStats === false ? styles.activeToggle : styles.inactiveToggle
            }
            onClick={() => handleActiveStats(false)}>Team</button>
        </div>
        <div className={styles.statsGrid}>
          {statItems.map((item, index) => (
            <div key={index} className={styles.statItem}>
              <div
                className={styles.statIcon}
                role="img"
                aria-label={item.label}
              >
                {item.icon}
              </div>
              <div className={styles.statValue}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UserStats;
