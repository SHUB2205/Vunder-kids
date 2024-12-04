import { messaging } from "./fireBase"; // Import the messaging instance from your Firebase configuration
import { onMessage } from "firebase/messaging"; // Import the onMessage function from Firebase SDK

// Define the onMessage handler
export const setupOnMessage = () => {
  onMessage(messaging, (payload) => {
    // console.log("Foreground message received:", payload); // Log the incoming message payload

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.image,
    };

    // Check if Notification permission is granted and show the notification
    if (Notification.permission === "granted") {
      new Notification(notificationTitle, notificationOptions);
    }
  });
};
