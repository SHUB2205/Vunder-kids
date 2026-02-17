const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Match = require('../models/Match');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route   GET /api/matches
// @desc    Get all matches
router.get('/', auth, async (req, res) => {
  try {
    const matches = await Match.find()
      .sort({ date: -1 })
      .populate('sport', 'name')
      .populate('creator', 'name userName avatar')
      .populate('players', 'name userName avatar')
      .populate('opponent', 'name userName avatar')
      .lean();

    res.json({ matches: matches || [] });
  } catch (error) {
    console.error('Get matches error:', error);
    res.json({ matches: [] });
  }
});

// @route   POST /api/matches/create
// @desc    Create a new match
router.post('/create', auth, async (req, res) => {
  try {
    const { name, sport, date, location, isTeamMatch, agreementTime, opponent, teams } = req.body;

    // Handle sport - can be ObjectId or string name
    let sportId = null;
    let sportName = null;
    
    if (sport) {
      // Check if it's a valid ObjectId
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(sport)) {
        sportId = sport;
      } else {
        // It's a sport name string
        sportName = sport;
        // Try to find the sport by name
        const Sport = require('../models/Sport');
        const foundSport = await Sport.findOne({ name: { $regex: new RegExp(sport, 'i') } });
        if (foundSport) {
          sportId = foundSport._id;
        }
      }
    }

    const matchData = {
      name,
      date,
      location,
      isTeamMatch: isTeamMatch || false,
      agreementTime: agreementTime || 24,
      creator: req.user._id,
      admins: [req.user._id],
      players: [req.user._id],
    };

    // Add sport
    if (sportId) matchData.sport = sportId;
    if (sportName) matchData.sportName = sportName;

    // Handle 1v1 match - opponent
    if (!isTeamMatch && opponent) {
      // Check if opponent is a user ID or just a name
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(opponent)) {
        matchData.opponent = opponent;
        matchData.players.push(opponent);
      } else {
        matchData.opponentName = opponent;
      }
    }

    // Handle team match
    if (isTeamMatch && teams && teams.length > 0) {
      matchData.teams = teams;
    }

    const match = new Match(matchData);
    await match.save();
    
    // Populate fields
    if (sportId) {
      await match.populate('sport', 'name');
    }
    await match.populate('creator', 'name userName avatar');
    await match.populate('opponent', 'name userName avatar');

    // Add match to user
    await User.findByIdAndUpdate(req.user._id, {
      $push: { matchIds: match._id }
    });

    // Notify opponent if they're a Fisiko user
    if (matchData.opponent) {
      await Notification.create({
        recipient: matchData.opponent,
        sender: req.user._id,
        type: 'match',
        message: 'challenged you to a match',
        match: match._id,
      });
    }

    res.status(201).json({ match });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   POST /api/matches/join/:id
// @desc    Join a match
router.post('/join/:id', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.players.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already joined this match' });
    }

    match.players.push(req.user._id);
    await match.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { matchIds: match._id }
    });

    // Notify match creator
    await Notification.create({
      recipient: match.creator,
      sender: req.user._id,
      type: 'match',
      message: 'joined your match',
      match: match._id,
    });

    await match.populate('players', 'name userName avatar');
    res.json({ match });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/matches/score/:id
// @desc    Update match score
router.put('/score/:id', auth, async (req, res) => {
  try {
    const { scores } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (!match.admins.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    match.scores = scores;
    match.status = 'score-requested';
    match.scoreRequestBy = req.user._id;
    await match.save();

    // Notify all players
    for (const playerId of match.players) {
      if (playerId.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: playerId,
          sender: req.user._id,
          type: 'match',
          message: 'updated the match score',
          match: match._id,
        });
      }
    }

    res.json({ match });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/matches/:id
// @desc    Get match by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('sport', 'name')
      .populate('creator', 'name userName avatar')
      .populate('players', 'name userName avatar')
      .populate('admins', 'name userName avatar')
      .populate('teams.team', 'name');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json({ match });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
