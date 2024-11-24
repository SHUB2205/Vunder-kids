const express = require('express');
const router = express.Router();
const reelController = require('../controllers/reelController');
const {isAuth,optionalAuth} = require('../middleware/is-Auth');
const { check } = require('express-validator');
const { upload } = require('../config/cloudinary');


router.post('/create',isAuth,upload.single('media'),reelController.createReel);

router.get('/reels',optionalAuth, reelController.getReels);
router.put('/toggle-like/:reelId',isAuth,reelController.toggleLikeReel);
router.post('/comment/:reelId', isAuth, [check('content').trim().notEmpty().withMessage('Comment content is required')], reelController.commentOnReel);
router.put('/comment-like/:commentId', isAuth, reelController.toggleLikeComment);
router.get('/likedReels',isAuth,reelController.getUsersLikedReel);

module.exports = router;