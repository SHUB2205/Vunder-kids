import React from 'react';
import styles from './notification.module.css';

function NotificationItem({ user, content, time, image, }) {
    return (
        <div className={styles.notificationItem}>
            <img src={image} alt={`${user}'s profile`} className={styles.notificationImg} />
            <div className={styles.notificationContent}>
                <div className={styles.info}>
                    <div className={styles.contentHighlight}>{content}</div>
                </div>

            </div>
            <div className={styles.time}>{time}</div>
        </div>
    );
}

export default NotificationItem;

