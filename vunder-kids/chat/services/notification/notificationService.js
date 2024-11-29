// notificationService.js
const sendNotification= require('./fireBaseSendNotification');
// Simulate a service worker that runs in the background
// users should be the id not the complete user
const User =require('../../models/User');
const notificationService = (users, type, message) => {
  // Use setImmediate to ensure non-blocking behavior
  setImmediate(async () => {
    try {
      // const notifications = users.map(user => ({
      //   user: user,
      //   type: type,
      //   message: message,
      // }));
      // await Notification.insertMany(notifications); // Batch insert notifications
      const usersWithTokens = await User.find({ 
        _id: { $in: users },
        notificationToken: { $exists: true, $ne: null } // Ensure tokens exist and are not null
      }).select('notificationToken');
    
      const fcmTokens = [...new Set(usersWithTokens.map(user => user.notificationToken))];
      if (fcmTokens && fcmTokens.length > 0) {
        fcmTokens.forEach(async (fcmToken) => {
          try {
            await sendNotification(fcmToken, "New Notification", message);
          } catch (error) {
            console.error("Error sending FCM notification to token", fcmToken, error);
          }
        });
      } else {
        console.warn("No FCM tokens provided");
      }
    } catch (error) {
      console.error('Error sending notifications', error);
    }
  });
};

module.exports =  notificationService ;
