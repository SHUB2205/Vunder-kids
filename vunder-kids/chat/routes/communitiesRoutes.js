const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communitiesController');
const { isAuth } = require('../middleware/is-Auth');

// Get recommended communities
router.get('/recommended', isAuth, communityController.getRecommendedCommunities);

//Get all Communities
router.get('/all',communityController.getCommunities);

// Get joined communities
router.get('/joined', isAuth, communityController.getJoinedCommunities);

// Join a community
router.post('/join/:communityId', isAuth, communityController.joinCommunity);

// Get community details
router.get('/:communityId', isAuth, communityController.getCommunityDetails);

// Create a new community
router.post('/create', isAuth, communityController.createCommunity);


module.exports = router;