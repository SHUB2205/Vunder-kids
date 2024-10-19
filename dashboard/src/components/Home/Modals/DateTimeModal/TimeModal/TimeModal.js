import React from 'react';
import styles from './TimeModal.module.css';
import TimeDisplay from './TimeDisplay';
import ClockFace from './ClockFace';
import ModalActions from './ModalActions';

function TimeModal({ currentDate, setCurrentDate, handleToggleTimeModal ,handleShowDateModal}) {
  const handleHourChange = (newHour) => {
    setCurrentDate(prevDate => ({ ...prevDate, hours: newHour }));
  };

  const handleMinuteChange = (newMinute) => {
    setCurrentDate(prevDate => ({ ...prevDate, minutes: newMinute }));
  };

  const handleAMPMChange = (isPM) => {
    setCurrentDate(prevDate => ({
      ...prevDate,
      hours: isPM ? (prevDate.hours % 12) + 12 : prevDate.hours % 12
    }));
  };

  const isPM = currentDate.hours >= 12;

  return (
    <div className={styles.timeModal}>
      <div className={styles.modalHeader}>Select time</div>
      <div className={styles.timePicker}>
        <TimeDisplay
          currentDate={currentDate}
          handleHourChange={handleHourChange}
          handleMinuteChange={handleMinuteChange}
          handleAMPMChange={handleAMPMChange}
          isPM={isPM}
        />
        <ClockFace
          currentDate={currentDate}
          handleHourChange={handleHourChange}
        />
      </div>
      <ModalActions handleToggleTimeModal={handleToggleTimeModal} handleShowDateModal={handleShowDateModal} />
    </div>
  );
}

export default TimeModal;