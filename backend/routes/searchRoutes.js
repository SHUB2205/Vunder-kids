const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const Sport = require('../models/Sport');

// @route   GET /api/search
// @desc    General search for users and posts
router.get('/', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 1) {
      return res.json({ users: [], posts: [] });
    }

    const users = await User.find({
      $or: [
        { name: new RegExp(q, 'i') },
        { userName: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
      ],
      _id: { $ne: req.user._id }
    })
      .select('name userName avatar bio followers email')
      .limit(20);

    const posts = await Post.find({
      content: new RegExp(q, 'i')
    })
      .populate('creator', 'name userName avatar')
      .limit(20);

    res.json({ users, posts });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/search/users
// @desc    Search users
router.get('/users', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      $or: [
        { name: new RegExp(q, 'i') },
        { userName: new RegExp(q, 'i') },
      ],
      _id: { $ne: req.user._id }
    })
      .select('name userName avatar bio followers')
      .limit(20);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/search/sports
// @desc    Search sports
router.get('/sports', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    const filter = { isActive: true };
    if (q) {
      filter.name = new RegExp(q, 'i');
    }

    const sports = await Sport.find(filter).limit(20);
    res.json({ sports });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/search/news
// @desc    Search news (mock data for now)
router.get('/news', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    // Mock news data - in production, integrate with a news API
    const mockNews = [
      {
        _id: '1',
        title: 'Premier League: Latest Match Results',
        category: 'Football',
        source: 'Sports News',
        image: 'https://via.placeholder.com/300x200',
      },
      {
        _id: '2',
        title: 'NBA Finals Preview',
        category: 'Basketball',
        source: 'Sports Daily',
        image: 'https://via.placeholder.com/300x200',
      },
      {
        _id: '3',
        title: 'Tennis Grand Slam Updates',
        category: 'Tennis',
        source: 'Tennis Weekly',
        image: 'https://via.placeholder.com/300x200',
      },
    ];

    const news = q 
      ? mockNews.filter(n => 
          n.title.toLowerCase().includes(q.toLowerCase()) ||
          n.category.toLowerCase().includes(q.toLowerCase())
        )
      : mockNews;

    res.json({ news });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
