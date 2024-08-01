const Match = require('../models/Match');
const Sport = require('../models/Sport');
const Location = require('../models/Location');
const Team = require('../models/Team');


// Create a new match
exports.createMatch = async (req, res) => {
    try {
        const newMatchData = req.body;
        // Find the team with the highest score
        const highestScoringTeam = newMatchData.teams.reduce((prev, current) => {
            return (prev.score > current.score) ? prev : current;
        });
        // Set the winner field to the team with the highest score
        newMatchData.winner = highestScoringTeam.team;

        const newMatch = new Match(newMatchData);
        const savedMatch = await newMatch.save();
        
        const populatedMatch = await Match.findById(savedMatch._id)
            .populate('location sport teams.team')
            .populate({
                path: 'teams.team',
                populate: {
                    path: 'participants.user',
                    model: 'User',
                    select: '_id name'
                }
            })
            .populate({
                path: 'winner',
                select: '_id name'
            });

        res.status(201).json(populatedMatch);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all matches
exports.getAllMatches = async (req, res) => {
    try {
        const matches = await Match.find()
            .populate('location sport teams.team')
            .populate({
                path: 'teams.team',
                populate: {
                    path: 'participants.user',
                    model: 'User',
                    select: '_id name'
                }
            })
            .populate({
                path: 'winner',
                select: '_id name'
            });
        res.status(200).json(matches);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a match by ID
exports.getMatchById = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate('location sport teams.team')
            .populate({
                path: 'teams.team',
                populate: {
                    path: 'participants.user',
                    model: 'User',
                    select: '_id name'
                }
            })
            .populate({
                path: 'winner',
                select: '_id name'
            });
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        res.status(200).json(match);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a match
exports.updateMatch = async (req, res) => {
    try {
        const updatedMatchData = req.body;

        // Find the team with the highest score
        const highestScoringTeam = updatedMatchData.teams.reduce((prev, current) => {
            return (prev.score > current.score) ? prev : current;
        });

        // Set the winner field to the team with the highest score
        updatedMatchData.winner = highestScoringTeam.team;

        const updatedMatch = await Match.findByIdAndUpdate(req.params.id, updatedMatchData, { new: true })
            .populate('location sport teams.team')
            .populate({
                path: 'teams.team',
                populate: {
                    path: 'participants.user',
                    model: 'User',
                    select: '_id name'
                }
            })
            .populate({
                path: 'winner',
                select: '_id name'
            });

        if (!updatedMatch) {
            return res.status(404).json({ message: 'Match not found' });
        }
        res.status(200).json(updatedMatch);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



//agreement to a match
exports.updateAgreement= async (req, res) =>{
    const { matchId, teamId } = req.body;
    try {
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Ensure the team is part of the match
        const isTeamPartOfMatch = match.teams.some(t => t.team.equals(teamId));
        if (!isTeamPartOfMatch) {
            return res.status(400).json({ message: 'Team not part of this match' });
        }

        // If the team hasn't already agreed, add them to agreedTeams
        if (!match.agreedTeams) {
            match.agreedTeams = [];
        }
        if (!match.agreedTeams.includes(teamId)) {
            match.agreedTeams.push(teamId);
        }

        // Check if all teams have agreed
        if (match.agreedTeams.length === match.teams.length) {
            match.agreement = true;
        }

        await match.save();
        res.status(200).json(match);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

