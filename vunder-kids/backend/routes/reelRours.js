const express = require('express');
const router = express.Router();
const reelController = require('../controllers/reelController');
const authMiddleware = require('../middleware/auth');

router.post('/reels',authMiddleware,reelController.createReel);
router.post('/reels/:reelId/like',authMiddleware,reelController.likeReel);
router.post('/reels/:reelId/comment',authMiddleware,reelController.commentOnReel);
router.get('/reels', reels.getReels);

module.exports = router;