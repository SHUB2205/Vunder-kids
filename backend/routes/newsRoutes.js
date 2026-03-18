const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Sports news data - curated headlines (can be replaced with real API later)
const getSportsNews = () => {
  const news = [
    {
      id: '1',
      title: 'NBA Playoffs: Lakers vs Celtics Game 7 Tonight',
      summary: 'The historic rivalry continues as both teams battle for the championship.',
      sport: 'Basketball',
      source: 'ESPN',
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      url: '#',
    },
    {
      id: '2',
      title: 'Champions League Final: Real Madrid Wins Again',
      summary: 'Real Madrid clinches their 15th Champions League title in dramatic fashion.',
      sport: 'Football',
      source: 'BBC Sport',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      url: '#',
    },
    {
      id: '3',
      title: 'Pickleball Becomes Fastest Growing Sport in America',
      summary: 'The paddle sport sees 40% growth in participation over the past year.',
      sport: 'Pickleball',
      source: 'Sports Illustrated',
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      url: '#',
    },
    {
      id: '4',
      title: 'Wimbledon 2024: Djokovic Eyes Record 25th Grand Slam',
      summary: 'The Serbian star advances to the semifinals with dominant performance.',
      sport: 'Tennis',
      source: 'Tennis World',
      imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      url: '#',
    },
    {
      id: '5',
      title: 'Padel World Tour Announces New US Expansion',
      summary: 'The sport continues its rapid growth with 10 new US venues planned.',
      sport: 'Padel',
      source: 'Padel Magazine',
      imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      url: '#',
    },
    {
      id: '6',
      title: 'NFL Draft: Top Prospects and Team Predictions',
      summary: 'Breaking down the most anticipated picks for this year\'s draft.',
      sport: 'Football',
      source: 'NFL Network',
      imageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      url: '#',
    },
    {
      id: '7',
      title: 'Cricket World Cup: India vs Australia Preview',
      summary: 'Two powerhouses set to clash in what promises to be an epic encounter.',
      sport: 'Cricket',
      source: 'Cricbuzz',
      imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      url: '#',
    },
    {
      id: '8',
      title: 'Golf Masters: Tiger Woods Makes Stunning Comeback',
      summary: 'The legend returns to form with an incredible round at Augusta.',
      sport: 'Golf',
      source: 'Golf Digest',
      imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      url: '#',
    },
  ];
  
  return news;
};

// Live scores data (mock - can be replaced with real API)
const getLiveScores = () => {
  const scores = [
    {
      id: 'live1',
      sport: 'Basketball',
      league: 'NBA',
      status: 'LIVE',
      quarter: 'Q3 5:42',
      homeTeam: { name: 'Lakers', score: 78, logo: '🏀' },
      awayTeam: { name: 'Celtics', score: 82, logo: '🏀' },
    },
    {
      id: 'live2',
      sport: 'Football',
      league: 'Premier League',
      status: 'LIVE',
      quarter: '67\'',
      homeTeam: { name: 'Man City', score: 2, logo: '⚽' },
      awayTeam: { name: 'Arsenal', score: 1, logo: '⚽' },
    },
    {
      id: 'live3',
      sport: 'Tennis',
      league: 'Wimbledon',
      status: 'LIVE',
      quarter: 'Set 3',
      homeTeam: { name: 'Djokovic', score: '6-4, 3-6, 4-3', logo: '🎾' },
      awayTeam: { name: 'Alcaraz', score: '4-6, 6-3, 3-4', logo: '🎾' },
    },
    {
      id: 'final1',
      sport: 'Basketball',
      league: 'NBA',
      status: 'FINAL',
      quarter: 'Final',
      homeTeam: { name: 'Warriors', score: 112, logo: '🏀' },
      awayTeam: { name: 'Suns', score: 108, logo: '🏀' },
    },
  ];
  
  return scores;
};

// @route   GET /api/news
// @desc    Get sports news
router.get('/', auth, async (req, res) => {
  try {
    const { sport } = req.query;
    let news = getSportsNews();
    
    if (sport && sport !== 'all') {
      news = news.filter(item => item.sport.toLowerCase() === sport.toLowerCase());
    }
    
    res.json({ news });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
});

// @route   GET /api/news/scores
// @desc    Get live scores
router.get('/scores', auth, async (req, res) => {
  try {
    const scores = getLiveScores();
    res.json({ scores });
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ message: 'Failed to fetch scores' });
  }
});

module.exports = router;
