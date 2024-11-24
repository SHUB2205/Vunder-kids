import React from 'react';
import styles from './MatchesComponent.module.css';
import MatchCardPost from './MatchCardPost';

const MatchesComponent = () => {
  const sportTypes = ['Football', 'Tennis', 'Tennis', 'Tennis', 'Tennis', 'Tennis'];

  return (
    <section className={styles.matchesSection}>
      <div className={styles.matchesContainer}>
        <h2 className={styles.matchesTitle}>Matches</h2>
        <div className={styles.filterContainer}>
          <div className={styles.locationFilter}>
            <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/17bcbe26b1f122f770e5508255920dbf8c86e4bbc9d969ec144cdf0a9f79a293?placeholderIfAbsent=true&apiKey=b883bcf213724f38a6f53982628f709c" alt="" className={styles.locationIcon} />
            <span className={styles.locationText}>Jacksonville, USA</span>
          </div>
          <div className={styles.matchTypeFilter}>
            <button className={`${styles.filterButton} ${styles.activeFilter}`}>1 on 1</button>
            <button className={styles.filterButton}>Team</button>
          </div>
          <div className={styles.sportTypeFilter}>
            {sportTypes.map((sport, index) => (
              <button key={index} className={`${styles.filterButton} ${index === 0 ? styles.activeFilter : ''}`}>
                {sport}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.matchCardContainer}>
          <MatchCardPost />
        </div>
      </div>
    </section>
  );
};

export default MatchesComponent;