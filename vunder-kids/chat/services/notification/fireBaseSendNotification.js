const { getMessaging } = require("firebase-admin/messaging");
// Send FCM notification function
const sendNotification = async (fcmToken, notificationTitle, notificationBody) => {
    const message = {
      token: fcmToken, // The recipient's FCM token
      notification: {
        title: notificationTitle,
        body: notificationBody,
      },
    };
  
    try {
      const response = await getMessaging().send(message);
      // console.log("Successfully sent message:", response);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  module.exports = sendNotification;