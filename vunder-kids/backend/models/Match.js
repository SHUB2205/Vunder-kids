const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  name: {
    type: String, // Added match name field
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  sport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sport",
    required: true,
  },
  teams: [
    {
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true,
      }
    },
  ],
  isTeamMatch: {
    type: Boolean,
    default: false,
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  winner: {
    type: {
      type: String,
      enum: ["Team", "User"],
    },
    ref: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "winner.type",
    },
  },
  matchmakingTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  agreement: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["in-progress", "scheduled", "completed", "cancelled","score-requested"],
    default: "in-progress",
  },
  agreementTime: {
    type: Number,
    required: true,
  },
  CalendarEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CalendarEvent",
  },
  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model for admins
    },
  ], // New field to store the admins of the match
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model for the creator of the match
  },
  createdAt: {
    // Timestamp when the notification was created
    type: Date,
    default: Date.now,
  },
  scores: [{
    type:Number
  }],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  predictions: {
    option1: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }],
    option2: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }]
  },
  scoreRequestBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

const Match = mongoose.model("Match", MatchSchema);

module.exports = Match;
