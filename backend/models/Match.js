const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  isTeamMatch: { type: Boolean, default: false },
  teams: [{
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
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
  winner: {
    type: { type: String, enum: ['Team', 'User'] },
    ref: { type: mongoose.Schema.Types.ObjectId, refPath: 'winner.type' }
  },
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
