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
      'team-making',
      'follow', 
      'matchmaking',
      'match-scheduled',
      'match-accepted',
      'match-reminder',
      'match-cancelled',
      'match-completed',
      'match-result',
      'match-update',
      'user',
      "all",
      "match",
      "message",
      "score-request"
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
  },
  creatorUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  creatorUserImage: { // Image URL of the user who created the notification
    type: String,
  }
});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
