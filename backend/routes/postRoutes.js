const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { upload, uploadToCloudinary } = require('../middleware/upload');

// @route   GET /api/post/posts
// @desc    Get feed posts
router.get('/posts', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id);
    const followingIds = [...user.following, req.user._id];

    const posts = await Post.find({ 
      creator: { $in: followingIds },
      isArchived: false 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creator', 'name userName avatar')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name userName avatar' }
      });

    const total = await Post.countDocuments({ creator: { $in: followingIds } });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/post/create
// @desc    Create a new post
router.post('/create', auth, upload.single('media'), async (req, res) => {
  try {
    const { content, title, tags } = req.body;
    
    let mediaURL, mediaType;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'posts');
      mediaURL = result.secure_url;
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const post = new Post({
      creator: req.user._id,
      content,
      title,
      mediaURL,
      mediaType,
      tags: tags ? JSON.parse(tags) : [],
    });

    await post.save();
    await post.populate('creator', 'name userName avatar');

    res.status(201).json({ post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/post/like/:id
// @desc    Like/unlike a post
router.post('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likedBy.includes(req.user._id);
    
    if (isLiked) {
      post.likedBy.pull(req.user._id);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(req.user._id);
      post.likes += 1;

      // Create notification
      if (post.creator.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.creator,
          sender: req.user._id,
          type: 'like',
          message: 'liked your post',
          post: post._id,
        });
      }
    }

    await post.save();
    res.json({ likes: post.likes, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/post/comment/:id
// @desc    Comment on a post
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      user: req.user._id,
      content,
      post: post._id,
    });

    await comment.save();
    await comment.populate('user', 'name userName avatar');

    post.comments.push(comment._id);
    await post.save();

    // Create notification
    if (post.creator.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.creator,
        sender: req.user._id,
        type: 'comment',
        message: 'commented on your post',
        post: post._id,
      });
    }

    res.status(201).json({ comment });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/post/delete/:id
// @desc    Delete a post
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/post/user/:userId
// @desc    Get user's posts
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ creator: req.params.userId, isArchived: false })
      .sort({ createdAt: -1 })
      .populate('creator', 'name userName avatar');
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
