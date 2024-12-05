const express = require('express');
const matchController = require('../controllers/matchController');
const {isAuth} = require('../middleware/is-Auth');
// const  {getAllMatches} = require ('../controllers/matchController');
const router = express.Router();

// Create a new match
router.post('/create', isAuth, matchController.createMatch);
// Get all matches
router.get('/all/:userid', isAuth, matchController.getAllMatches);

router.get('/upcoming-matches',isAuth, matchController.getUpcomingMatches);
router.get('/completed-matches/:username',isAuth, matchController.getCompletedMatchesByUsername);


router.get('/sch-matches',matchController.scheduledMatches);
// Get a match by ID
router.get('/:id', isAuth, matchController.getMatchById);

// Update a match
router.put('/:id', isAuth, matchController.updateMatch);

router.post('/set-score',isAuth,matchController.updateMatch2);

// Route for a team to agree to a match
router.post('/agreement', isAuth ,matchController.updateAgreement);
router.put('/like/:matchId', isAuth, matchController.toggleLikeMatch);
router.post('/comments/:matchId', isAuth, matchController.commentOnMatch);
router.put('/vote/:matchId/:optionNumber', isAuth, matchController.votePrediction);


module.exports = router;
