import React, { useContext } from "react";
import NotificationItem from "./NotificationItem";
import { NotificationContext } from "../../createContext/Notification/NotificationContext";
import styles from "./notification.module.css";

const AllNotifications = () => {
  const { allNotifications, loading } = useContext(NotificationContext);

  return (
    <div className={styles.notificationWrapper}>
      {loading ? (
        <div className={styles.loading}>Loading notifications...</div>
      ) : allNotifications.length === 0 ? (
        <div className={styles.noNotifications}>No notifications yet.</div>
      ) : (
        allNotifications.map((notification, index) => (
          <React.Fragment key={notification._id}>
            <NotificationItem
              user={notification.creatorUser}
              content={notification.message}
              time={new Date(notification.createdAt).toLocaleString()}
              image={notification.creatorUserImage}
            />
            {index < allNotifications.length - 1 && (
              <div className={styles.notificationDivider} />
            )}
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default AllNotifications;
