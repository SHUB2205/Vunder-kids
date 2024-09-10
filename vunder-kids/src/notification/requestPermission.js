import { messaging } from "./fireBase";
import { getToken } from "firebase/messaging";
// Token Generate and asked for permission
export const requestPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    // Generate Token
    const token = await getToken(messaging, {
      vapidKey: process.env.VAPID_KEY,
    });
    console.log(token);
    return { token, permission: true };
    // Send this token  to server ( db)
  } else if (permission === "denied") {
    alert("You denied for the notification");
    return { token: undefined, permission: false };
  }
};
