const Team = require('../models/Team');

// Create a new team
exports.createTeam = async (req, res) => {
    try {
        const { name, participants } = req.body;
        const newTeam = new Team({ name, participants });
        await newTeam.save();
        res.status(201).json(newTeam);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all teams
exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find().populate('participants.user');
        res.status(200).json(teams);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a single team by ID
exports.getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id).populate('participants.user');
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.status(200).json(team);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a team by ID
exports.updateTeamById = async (req, res) => {
    try {
        const { name, participants } = req.body;
        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.id,
            { name, participants },
            { new: true }
        ).populate('participants.user');
        if (!updatedTeam) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.status(200).json(updatedTeam);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a team by ID
exports.deleteTeamById = async (req, res) => {
    try {
        const deletedTeam = await Team.findByIdAndDelete(req.params.id);
        if (!deletedTeam) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
