import React from 'react';
import styles from './TimeModal.module.css';

function TimeDisplay({ currentDate, handleHourChange, handleMinuteChange, handleAMPMChange, isPM }) {
  return (
    <div className={styles.timeDisplay}>
      <div className={styles.hourPicker}>
        <button onClick={() => handleHourChange((currentDate.hours % 12 || 12) + 1)} aria-label="Increase hour">
          {((currentDate.hours % 12 || 12) + 1).toString().padStart(2, '0')}
        </button>
        <span className={styles.currentTime}>{(currentDate.hours % 12 || 12).toString().padStart(2, '0')}</span>
        <button onClick={() => handleHourChange(((currentDate.hours - 2 + 12) % 12 || 12))} aria-label="Decrease hour">
          {((currentDate.hours - 2 + 12) % 12 || 12).toString().padStart(2, '0')}
        </button>
      </div>
      <span className={styles.timeSeparator}>:</span>
      <div className={styles.minutePicker}>
        <button onClick={() => handleMinuteChange((currentDate.minutes + 1) % 60)} aria-label="Increase minute">
          {((currentDate.minutes + 1) % 60).toString().padStart(2, '0')}
        </button>
        <span className={styles.currentTime}>{currentDate.minutes.toString().padStart(2, '0')}</span>
        <button onClick={() => handleMinuteChange((currentDate.minutes - 1 + 60) % 60)} aria-label="Decrease minute">
          {((currentDate.minutes - 1 + 60) % 60).toString().padStart(2, '0')}
        </button>
      </div>
      <div className={styles.ampmPicker}>
        <button
          className={`${styles.amButton} ${!isPM ? styles.active : ''}`}
          onClick={() => handleAMPMChange(false)}
          aria-pressed={!isPM}
        >
          AM
        </button>
        <button
          className={`${styles.pmButton} ${isPM ? styles.active : ''}`}
          onClick={() => handleAMPMChange(true)}
          aria-pressed={isPM}
        >
          PM
        </button>
      </div>
    </div>
  );
}

export default TimeDisplay;