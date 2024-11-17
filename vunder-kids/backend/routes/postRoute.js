const express = require('express');
const { upload } = require('../config/cloudinary');
const postController = require('../controllers/postController');
const {isAuth,optionalAuth} = require('../middleware/is-Auth');
const { body, param } = require('express-validator');
 
const router = express.Router();

router.get('/likedPosts',isAuth,postController.getLikedPosts);

router.get('/post/:postId',optionalAuth, postController.getPost);

router.post('/create', isAuth, upload.single('media'), postController.createPost);

router.get('/posts/',postController.getPosts);

router.get('/posts/:username',postController.getPosts);

router.get('/recent_post',postController.recentPost);


router.put('/like-post/:postId', isAuth, [
    param('postId').isMongoId().withMessage('Invalid post ID')
], postController.toggleLike);

router.post('/comment/:postId', isAuth, [
    param('postId').isMongoId().withMessage('Invalid post ID'),
    body('content').trim().notEmpty().withMessage('Comment content is required')
], postController.commentOnPost);

router.put('/like-comment/:commentId', isAuth, [
    param('commentId').isMongoId().withMessage('Invalid comment ID')
], postController.toggleLikeComment);   

router.put('/toggle-follow', isAuth, [
    body('followId').isMongoId().withMessage('Invalid user ID')
  ], postController.toggleFollow);
  

router.post('/matches/:matchId/post-result', isAuth, postController.postMatchResult);

module.exports = router;