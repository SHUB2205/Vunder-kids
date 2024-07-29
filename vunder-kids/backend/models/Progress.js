const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const ProgressSchema = new mongoose.Schema({
  overallScore: {
    type: Number,
    default: 0,
  },
  // Divide the score among the sports
  sportScores: [
    {
      score: {
        type: Number,
        default: 0,
      },
      sport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sport",
        required: true,
      },
    },
  ],
  userAchievements: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAchievement",
    },
  ],
  following: [
    {
      type:Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  followers: [
    {
      type:Schema.Types.ObjectId,
      ref: 'User',
    }
  ]
});

const Progress = mongoose.model("Progress", ProgressSchema);

module.exports = Progress;
