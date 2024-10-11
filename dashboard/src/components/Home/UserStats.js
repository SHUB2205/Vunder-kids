import React from 'react';
import styles from './UserStats.module.css';

const statItems = [
  { icon: '🤾‍♂️', value: '84', label: 'Games Played' },
  { icon: '🏆', value: '56', label: 'Trophies' },
  { icon: '🙆‍♂️', value: '28', label: 'Assists' },
  { icon: '🎯', value: '84%', label: 'Accuracy' }
];

function UserStats() {
  return (
    <section className={styles.userStats}>
      <h2 className={styles.statsTitle}>Game Play</h2>
      <div className={styles.playerInfo}>
        <span className={styles.playerName}>Khadar shaik</span>
        <img src="http://b.io/ext_21-" alt="Khadar shaik" className={styles.playerAvatar} />
      </div>
      <div className={styles.statsToggle}>
        <button className={styles.activeToggle}>1 on 1</button>
        <button className={styles.inactiveToggle}>Team</button>
      </div>
      <div className={styles.statsGrid}>
        {statItems.map((item, index) => (
          <div key={index} className={styles.statItem}>
            <div className={styles.statIcon} role="img" aria-label={item.label}>{item.icon}</div>
            <div className={styles.statValue}>{item.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default UserStats;