import React from 'react';
import Logo from './Logo';
import NavigationMenu from './NavigationMenu';
import UserStats from './UserStats';
import styles from './LeftSidebar.module.css';

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <Logo />
      <NavigationMenu />
      <UserStats />
    </aside>
  );
}

export default Sidebar;