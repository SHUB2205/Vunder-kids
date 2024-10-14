import React from 'react';
import TipOfTheDay from './TipOfTheDay';
import UpcomingMatches from './UpcomingMatches';
import StayUpdated from './StayUpdated';
import styles from './RightSidebar.module.css';

function RightSidebar() {
  return (
    <aside className={styles.rightSidebar}>
      <TipOfTheDay />
      <UpcomingMatches />
      <StayUpdated />
    </aside>
  );
}

export default RightSidebar;