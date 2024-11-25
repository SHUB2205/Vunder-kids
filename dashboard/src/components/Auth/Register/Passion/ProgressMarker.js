import React from "react";
import styles from "./SkillLevelTrack.module.css";

export const ProgressMarker = ({ isActive, onClick }) => (
  <div
    className={`${styles.progressMarker} ${
      isActive ? styles.activeMarker : ""
    }`}
    onClick={onClick}
    role="button"
    aria-pressed={isActive}
    tabIndex={0}
  />
);
