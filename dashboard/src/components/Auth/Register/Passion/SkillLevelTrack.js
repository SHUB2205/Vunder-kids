import React from "react";
import styles from "./SkillLevelTrack.module.css";
export default function SkillLevelTrack({ sport, onSkillLevelSelect, onClose }) {

  const handleSelectLevel = (level) => {
    console.log(`Skill level selected for ${sport.name}: ${level}`);
    onSkillLevelSelect(level);
  };

  return (
    <div className={styles.modal}>
      <h2>Select Skill Level for {sport.name}</h2>
      <div className={styles.levelOptions}>
        {["Beginner", "Foundation", "Intermediate", "Advance", "Pro"].map(
          (level) => (
            <button
              key={level}
              onClick={() => handleSelectLevel(level)}
              className={styles.levelButton}
            >
              {level}
            </button>
          )
        )}
      </div>
      <button onClick={onClose} className={styles.closeButton}>
        Close
      </button>
    </div>
  );
}
