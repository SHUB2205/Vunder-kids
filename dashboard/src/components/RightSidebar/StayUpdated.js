import React from 'react';
import styles from './StayUpdated.module.css';
import UserPhoto2 from '../images/UserPhoto2.png';
import UserPhoto3 from '../images/UserPhoto3.png';
function StayUpdated() {
  return (
    <section className={styles.stayUpdated}>
      <h2 className={styles.sectionTitle}>Stay updated with</h2>
      <div className={styles.userSuggestion}>
        <img src={UserPhoto2} alt="Eduardo's avatar" className={styles.userAvatar} />
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>Eduardo</h3>
          <p className={styles.userHandle}>@eduardo</p>
        </div>
        <button className={styles.followButton}>Follow</button>
      </div>
      <div className={styles.userSuggestion}>
        <img src={UserPhoto3} alt="Eduardo's avatar" className={styles.userAvatar} />
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>Eduardo</h3>
          <p className={styles.userHandle}>@eduardo</p>
        </div>
        <button className={styles.followButton}>Follow</button>
      </div>
      <div className={styles.matchDate}>Show More</div>
    </section>
  );
}

export default StayUpdated;
