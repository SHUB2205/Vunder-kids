const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: { // User who will receive the notification
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: { // Notification content
    type: String,
    required: true
  },
  type: { // Type of notification
    type: String,
    enum: [
      'follow', 
      'matchmaking',
      'match-scheduled',
      'match-accepted',
      'match-reminder',
      'user',
      'match-cancelled',
      'event-scheduled',
      'event-update',
      'event-cancelled'
    ], // Enum to restrict notification types
    required: true
  },
  read: { // Status of the notification
    type: Boolean,
    default: false
  },
  createdAt: { // Timestamp when the notification was created
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
