import React from 'react';
import styles from './StayUpdated.module.css';

function StayUpdated() {
  return (
    <section className={styles.stayUpdated}>
      <h2 className={styles.sectionTitle}>Stay updated with</h2>
      <div className={styles.userSuggestion}>
        <img src="http://b.io/ext_29-" alt="Eduardo's avatar" className={styles.userAvatar} />
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>Eduardo</h3>
          <p className={styles.userHandle}>@eduardo</p>
        </div>
        <button className={styles.followButton}>Follow</button>
      </div>
    </section>
  );
}

export default StayUpdated;
