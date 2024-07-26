const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    requiredScore: {
      type: Number,
      required: true
    },
    sport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sport',
    }
});
  
const Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = Achievement;