const mongoose = require('mongoose');

const UserAchievementSchema = new mongoose.Schema({
  achievements: [{
    title: {
      type: String, // Store achievement title
      required: true
    },
    completedDate: {
      type: Date,
      default: Date.now // Automatically set the completion date
    }
  }]
});

const UserAchievement = mongoose.model('UserAchievement', UserAchievementSchema);

module.exports = UserAchievement;
