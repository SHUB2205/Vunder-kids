import React from 'react';
import styles from './MatchCard.module.css';

function MatchCard({ type, location, team1, team2, date }) {
  return (
    <div className={styles.matchCard}>
      <div className={styles.matchInfo}>
        <span className={styles.matchType}>{type}</span>
        <span className={styles.matchLocation}>{location}</span>
      </div>
      <div className={styles.teamInfo}>
        <img src={team1.logo} alt={`${team1.name} logo`} className={styles.teamLogo} />
        <span className={styles.teamName}>{team1.name}</span>
      </div>
      <div className={styles.teamInfo}>
        <img src={team2.logo} alt={`${team2.name} logo`} className={styles.teamLogo} />
        <span className={styles.teamName}>{team2.name}</span>
      </div>
      <div className={styles.matchDate}>{date}</div>
    </div>
  );
}

export default MatchCard;