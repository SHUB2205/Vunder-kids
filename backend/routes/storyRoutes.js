const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Story = require('../models/Story');
const User = require('../models/User');
const { upload, uploadToCloudinary } = require('../middleware/upload');

// @route   GET /api/story
// @desc    Get stories from following users
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const followingIds = [...user.following, req.user._id];

    const stories = await Story.find({
      creator: { $in: followingIds },
      expiresAt: { $gt: new Date() }
    })
      .sort({ createdAt: -1 })
      .populate('creator', 'name userName avatar');

    res.json({ stories });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/story/create
// @desc    Create a new story
router.post('/create', auth, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Media is required' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'stories');
    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    const story = new Story({
      creator: req.user._id,
      mediaURL: result.secure_url,
      mediaType,
    });

    await story.save();
    await story.populate('creator', 'name userName avatar');

    res.status(201).json({ story });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/story/view/:id
// @desc    Mark story as viewed
router.post('/view/:id', auth, async (req, res) => {
  try {
    await Story.findByIdAndUpdate(req.params.id, {
      $addToSet: { viewedBy: req.user._id }
    });
    res.json({ message: 'Story viewed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
