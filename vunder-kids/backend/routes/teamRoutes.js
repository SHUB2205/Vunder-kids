const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const {isAuth} = require('../middleware/is-Auth');

// Create a new team
router.post('/create', isAuth, teamController.createTeam);

// Get all teams
router.get('/all', isAuth, teamController.getAllTeams);

// Get a single team by ID
router.get('/:id', isAuth, teamController.getTeamById);

// Update a team by ID
router.put('/:id', isAuth, teamController.updateTeamById);

// Delete a team by ID
router.delete('/:id', isAuth, teamController.deleteTeamById);

module.exports = router;
