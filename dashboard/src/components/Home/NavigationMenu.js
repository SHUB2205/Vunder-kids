import React from 'react';
import styles from './NavigationMenu.module.css';

const menuItems = [
  { icon: '🏠', label: 'Home', ariaLabel: 'Home' },
  { icon: '🔍', label: 'Search', ariaLabel: 'Search' },
  { icon: '🔔', label: 'Notification', ariaLabel: 'Notifications' },
  { icon: '💬', label: 'Messages', ariaLabel: 'Messages' },
  { icon: '🏀', label: 'Matches', ariaLabel: 'Matches' },
  { icon: '🥅', label: 'Facilities', ariaLabel: 'Facilities' },
  { icon: '👤', label: 'Profile', ariaLabel: 'Profile' }
];

function NavigationMenu() {
  return (
    <nav className={styles.navigationMenu}>
      {menuItems.map((item, index) => (
        <button key={index} className={styles.menuItem} aria-label={item.ariaLabel}>
          <span className={styles.menuIcon} role="img" aria-hidden="true">{item.icon}</span>
          <span className={styles.menuLabel}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default NavigationMenu;