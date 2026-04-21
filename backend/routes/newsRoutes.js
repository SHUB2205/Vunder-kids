const express = require('express');
const axios = require('axios');
const router = express.Router();
const auth = require('../middleware/auth');

// ---------------------------------------------------------------------------
// Sports news aggregation: ESPN (no key) primary + NewsAPI.org fallback.
// In-memory cache with 10-minute TTL to avoid hammering upstreams.
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 10 * 60 * 1000;
const _cache = { news: { data: null, at: 0 }, scores: { data: null, at: 0 } };

// ESPN league endpoints → labelled for display
const ESPN_LEAGUES = [
  { sport: 'Basketball', league: 'NBA',            url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news' },
  { sport: 'Basketball', league: 'WNBA',           url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/news' },
  { sport: 'Football',   league: 'NFL',            url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/news' },
  { sport: 'Football',   league: 'College',        url: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/news' },
  { sport: 'Soccer',     league: 'Premier League', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news' },
  { sport: 'Soccer',     league: 'Champions Lg',   url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/news' },
  { sport: 'Soccer',     league: 'La Liga',        url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/news' },
  { sport: 'Baseball',   league: 'MLB',            url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news' },
  { sport: 'Hockey',     league: 'NHL',            url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/news' },
  { sport: 'Tennis',     league: 'ATP',            url: 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/news' },
  { sport: 'Tennis',     league: 'WTA',            url: 'https://site.api.espn.com/apis/site/v2/sports/tennis/wta/news' },
  { sport: 'Golf',       league: 'PGA',            url: 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/news' },
  { sport: 'Cricket',    league: 'ICC',            url: 'https://site.api.espn.com/apis/site/v2/sports/cricket/news' },
];

// ESPN scoreboard endpoints (for live/recent scores)
const ESPN_SCOREBOARDS = [
  { sport: 'Basketball', league: 'NBA',            url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',            emoji: '🏀' },
  { sport: 'Football',   league: 'NFL',            url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',               emoji: '🏈' },
  { sport: 'Soccer',     league: 'Premier League', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',                emoji: '⚽' },
  { sport: 'Baseball',   league: 'MLB',            url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',                emoji: '⚾' },
  { sport: 'Hockey',     league: 'NHL',            url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',                  emoji: '🏒' },
];

function pickImage(article) {
  if (!article.images || !article.images.length) return null;
  // Prefer medium-sized image
  const sorted = [...article.images].sort((a, b) => (b.width || 0) - (a.width || 0));
  const medium = sorted.find((img) => (img.width || 0) <= 800) || sorted[0];
  return medium?.url || null;
}

async function fetchEspnNews() {
  const results = await Promise.allSettled(
    ESPN_LEAGUES.map((entry) =>
      axios.get(entry.url, { timeout: 6000 }).then((r) => ({ entry, data: r.data }))
    )
  );

  const articles = [];
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    const { entry, data } = r.value;
    const items = data?.articles || data?.headlines || [];
    for (const a of items) {
      const link = a?.links?.web?.href || a?.links?.mobile?.href || a?.link || '#';
      articles.push({
        id: `espn_${entry.league}_${a.id || a.headline || Math.random().toString(36).slice(2)}`,
        title: a.headline || a.title,
        summary: a.description || a.caption || '',
        sport: entry.sport,
        league: entry.league,
        source: 'ESPN',
        imageUrl: pickImage(a),
        timestamp: a.published || a.lastModified || new Date().toISOString(),
        url: link,
      });
    }
  }

  // Dedupe by title
  const seen = new Set();
  const deduped = articles.filter((a) => {
    if (!a.title) return false;
    const key = a.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort newest first
  deduped.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return deduped;
}

async function fetchNewsApiFallback() {
  const key = process.env.NEWS_API_KEY;
  if (!key) return [];
  try {
    const res = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: { category: 'sports', language: 'en', pageSize: 50, apiKey: key },
      timeout: 6000,
    });
    const items = res.data?.articles || [];
    return items.map((a, i) => ({
      id: `newsapi_${i}_${a.publishedAt || ''}`,
      title: a.title,
      summary: a.description || '',
      sport: 'Sports',
      source: a.source?.name || 'NewsAPI',
      imageUrl: a.urlToImage,
      timestamp: a.publishedAt || new Date().toISOString(),
      url: a.url || '#',
    })).filter((a) => a.title);
  } catch (e) {
    console.error('NewsAPI fallback failed:', e.message);
    return [];
  }
}

async function getAggregatedNews() {
  const now = Date.now();
  if (_cache.news.data && now - _cache.news.at < CACHE_TTL_MS) {
    return _cache.news.data;
  }

  let news = [];
  try {
    news = await fetchEspnNews();
  } catch (e) {
    console.error('ESPN news fetch failed:', e.message);
  }

  if (news.length === 0) {
    news = await fetchNewsApiFallback();
  }

  if (news.length > 0) {
    _cache.news.data = news;
    _cache.news.at = now;
  }
  return news;
}

async function fetchEspnScores() {
  const results = await Promise.allSettled(
    ESPN_SCOREBOARDS.map((entry) =>
      axios.get(entry.url, { timeout: 6000 }).then((r) => ({ entry, data: r.data }))
    )
  );

  const scores = [];
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    const { entry, data } = r.value;
    const events = data?.events || [];
    for (const ev of events) {
      const comp = ev.competitions?.[0];
      if (!comp) continue;
      const home = comp.competitors?.find((c) => c.homeAway === 'home');
      const away = comp.competitors?.find((c) => c.homeAway === 'away');
      if (!home || !away) continue;

      const stateRaw = ev.status?.type?.state; // 'pre' | 'in' | 'post'
      let status = 'SCHEDULED';
      if (stateRaw === 'in') status = 'LIVE';
      else if (stateRaw === 'post') status = 'FINAL';

      scores.push({
        id: `espn_score_${ev.id}`,
        sport: entry.sport,
        league: entry.league,
        status,
        quarter: ev.status?.type?.shortDetail || ev.status?.type?.detail || '',
        homeTeam: {
          name: home.team?.shortDisplayName || home.team?.name,
          score: Number(home.score) || 0,
          logo: home.team?.logo || entry.emoji,
        },
        awayTeam: {
          name: away.team?.shortDisplayName || away.team?.name,
          score: Number(away.score) || 0,
          logo: away.team?.logo || entry.emoji,
        },
      });
    }
  }

  // Prioritise LIVE, then FINAL, then scheduled
  const order = { LIVE: 0, FINAL: 1, SCHEDULED: 2 };
  scores.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  return scores;
}

async function getAggregatedScores() {
  const now = Date.now();
  // Scores are more time-sensitive — 1 min cache
  if (_cache.scores.data && now - _cache.scores.at < 60 * 1000) {
    return _cache.scores.data;
  }
  let scores = [];
  try {
    scores = await fetchEspnScores();
  } catch (e) {
    console.error('ESPN scores fetch failed:', e.message);
  }
  if (scores.length > 0) {
    _cache.scores.data = scores;
    _cache.scores.at = now;
  }
  return scores;
}

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
// @desc    Get sports news (ESPN aggregated, NewsAPI fallback, mock last resort)
router.get('/', auth, async (req, res) => {
  try {
    const { sport, limit } = req.query;
    let news = await getAggregatedNews();

    // Last-resort fallback to mock if both ESPN and NewsAPI failed
    if (!news || news.length === 0) {
      news = getSportsNews();
    }

    if (sport && sport !== 'all') {
      news = news.filter((item) => item.sport?.toLowerCase() === sport.toLowerCase());
    }

    if (limit) {
      news = news.slice(0, parseInt(limit, 10));
    }

    res.json({ news });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
});

// @route   GET /api/news/scores
// @desc    Get live scores (ESPN aggregated, mock last resort)
router.get('/scores', auth, async (req, res) => {
  try {
    let scores = await getAggregatedScores();
    if (!scores || scores.length === 0) {
      scores = getLiveScores();
    }
    res.json({ scores });
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ message: 'Failed to fetch scores' });
  }
});

module.exports = router;
