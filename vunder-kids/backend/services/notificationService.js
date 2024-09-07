// notificationService.js
const Notification = require('../');

// Simulate a service worker that runs in the background
const notificationService = (users, type, message, matchId) => {
  // Use setImmediate to ensure non-blocking behavior
  setImmediate(async () => {
    try {
      const notifications = users.map(user => ({
        user: user._id,
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

module.exports = { notificationService };
