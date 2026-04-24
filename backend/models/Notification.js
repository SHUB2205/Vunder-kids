const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['follow', 'like', 'comment', 'match', 'message', 'booking', 'system'],
    required: true
  },
  message: { type: String, required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-dispatch an Expo push notification whenever a Notification is created.
// This is intentionally wrapped so any failure (invalid token, network, etc.)
// never breaks the calling route.
NotificationSchema.post('save', async function (doc) {
  try {
    // Only fire on first create, not on subsequent updates
    if (!doc.wasNew) return;
    const { sendPushToUser } = require('../services/pushNotifications');
    const User = mongoose.model('User');

    // Look up sender name so we can craft a readable title/body
    let senderName = 'Someone';
    if (doc.sender) {
      const sender = await User.findById(doc.sender).select('userName name');
      if (sender) senderName = sender.userName || sender.name || 'Someone';
    }

    const titleMap = {
      follow: 'New follower',
      like: 'New like',
      comment: 'New comment',
      match: 'Match update',
      message: 'New message',
      booking: 'Booking update',
      system: 'Fisiko',
    };

    const title = titleMap[doc.type] || 'Fisiko';
    const body = doc.sender ? `${senderName} ${doc.message}` : doc.message;

    await sendPushToUser(doc.recipient, {
      title,
      body,
      data: {
        notificationId: doc._id.toString(),
        type: doc.type,
        senderId: doc.sender?.toString(),
        postId: doc.post?.toString(),
        matchId: doc.match?.toString(),
      },
    });
  } catch (err) {
    console.error('[notification post-save push] error:', err.message);
  }
});

// Mark the doc as new in the pre-save hook so the post-save hook can tell
// whether it was just created.
NotificationSchema.pre('save', function (next) {
  this.wasNew = this.isNew;
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);
