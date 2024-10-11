import React from 'react';
import MatchCard from './MatchCard';
import styles from './UpcomingMatches.module.css';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const sports = ['Football', 'Tennis', 'Volleyball', 'Basketball', 'Soccer', 'Cricket'];

function UpcomingMatches() {
  return (
    <section className={styles.upcomingMatches}>
      <h2 className={styles.sectionTitle}>Upcoming Matches</h2>
      <div className={styles.matchesToggle}>
        <button className={styles.activeToggle}>My Matches</button>
        <button className={styles.inactiveToggle}>Friends Matches</button>
      </div>
      <div className={styles.dateSelector}>
        {days.map((day, index) => (
          <button key={index} className={index === 0 ? styles.activeDate : styles.inactiveDate}>
            <span>{day}</span>
            <span>{String(index + 7).padStart(2, '0')}</span>
          </button>
        ))}
      </div>
      <div className={styles.sportsFilter}>
        <img src="http://b.io/ext_26-" alt="Filter" className={styles.filterIcon} />
        <div className={styles.sportsList}>
          {sports.map((sport, index) => (
            <button key={index} className={index === 0 ? styles.activeSport : styles.inactiveSport}>
              {sport}
            </button>
          ))}
        </div>
      </div>
      <MatchCard
        type="Team"
        location="Jacksonville, TIAA Bank Field"
        team1={{ name: "Hulk hogans", logo: "http://b.io/ext_27-" }}
        team2={{ name: "Machos", logo: "http://b.io/ext_28-" }}
        date="Mon, Sep 7, 9:30 AM"
      />
      <hr className={styles.divider} />
      <MatchCard
        type="1 on 1"
        location="Jacksonville, TIAA Bank Field"
        team1={{ name: "James", logo: "http://b.io/ext_27-" }}
        team2={{ name: "Khadar shaik", logo: "http://b.io/ext_28-" }}
        date="Mon, Sep 7, 9:30 AM"
      />
    </section>
  );
}

export default UpcomingMatches;