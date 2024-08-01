const express = require('express');
const matchController = require('../controllers/matchController');
const {isAuth} = require('../middleware/is-Auth');
const  {getAllMatches} = require ('../controllers/matchController');
const router = express.Router();

// Create a new match
router.post('/', isAuth, matchController.createMatch);
// Get all matches
router.get('/', isAuth, getAllMatches);

// Get a match by ID
router.get('/:id', isAuth, matchController.getMatchById);

// Update a match
router.put('/:id', isAuth, matchController.updateMatch);

// Route for a team to agree to a match
router.post('/agreement', isAuth ,matchController.updateAgreement);

module.exports = router;
