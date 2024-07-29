const mongoose = require('mongoose');


const UserAchievementSchema = new mongoose.Schema({

    achievements: [{
      achievement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievement',
        required: true
      },
      completedDate: {
        type: Date
      }
    }]

  });


    
const UserAchievement = mongoose.model('UserAchievement', UserAchievementSchema);

module.exports = UserAchievement;