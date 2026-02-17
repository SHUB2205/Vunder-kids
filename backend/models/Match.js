const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport' },
  sportName: { type: String }, // Fallback if sport ObjectId not available
  date: { type: Date, required: true },
  location: { type: String, required: true },
  isTeamMatch: { type: Boolean, default: false },
  // For 1v1 matches
  opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  opponentName: { type: String }, // Fallback for non-fisiko users
  // For team matches - embedded team data (no separate Team model needed)
  teams: [{
    name: { type: String },
    players: [{ type: String }] // Can be usernames or names
  }],
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['in-progress', 'scheduled', 'completed', 'cancelled', 'score-requested'],
    default: 'scheduled'
  },
  scores: { type: mongoose.Schema.Types.Mixed, default: {} },
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  winnerName: { type: String },
  agreementTime: { type: Number, default: 24 },
  agreement: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  predictions: {
    option1: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    option2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  scoreRequestBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);
