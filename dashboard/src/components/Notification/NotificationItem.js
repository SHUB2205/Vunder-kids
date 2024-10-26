import React from 'react';
import styles from './notification.module.css';

function NotificationItem({ user, action, content, time, image, }) {
    return (
        <div className={styles.notificationItem}>
            <img src={image} alt={`${user}'s profile`} className={styles.notificationImg} />
            <div className={styles.notificationContent}>
                <div>
                    <span className={styles.userName}>{user}</span> {action}{' '}
                    <span className={styles.contentHighlight}>{content}</span>
                </div>
                <div className={styles.time}>{time}</div>
            </div>
        </div>
    );
}

export default NotificationItem;
