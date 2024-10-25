import React from 'react';
import styles from './Facilities.module.css';

export const TimeSlot = ({ time }) => (
  <button className={styles.timeButton}>
    {time}
  </button>
);