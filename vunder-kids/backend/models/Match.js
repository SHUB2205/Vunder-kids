const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    sport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sport',
        required: true
    },
    teams: [{
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true
        },
        score: {
            type: Number,
            default: 0 // Changed to default: 0 to ensure consistency
        }
    }],
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    }
});

const Match = mongoose.model('Match', MatchSchema);

module.exports = Match;
