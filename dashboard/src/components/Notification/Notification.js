import React, { useState } from 'react'
import NotificationItem from './NotificationItem';
import styles from './notification.module.css';
import MatchNotification from './matchNotification/matchNotification';

function Notification() {
  const [activeHeads, setActiveHeads] = useState(true);
  const handleHeadClick = (value) => {
    setActiveHeads(value);
  };

  const notifications = [
    { user: 'Gregory', action: '❤️ your post', content: 'Tyler takes on Ryan in an electri......', time: '3m', image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/d41842a1cc369b27d1e897fbeb5c346c1da346e924d670822a7d65351b18be1c?placeholderIfAbsent=true&apiKey=1126fdd409354df98f70d71ca7bf443b', icon: '❤️' },
    { user: 'Eduardo', action: '💬 commented on', content: 'Ryan in an electri......', time: '22m', image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/ae43432223496ef43e3e710e956c17c8d4e000372adcf58235af295fceedff1f?placeholderIfAbsent=true&apiKey=1126fdd409354df98f70d71ca7bf443b', icon: '💬' },
    { user: 'Lee', action: '👤 followed you', content: '', time: '38m', image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/6bc57d365f030d24f53569ceaa0c9b604e36f26d0519f23ca08f6539946bb24f?placeholderIfAbsent=true&apiKey=1126fdd409354df98f70d71ca7bf443b', icon: '👤' },
    { user: 'Guy', action: '🏀 challenged', content: '1v1 | Football | Sep 7 | 11AM', time: '1h', image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/4727f09295967cf93886621c7bf0ddb355276aee90e95ec6c55eaca0eb5b4156?placeholderIfAbsent=true&apiKey=1126fdd409354df98f70d71ca7bf443b', icon: '🏀' },
    { user: 'Robert', action: '💬 commented on', content: 'Tyler takes on Ryan in an electri......', time: '1h', image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/173ce1aa66d70cddd9601ee8b8eea76afda06bf307f2ae57196baa9e787a8900?placeholderIfAbsent=true&apiKey=1126fdd409354df98f70d71ca7bf443b', icon: '💬' },
    { user: 'Shane', action: '❤️ your post', content: 'Tyler takes on Ryan in an electri......', time: '2h', image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/3595d30a9f1ee492b886fad1993003e1162b3496cf7128faf288056277b39174?placeholderIfAbsent=true&apiKey=1126fdd409354df98f70d71ca7bf443b', icon: '❤️' }
  ];

  return (
    <div>
      <div className={styles.notificationHeader}>
        <input type="text" placeholder="Notifications" aria-label="Notifications" />
      </div>
      {/* for toogle purpose */}
      <div className={styles.notificationToggle}>
        <button
          className={
            activeHeads === true ? styles.activeToggle : styles.inactiveToggle
          }
          onClick={() => handleHeadClick(true)}
        >
          All
        </button>
        <button
          className={
            activeHeads === false
              ? styles.activeToggle
              : styles.inactiveToggle
          }
          onClick={() => handleHeadClick(false)}
        >
          Matches
        </button>
      </div>
      <div className={styles.notificationWrapper}>
        {activeHeads ? (
          <div className={styles.notificationContainer}>
            {notifications.map((notification, index) => (
              <React.Fragment key={index}>
                <NotificationItem {...notification} />
                {index < notifications.length - 1 && (
                  <div className={styles.notificationDivider} />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          < MatchNotification />
        )}
      </div>
    </div>
  );
}

export default Notification;