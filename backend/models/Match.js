const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  thumbnail: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  caption: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const MatchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  // Sport
  sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport' },
  sportName: { type: String, required: true },
  
  // Date & Time
  date: { type: Date, required: true },
  startTime: { type: String },
  endTime: { type: String },
  
  // Location - linked to facility or custom
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  location: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  
  // Booking reference (if booked through facility)
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  
  // Match type
  isTeamMatch: { type: Boolean, default: false },
  matchType: { type: String, enum: ['1v1', 'team', 'free-play', 'tournament'], default: '1v1' },
  
  // For 1v1 matches - opponent approval system
  opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  opponentName: { type: String },
  opponentApproved: { type: Boolean, default: false },
  opponentApprovedAt: { type: Date },
  
  // For team matches
  teams: [{
    name: { type: String },
    players: [{ 
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String }
    }]
  }],
  
  // All participants
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxPlayers: { type: Number },
  
  // Creator & Admins
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Status
  status: {
    type: String,
    enum: ['pending-approval', 'scheduled', 'in-progress', 'completed', 'cancelled', 'score-requested'],
    default: 'scheduled'
  },
  
  // Scores
  scores: { type: mongoose.Schema.Types.Mixed, default: {} },
  scoreSubmittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scoreApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scoreApproved: { type: Boolean, default: false },
  
  // Winner
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  winnerName: { type: String },
  winnerTeam: { type: Number }, // 0 or 1 for team index
  isDraw: { type: Boolean, default: false },
  
  // Media - photos/videos from the match
  media: [MediaSchema],
  
  // Social
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Predictions
  predictions: {
    option1: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    option2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
  // Visibility
  isPublic: { type: Boolean, default: true },
  
  // Legacy fields
  agreementTime: { type: Number, default: 24 },
  agreement: { type: Boolean, default: false },
  scoreRequestBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes
MatchSchema.index({ creator: 1, date: -1 });
MatchSchema.index({ opponent: 1, status: 1 });
MatchSchema.index({ players: 1 });
MatchSchema.index({ facility: 1 });
MatchSchema.index({ booking: 1 });
MatchSchema.index({ status: 1, date: -1 });

module.exports = mongoose.model('Match', MatchSchema);
