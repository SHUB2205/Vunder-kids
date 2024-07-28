const mongoose = require('mongoose');


const UserAchievementSchema = new mongoose.Schema({
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