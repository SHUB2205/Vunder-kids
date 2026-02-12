const express = require('express');
const router = express.Router();
const axios = require('axios');

// API-SPORTS configuration
const API_KEY = process.env.API_SPORTS_KEY || '';
const API_HOST = 'v1.cricket.api-sports.io';

// Sport API hosts mapping
const SPORT_HOSTS = {
  cricket: 'v1.cricket.api-sports.io',
  football: 'v3.football.api-sports.io',
  basketball: 'v1.basketball.api-sports.io',
  baseball: 'v1.baseball.api-sports.io',
  rugby: 'v1.rugby.api-sports.io',
  tennis: 'v1.tennis.api-sports.io',
};

// Get live scores for a sport
router.get('/live/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const host = SPORT_HOSTS[sport.toLowerCase()] || SPORT_HOSTS.cricket;
    
    // If no API key, return mock data
    if (!API_KEY) {
      return res.json({
        success: true,
        data: getMockLiveData(sport),
      });
    }

    const response = await axios.get(`https://${host}/games`, {
      params: { live: 'all' },
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': host,
      },
    });

    res.json({
      success: true,
      data: response.data.response || [],
    });
  } catch (error) {
    console.error('Error fetching live scores:', error.message);
    res.json({
      success: true,
      data: getMockLiveData(req.params.sport),
    });
  }
});

// Get scheduled matches for a sport on a specific date
router.get('/scheduled/:sport/:date', async (req, res) => {
  try {
    const { sport, date } = req.params;
    const host = SPORT_HOSTS[sport.toLowerCase()] || SPORT_HOSTS.cricket;
    
    // If no API key, return mock data
    if (!API_KEY) {
      return res.json({
        success: true,
        data: getMockScheduledData(sport, date),
      });
    }

    const response = await axios.get(`https://${host}/games`, {
      params: { date },
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': host,
      },
    });

    res.json({
      success: true,
      data: response.data.response || [],
    });
  } catch (error) {
    console.error('Error fetching scheduled scores:', error.message);
    res.json({
      success: true,
      data: getMockScheduledData(req.params.sport, req.params.date),
    });
  }
});

// Mock data generators for when API is not available
function getMockLiveData(sport) {
  const teams = {
    cricket: [
      { team1: 'India', team2: 'Australia', score1: '287/4', score2: '156/2', status: 'Live' },
      { team1: 'England', team2: 'South Africa', score1: '312/8', score2: '-', status: 'Live' },
    ],
    football: [
      { team1: 'Manchester United', team2: 'Liverpool', score1: '2', score2: '1', status: 'Live' },
      { team1: 'Real Madrid', team2: 'Barcelona', score1: '1', score2: '1', status: 'Live' },
    ],
    basketball: [
      { team1: 'Lakers', team2: 'Warriors', score1: '98', score2: '102', status: 'Live' },
    ],
    tennis: [
      { team1: 'Djokovic', team2: 'Nadal', score1: '6-4, 3-2', score2: '4-6, 2-3', status: 'Live' },
    ],
  };

  const sportTeams = teams[sport.toLowerCase()] || teams.cricket;
  return sportTeams.map((match, idx) => ({
    id: `live_${sport}_${idx}`,
    teams: {
      home: { name: match.team1, logo: null },
      away: { name: match.team2, logo: null },
    },
    scores: {
      home: { total: match.score1 },
      away: { total: match.score2 },
    },
    status: { long: match.status },
    league: { name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} League`, logo: null },
  }));
}

function getMockScheduledData(sport, date) {
  const teams = {
    cricket: [
      { team1: 'Pakistan', team2: 'New Zealand', time: '10:00 AM' },
      { team1: 'West Indies', team2: 'Sri Lanka', time: '2:00 PM' },
    ],
    football: [
      { team1: 'Chelsea', team2: 'Arsenal', time: '3:00 PM' },
      { team1: 'Bayern Munich', team2: 'Dortmund', time: '5:30 PM' },
    ],
  };

  const sportTeams = teams[sport.toLowerCase()] || teams.cricket;
  return sportTeams.map((match, idx) => ({
    id: `scheduled_${sport}_${idx}`,
    teams: {
      home: { name: match.team1, logo: null },
      away: { name: match.team2, logo: null },
    },
    date: date,
    time: match.time,
    status: { long: 'Scheduled' },
    league: { name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} League`, logo: null },
  }));
}

module.exports = router;
