const mongoose = require('mongoose');

const UserAchievementSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement',
      required: true
    },
     status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress'
    },
    completedDate: {
      type: Date
    }
  });
  
const UserAchievement = mongoose.model('UserAchievement', UserAchievementSchema);

module.exports = UserAchievement;