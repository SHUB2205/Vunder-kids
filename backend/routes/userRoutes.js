const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { upload, uploadToCloudinary } = require('../middleware/upload');

// @route   GET /api/user
// @desc    Get current user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('followers', 'name userName avatar')
      .populate('following', 'name userName avatar');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/:id
// @desc    Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name userName avatar')
      .populate('following', 'name userName avatar');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/user
// @desc    Update user profile
router.put('/', auth, upload.single('avatar'), async (req, res) => {
  try {
    const updates = {};
    const allowedFields = ['name', 'userName', 'bio', 'location', 'age', 'gender', 'passions', 'isVerified', 'notificationToken'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'avatars');
      updates.avatar = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/follow
// @desc    Follow a user
router.post('/follow', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await userToFollow.handleFollowRequest(req.user._id);

    // Create notification
    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'follow',
      message: result.status === 'followed' ? 'started following you' : 'requested to follow you',
    });

    res.json(result);
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/unfollow
// @desc    Unfollow a user
router.post('/unfollow', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { followers: req.user._id }
    });

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/:id/followers
// @desc    Get user's followers
router.get('/:id/followers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name userName avatar bio');
    res.json({ followers: user?.followers || [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/:id/following
// @desc    Get user's following
router.get('/:id/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name userName avatar bio');
    res.json({ following: user?.following || [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
