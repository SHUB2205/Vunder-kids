
const sendNotification= require('./fireBaseSendNotification');

const User =require('../../models/User');
const notificationService = (senderId, recipientId) => {

  setImmediate(async () => {
    try {
      const sender=await User.findById(senderId);

      const usersWithTokens = await User.find({ 
        _id: { $in: recipientId },
        notificationToken: { $exists: true, $ne: null } // Ensure tokens exist and are not null
      }).select('notificationToken');
    
      const fcmTokens = [...new Set(usersWithTokens.map(user => user.notificationToken))];
      console.log(fcmTokens);
      if (fcmTokens && fcmTokens.length > 0) {
        fcmTokens.forEach(async (fcmToken) => {
          try {
            await sendNotification(fcmToken, "New Notification", `You have a new message from ${sender.name}`);
            console.log("send");
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
