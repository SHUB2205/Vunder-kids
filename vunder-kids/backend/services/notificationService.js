// notificationService.js
const Notification = require('../models/Notifiication');

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
    } catch (error) {
      console.error('Error sending notifications', error);
    }
  });
};

module.exports =  notificationService ;
