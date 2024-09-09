// notificationService.js
const Notification = require('../../models/Notifiication');
const sendNotification= require('./fireBaseSendNotification');
// Simulate a service worker that runs in the background
// users should be the id not the complete user
const notificationService = (users, type, message, matchId) => {
  // Use setImmediate to ensure non-blocking behavior
  setImmediate(async () => {
    try {
      const notifications = users.map(user => ({
        user: user,
        type: type,
        message: message,
        match: matchId
      }));

      await Notification.insertMany(notifications); // Batch insert notifications
      console.log('Notifications sent successfully');

      // if (fcmTokens && fcmTokens.length > 0) {
      //   fcmTokens.forEach(async (fcmToken) => {
      //     try {
      //       await sendNotification(fcmToken, "New Notification", message);
      //     } catch (error) {
      //       console.error("Error sending FCM notification to token", fcmToken, error);
      //     }
      //   });
      // } else {
      //   console.warn("No FCM tokens provided");
      // }
      // await sendNotification("fxqC7fWzq2f8xA9D_Sz6dG:APA91bE4V_wmC9PTOXX9UYrxrK7B7YB2vkmuoKFUK-Vzlb1C01Fq1cyEJd7c3K6iFBxjurfqY4iufqV6AZOoCNTJX-tG1uIXGqb_n9bCAMosslUThWwdtqz_PCeLD__kiKItaGYhuv2i", message);

    } catch (error) {
      console.error('Error sending notifications', error);
    }
  });
};

module.exports =  notificationService ;
