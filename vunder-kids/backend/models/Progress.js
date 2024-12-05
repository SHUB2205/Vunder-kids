const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  overallScore: {
    type: Number,
    default: 0,
  },
  totalMatches:{
    type:Number,
    default:0
  },
  matchesWon:{
    type:Number,
    default:0
  },
  sportScores: [
    {
      score: {
        type: Number,
        default: 0,
      },
      totalMatches:{
        type: Number,
        default: 0,
      },
      wonMatches:{
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
});

const Progress = mongoose.model("Progress", ProgressSchema);

module.exports = Progress;
