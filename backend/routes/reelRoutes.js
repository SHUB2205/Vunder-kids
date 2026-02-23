const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Reel = require('../models/Reel');
const Notification = require('../models/Notification');
const { upload, uploadToCloudinary } = require('../middleware/upload');

// @route   GET /api/reels
// @desc    Get reels feed
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reels = await Reel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creator', 'name userName avatar');

    const total = await Reel.countDocuments();

    res.json({
      reels,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Get reels error:', error);
    res.json({ reels: [], currentPage: 1, totalPages: 0, total: 0 });
  }
});

// @route   POST /api/reels/create
// @desc    Create a new reel
router.post('/create', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Video is required' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'reels', 'video');

    const reel = new Reel({
      creator: req.user._id,
      mediaURL: result.secure_url,
      caption: req.body.caption,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
    });

    await reel.save();
    await reel.populate('creator', 'name userName avatar');

    res.status(201).json({ reel });
  } catch (error) {
    console.error('Create reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reels/like/:id
// @desc    Like/unlike a reel
router.post('/like/:id', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const isLiked = reel.likedBy.includes(req.user._id);
    
    if (isLiked) {
      reel.likedBy.pull(req.user._id);
      reel.likes = Math.max(0, reel.likes - 1);
    } else {
      reel.likedBy.push(req.user._id);
      reel.likes += 1;

      if (reel.creator.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: reel.creator,
          sender: req.user._id,
          type: 'like',
          message: 'liked your reel',
        });
      }
    }

    await reel.save();
    res.json({ likes: reel.likes, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reels/comment/:id
// @desc    Comment on a reel
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Create comment using Comment model
    const Comment = require('../models/Comment');
    const comment = new Comment({
      user: req.user._id,
      content: content.trim(),
      reel: reel._id,
    });
    await comment.save();

    reel.comments.push(comment._id);
    await reel.save();

    await comment.populate('user', 'name userName avatar');

    // Notify reel creator
    if (reel.creator.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: reel.creator,
        sender: req.user._id,
        type: 'comment',
        message: 'commented on your reel',
      });
    }

    res.json({ comment });
  } catch (error) {
    console.error('Comment on reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reels/:id
// @desc    Get a single reel
router.get('/:id', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate('creator', 'name userName avatar')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name userName avatar' }
      });

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Increment views
    reel.views += 1;
    await reel.save();

    res.json({ reel });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
