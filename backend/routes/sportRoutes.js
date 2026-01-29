const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Sport = require('../models/Sport');

// @route   GET /api/sport
// @desc    Get all sports
router.get('/', auth, async (req, res) => {
  try {
    let sports = await Sport.find({ isActive: true }).sort({ name: 1 });
    
    // If no sports exist, create default ones
    if (sports.length === 0) {
      const defaultSports = [
        { name: 'Football', icon: 'football' },
        { name: 'Basketball', icon: 'basketball' },
        { name: 'Tennis', icon: 'tennisball' },
        { name: 'Cricket', icon: 'baseball' },
        { name: 'Swimming', icon: 'water' },
        { name: 'Running', icon: 'walk' },
        { name: 'Cycling', icon: 'bicycle' },
        { name: 'Volleyball', icon: 'basketball-outline' },
        { name: 'Badminton', icon: 'tennisball-outline' },
        { name: 'Gym', icon: 'barbell' },
      ];

      await Sport.insertMany(defaultSports);
      sports = await Sport.find({ isActive: true }).sort({ name: 1 });
    }

    res.json({ sports });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/sport
// @desc    Create a new sport (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, icon, description } = req.body;

    const sport = new Sport({ name, icon, description });
    await sport.save();

    res.status(201).json({ sport });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
