import React, { useContext } from "react";
import NotificationItem from "./NotificationItem";
import { NotificationContext } from "../../createContext/Notification/NotificationContext";
import styles from "./notification.module.css";

const AllNotifications = () => {
  const { allNotifications, loading } = useContext(NotificationContext);

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const differenceInMs = now - notificationTime;
    const differenceInMinutes = Math.floor(differenceInMs / 60000);

    if (differenceInMinutes < 1) {
      return "Just now";
    } else if (differenceInMinutes < 60) {
      return `${differenceInMinutes} min ago`;
    } else if (differenceInMinutes < 1440) {
      const hours = notificationTime.getHours();
      const minutes = notificationTime.getMinutes();
      const period = hours >= 12 ? "pm" : "am";
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = String(minutes).padStart(2, "0");
      return `${formattedHours}:${formattedMinutes} ${period}`;
    } else {
      const day = notificationTime.getDate();
      const month = notificationTime.toLocaleString("default", { month: "short" });
      return `${day} ${month}`;
    }
  };

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
              time={formatTime(notification.createdAt)}
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
