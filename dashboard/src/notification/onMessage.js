import { messaging } from "./fireBase"; // Import the messaging instance from your Firebase configuration
import { onMessage } from "firebase/messaging"; // Import the onMessage function from Firebase SDK

export const setupOnMessage = () => {
  if (!messaging) {
    console.warn("Firebase Messaging is not initialized or unsupported in this environment.");
    return;
  }

  onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);

    const notificationTitle = payload.notification?.title || "Notification";
    const notificationOptions = {
      body: payload.notification?.body || "No message body",
      icon: payload.notification?.image || "/default-icon.png",
    };

    if (Notification.permission === "granted") {
      new Notification(notificationTitle, notificationOptions);
    }
  });
};
