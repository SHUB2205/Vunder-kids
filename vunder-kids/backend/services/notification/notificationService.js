const Notification = require('../../models/Notifiication');
const User = require("../../models/User");
const sendNotification = require('./fireBaseSendNotification');

// Simulate a service worker that runs in the background
// users should be the id not the complete user
const notificationService = (users, type, message, creatorId , creatorImage ) => {
  // Use setImmediate to ensure non-blocking behavior
  setImmediate(async () => {
    try { 
      if(type === "team-making"){
        console.log("Team Making notification");
      }
      
      // Prepare notifications for the users
      const notifications = users.map(user => ({
        user: user,
        type: type,
        message: message,
        creatorUser: creatorId,          // Creator's ID
        creatorUserImage: creatorImage,  // Creator's image
         }));

      await Notification.insertMany(notifications); // Batch insert notifications
      console.log('Notifications sent successfully' , notifications);

      // Get users who have valid notification tokens
      const usersWithTokens = await User.find({ 
        _id: { $in: users },
        notificationToken: { $exists: true, $ne: null } // Ensure tokens exist and are not null
      }).select('notificationToken');
    
      const fcmTokens = [...new Set(usersWithTokens.map(user => user.notificationToken))];
      if (fcmTokens && fcmTokens.length > 0) {
        fcmTokens.forEach(async (fcmToken) => {
          try {
            // Send Firebase Cloud Messaging notification
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

module.exports = notificationService;
