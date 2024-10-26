import React from 'react';
import styles from './Facilities.module.css';

export const SportTag = ({ name, isActive }) => (
  <div className={isActive ? styles.activeTag : styles.sportTag}>
    {name}
  </div>
);
