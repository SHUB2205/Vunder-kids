const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    date: {
      type: Date,
      required: true
    },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sport',
      required: true
    },
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    score : {
        type:Number,
        required:true
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
});

const Match = mongoose.model('Match', MatchSchema);

module.exports = Match;