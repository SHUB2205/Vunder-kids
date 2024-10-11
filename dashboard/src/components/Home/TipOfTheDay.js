import React from 'react';
import styles from './TipOfTheDay.module.css';

function TipOfTheDay() {
  return (
    <section className={styles.tipOfTheDay}>
      <h2 className={styles.tipTitle}>Tip of the Day</h2>
      <p className={styles.tipContent}>
        <span role="img" aria-label="Muscle">💪</span> Boost your performance by setting specific, achievable goals for each match! <span role="img" aria-label="Basketball">🏀</span>
      </p>
    </section>
  );
}

export default TipOfTheDay;