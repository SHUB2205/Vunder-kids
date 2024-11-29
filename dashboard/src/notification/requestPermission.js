import { messaging } from "./fireBase";
import { getToken } from "firebase/messaging";
const Backend_URL = "http://localhost:5000";

export const requestPermission = async (userId) => {
  const permission = await Notification.requestPermission();

  const updateTokenOnServer = async (token) => {
    console.log("here");
    const response = await fetch(`${Backend_URL}/api/notification-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token:sessionStorage.getItem('token')
      },
      body: JSON.stringify({token}),
    });
    // console.log(response);
    if (!response.ok) {
      console.error("Failed to update token on the server");
    }
  };

  if (permission === "granted") {
    try {
      const token = await getToken(messaging, {
        vapidKey: process.env.VAPID_KEY,
      });

      console.log("Notification Token:", token);
      await updateTokenOnServer(token); // Save token to server
      return { token, permission: true };
    } catch (error) {
      console.error("Error generating token:", error);
      return { token: undefined, permission: false };
    }
  } else if (permission === "denied") {
    alert("You denied the notification");
    await updateTokenOnServer(null); // Remove token from server
    return { token: undefined, permission: false };
  }
};
