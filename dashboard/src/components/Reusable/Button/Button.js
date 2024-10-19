import React from 'react'
import styles from './Button.module.css'
export default function Button({children}) {
  return (
    <button className={styles.submitButton}>{children}</button>
  )
}
