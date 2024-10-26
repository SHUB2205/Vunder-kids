import React from 'react';
import { TimeSlot } from './TimeSlot';
import styles from './Facilities.module.css';

export const VenueCard = ({ venue, timeSlots }) => (
  <article className={styles.venueCard}>
    <div 
      className={styles.venueImage}
      style={{ backgroundImage: `linear-gradient(180.32deg, rgba(0, 0, 0, 0) 65.29%, #000000 99.72%), url(${venue.imageUrl})` }}
    >
      <p className={styles.timeSlot}>1h from</p>
      <div className={styles.venueInfo}>
        <h2 className={styles.venueName}>{venue.name}</h2>
        <p className={styles.price}>{venue.price} $</p>
      </div>
    </div>
    <div className={styles.timeSlots}>
      {timeSlots.map((time, index) => (
        <TimeSlot key={index} time={time} />
      ))}
    </div>
  </article>
);
