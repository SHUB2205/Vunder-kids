const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    overallScore: {
        type: Number,
        default: 0
    },
    sportScores: [{
        sport: String,
        score: Number
    }]
});

const Progress = mongoose.model('Progress', ProgressSchema);

module.exports = Progress;