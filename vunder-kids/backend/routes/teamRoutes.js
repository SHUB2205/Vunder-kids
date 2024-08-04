const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const {isAuth} = require('../middleware/is-Auth');

// Create a new team
router.post('/create', isAuth, teamController.createTeam);

// Get all teams
router.get('/all/:userid', isAuth, teamController.getAllTeams);

// Get a single team by ID
router.get('/:id', isAuth, teamController.getTeamById);

// Update a team
// Route to add a participant to a team
router.put('/update/add/:id', isAuth, teamController.addParticipant);

// Route to remove a participant from a team
router.put('/update/remove/:id', isAuth, teamController.removeParticipant);

router.put('/update/name/:id', isAuth, teamController.updateTeamName);

// Delete a team by ID
router.delete('/:id', isAuth, teamController.deleteTeamById);

module.exports = router;
