const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const isAuth = require('../middleware/is-Auth');

// Create a new match
router.post('/', isAuth, matchController.createMatch);

// Get all matches
router.get('/', isAuth, matchController.getAllMatches);

// Get a match by ID
router.get('/:id', isAuth, matchController.getMatchById);

// Update a match
router.put('/:id', isAuth, matchController.updateMatch);

module.exports = router;
