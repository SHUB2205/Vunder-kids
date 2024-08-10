// const mongoose = require('mongoose');

// const MatchSchema = new mongoose.Schema({
//     date: {
//         type: Date,
//         required: true
//     },
//     location: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Location',
//         required: true
//     },
//     sport: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Sport',
//         required: true
//     },
//     teams: [{
//         team: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Team',
//             required: true
//         },
//         score: {
//             type: Number,
//             default: 0 // Changed to default: 0 to ensure consistency
//         }
//     }],
//     winner: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Team'
//     },
//     matchmakingTeam: { // Added field
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Team'
//     },
//     agreement: {
//         type: Boolean,
//         default: false, // Default value to ensure a match isn't fixed unless both teams agree
//     },
    
//     agreedTeams: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Team'
//     }],
//     status: {
//         type: String,
//         enum: ['in-progress','scheduled','completed', 'cancelled'], // Enum to ensure valid status values
//         default: 'in-progress' // Default status when the match is first created
//     }
// });

// const Match = mongoose.model('Match', MatchSchema);

// module.exports = Match;












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
            default: 0
        }
    }],
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    matchmakingTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    agreement: {
        type: Boolean,
        default: false
    },
    agreedTeams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    }],
    status: {
        type: String,
        enum: ['in-progress','scheduled','completed', 'cancelled'],
        default: 'in-progress'
    },
    agreementTime: {  // New field to store the deadline for agreement
        type: Number,
        required: true
    },
});

const Match = mongoose.model('Match', MatchSchema);

module.exports = Match;
