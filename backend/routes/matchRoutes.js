const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Match = require('../models/Match');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Booking = require('../models/Booking');

// @route   GET /api/matches
// @desc    Get all matches (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { status, sport, upcoming, mine } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (sport) filter.sportName = new RegExp(sport, 'i');
    
    if (upcoming === 'true') {
      filter.date = { $gte: new Date() };
      filter.status = { $in: ['scheduled', 'pending-approval'] };
    }

    if (mine === 'true') {
      filter.$or = [
        { creator: req.user._id },
        { opponent: req.user._id },
        { players: req.user._id }
      ];
    }

    const matches = await Match.find(filter)
      .sort({ date: -1 })
      .populate('sport', 'name')
      .populate('creator', 'name userName avatar')
      .populate('players', 'name userName avatar')
      .populate('opponent', 'name userName avatar')
      .populate('facility', 'name address image')
      .populate('booking', 'bookingCode startTime endTime')
      .lean();

    res.json({ matches: matches || [] });
  } catch (error) {
    console.error('Get matches error:', error);
    res.json({ matches: [] });
  }
});

// @route   GET /api/matches/my
// @desc    Get current user's matches (scheduled, ongoing, completed)
router.get('/my', auth, async (req, res) => {
  try {
    const { tab } = req.query; // 'upcoming', 'ongoing', 'completed'
    
    const filter = {
      $or: [
        { creator: req.user._id },
        { opponent: req.user._id },
        { players: req.user._id }
      ]
    };

    if (tab === 'upcoming') {
      filter.status = { $in: ['scheduled', 'pending-approval'] };
      filter.date = { $gte: new Date() };
    } else if (tab === 'ongoing') {
      filter.status = 'in-progress';
    } else if (tab === 'completed') {
      filter.status = 'completed';
    }

    const matches = await Match.find(filter)
      .sort({ date: tab === 'completed' ? -1 : 1 })
      .populate('sport', 'name')
      .populate('creator', 'name userName avatar')
      .populate('opponent', 'name userName avatar')
      .populate('facility', 'name address image')
      .populate('booking', 'bookingCode startTime endTime status')
      .lean();

    res.json({ matches });
  } catch (error) {
    console.error('Get my matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/matches/pending-approval
// @desc    Get matches waiting for user's approval
router.get('/pending-approval', auth, async (req, res) => {
  try {
    const matches = await Match.find({
      opponent: req.user._id,
      status: 'pending-approval',
      opponentApproved: false
    })
      .sort({ date: 1 })
      .populate('creator', 'name userName avatar')
      .populate('facility', 'name address image')
      .lean();

    res.json({ matches });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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

// @route   POST /api/matches/:id/like
// @desc    Like/unlike a match
router.post('/:id/like', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Initialize likes array if it doesn't exist
    if (!match.likes) {
      match.likes = [];
    }

    const isLiked = match.likes.includes(req.user._id);
    
    if (isLiked) {
      match.likes.pull(req.user._id);
    } else {
      match.likes.push(req.user._id);
      
      // Notify match creator
      if (match.creator.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: match.creator,
          sender: req.user._id,
          type: 'like',
          message: 'liked your match',
          match: match._id,
        });
      }
    }

    await match.save();
    res.json({ likes: match.likes, isLiked: !isLiked });
  } catch (error) {
    console.error('Like match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/matches/:id/comment
// @desc    Comment on a match
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Initialize comments array if it doesn't exist
    if (!match.comments) {
      match.comments = [];
    }

    const comment = {
      user: req.user._id,
      content: content.trim(),
      createdAt: new Date(),
    };

    match.comments.push(comment);
    await match.save();

    // Populate the user info for the new comment
    await match.populate('comments.user', 'name userName avatar');

    // Notify match creator
    if (match.creator.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: match.creator,
        sender: req.user._id,
        type: 'comment',
        message: 'commented on your match',
        match: match._id,
      });
    }

    res.json({ 
      comment: match.comments[match.comments.length - 1],
      comments: match.comments 
    });
  } catch (error) {
    console.error('Comment on match error:', error);
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
      .populate('opponent', 'name userName avatar')
      .populate('facility', 'name address image pricePerHour')
      .populate('booking')
      .populate('media.uploadedBy', 'name userName avatar')
      .populate('comments.user', 'name userName avatar');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json({ match });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/matches/:id/approve
// @desc    Opponent approves the match
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.opponent?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the opponent can approve this match' });
    }

    if (match.opponentApproved) {
      return res.status(400).json({ message: 'Match already approved' });
    }

    match.opponentApproved = true;
    match.opponentApprovedAt = new Date();
    match.status = 'scheduled';
    match.players.addToSet(req.user._id);
    await match.save();

    // Add match to opponent's matchIds
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { matchIds: match._id }
    });

    // Notify creator
    await Notification.create({
      recipient: match.creator,
      sender: req.user._id,
      type: 'match_approved',
      message: `${req.user.name} accepted your match challenge`,
      data: { matchId: match._id }
    });

    await match.populate('creator', 'name userName avatar');
    await match.populate('opponent', 'name userName avatar');

    res.json({ match, message: 'Match approved successfully' });
  } catch (error) {
    console.error('Approve match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/matches/:id/decline
// @desc    Opponent declines the match
router.put('/:id/decline', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.opponent?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the opponent can decline this match' });
    }

    match.status = 'cancelled';
    await match.save();

    // Notify creator
    await Notification.create({
      recipient: match.creator,
      sender: req.user._id,
      type: 'match_declined',
      message: `${req.user.name} declined your match challenge${reason ? ': ' + reason : ''}`,
      data: { matchId: match._id }
    });

    res.json({ message: 'Match declined' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/matches/:id/media
// @desc    Add media (photos/videos) to a match
router.post('/:id/media', auth, async (req, res) => {
  try {
    const { url, type, thumbnail, caption } = req.body;
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Check if user is part of the match
    const isParticipant = match.creator.toString() === req.user._id.toString() ||
      match.opponent?.toString() === req.user._id.toString() ||
      match.players.some(p => p.toString() === req.user._id.toString());

    if (!isParticipant) {
      return res.status(403).json({ message: 'Only match participants can add media' });
    }

    if (!url) {
      return res.status(400).json({ message: 'Media URL is required' });
    }

    match.media.push({
      url,
      type: type || 'image',
      thumbnail,
      caption,
      uploadedBy: req.user._id
    });

    await match.save();
    await match.populate('media.uploadedBy', 'name userName avatar');

    res.json({ media: match.media, message: 'Media added successfully' });
  } catch (error) {
    console.error('Add media error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/matches/:id/media/:mediaId
// @desc    Remove media from a match
router.delete('/:id/media/:mediaId', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const mediaItem = match.media.id(req.params.mediaId);
    if (!mediaItem) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Only uploader or match creator can delete
    if (mediaItem.uploadedBy.toString() !== req.user._id.toString() &&
        match.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this media' });
    }

    match.media.pull(req.params.mediaId);
    await match.save();

    res.json({ message: 'Media removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/matches/:id/complete
// @desc    Mark match as completed and set final score
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { scores, winnerId, winnerName, isDraw } = req.body;
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Only creator or admin can complete
    if (match.creator.toString() !== req.user._id.toString() &&
        !match.admins.some(a => a.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    match.scores = scores;
    match.scoreSubmittedBy = req.user._id;
    match.status = 'score-requested'; // Needs opponent approval
    
    if (isDraw) {
      match.isDraw = true;
    } else if (winnerId) {
      match.winnerId = winnerId;
      match.winnerName = winnerName;
    }

    await match.save();

    // Notify opponent to approve score
    if (match.opponent) {
      await Notification.create({
        recipient: match.opponent,
        sender: req.user._id,
        type: 'score_submitted',
        message: `${req.user.name} submitted the score for your match. Please verify.`,
        data: { matchId: match._id }
      });
    }

    res.json({ match, message: 'Score submitted, awaiting opponent verification' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/matches/:id/verify-score
// @desc    Opponent verifies/approves the submitted score
router.put('/:id/verify-score', auth, async (req, res) => {
  try {
    const { approved } = req.body;
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Only opponent can verify
    if (match.opponent?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the opponent can verify the score' });
    }

    if (approved) {
      match.scoreApproved = true;
      match.scoreApprovedBy = req.user._id;
      match.status = 'completed';

      // Update user stats
      const updateStats = async (userId, isWinner, isDraw, sportName) => {
        const update = {
          $inc: {
            'stats.totalMatches': 1,
            [`stats.sportStats.${sportName}.matches`]: 1
          }
        };
        
        if (isDraw) {
          update.$inc['stats.draws'] = 1;
          update.$inc[`stats.sportStats.${sportName}.draws`] = 1;
        } else if (isWinner) {
          update.$inc['stats.wins'] = 1;
          update.$inc[`stats.sportStats.${sportName}.wins`] = 1;
          update.$inc.xp = 50; // XP for winning
        } else {
          update.$inc['stats.losses'] = 1;
          update.$inc[`stats.sportStats.${sportName}.losses`] = 1;
          update.$inc.xp = 10; // XP for participating
        }

        await User.findByIdAndUpdate(userId, update);
      };

      // Update stats for both players
      if (match.creator) {
        const isCreatorWinner = match.winnerId?.toString() === match.creator.toString();
        await updateStats(match.creator, isCreatorWinner, match.isDraw, match.sportName);
      }
      if (match.opponent) {
        const isOpponentWinner = match.winnerId?.toString() === match.opponent.toString();
        await updateStats(match.opponent, isOpponentWinner, match.isDraw, match.sportName);
      }

      // Notify creator
      await Notification.create({
        recipient: match.creator,
        sender: req.user._id,
        type: 'score_verified',
        message: `${req.user.name} verified the match score`,
        data: { matchId: match._id }
      });
    } else {
      // Score disputed - reset to in-progress
      match.status = 'in-progress';
      match.scores = {};
      match.winnerId = null;
      match.winnerName = null;
      match.isDraw = false;

      await Notification.create({
        recipient: match.creator,
        sender: req.user._id,
        type: 'score_disputed',
        message: `${req.user.name} disputed the submitted score`,
        data: { matchId: match._id }
      });
    }

    await match.save();
    res.json({ match, message: approved ? 'Score verified, match completed' : 'Score disputed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/matches/:id/start
// @desc    Start the match (change status to in-progress)
router.put('/:id/start', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only match creator can start the match' });
    }

    if (match.status !== 'scheduled') {
      return res.status(400).json({ message: 'Match cannot be started' });
    }

    match.status = 'in-progress';
    await match.save();

    // Notify opponent
    if (match.opponent) {
      await Notification.create({
        recipient: match.opponent,
        sender: req.user._id,
        type: 'match_started',
        message: `Your match has started!`,
        data: { matchId: match._id }
      });
    }

    res.json({ match });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
