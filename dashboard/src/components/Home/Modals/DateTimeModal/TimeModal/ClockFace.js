import React from 'react';
import styles from './TimeModal.module.css';

function ClockFace({ currentDate, handleHourChange }) {
  // Normalize the hours to 12-hour format, and calculate the rotation in degrees.
  const hourRotation = ((currentDate.hours % 12) * 30 + (currentDate.minutes / 2))-28;
  console.log(hourRotation);
  return (
    <div className={styles.clockFace}>
      <div className={styles.clockNumbers}>
        {[11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((hour) => (
          <button
            key={hour}
            onClick={() => handleHourChange(hour)}
            aria-label={`Set to ${hour} o'clock`}
            className={`${styles[`number${hour}`]} ${currentDate.hours % 12 === hour % 12 ? styles.active : ''}`}
          >
            {hour}
          </button>
        ))}
      </div>
      <div className={styles.clockCenter} aria-hidden="true" />
      <div
        className={styles.clockHand}
        style={{
          transform: `rotate(${hourRotation}deg)` // Apply rotation in degrees
        }}
      />
    </div>
  );
}

export default ClockFace;
