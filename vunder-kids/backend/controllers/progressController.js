const Progress=require("../models/Progress");
const User = require('../models/User');
const Match=require("../models/Match");

//  userAchievements
const { updateUserAchievements} = require('../controllers/userAchievementsController');


// Route to get user progress
const userProgress = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Find the user to get the progress ID
      const user = await User.findById(userId).populate({
        path: 'progress',
        populate: {
          path: 'userAchievements'
        }
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the user has associated progress
      if (!user.progress) {
        return res.status(404).json({ message: 'Progress not found for this user' });
      }
  
      // Return the user's progress including achievements
      res.status(200).json(user.progress);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
// 1.Receive the match ID and winning team ID in the request.
// 2.Verify that the user is part of the winning team.
// 3.If the user is part of the winning team, increment their score by 10.
//  post request 
    // {
    //     "matchId": "MATCH_ID",
    //     "winnerTeamId": "WINNER_TEAM_ID"
    // }

const updateScore = async (req, res) => {
    try {
        const { matchId, winnerTeamId } = req.body;
        const userId = req.user.id; // Get userId from authenticated user

        // Find the match to verify the winner and get the teams
        const match = await Match.findById(matchId).populate('teams.team').populate('sport');
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Check if the winnerTeamId is indeed the winner of the match
        if (!match.winner || !match.winner.equals(winnerTeamId)) {
            return res.status(400).json({ message: 'The specified team is not the winner of this match' });
        }

        // Check if the user is part of the winning team
        const winningTeam = match.teams.find(t => t.team._id.equals(winnerTeamId));
        if (!winningTeam) {
            return res.status(404).json({ message: 'Winning team not found in match' });
        }

        // Find the user in the winning team's participants
        const userInTeam = winningTeam.team.participants.some(p => p.user.equals(userId));
        if (!userInTeam) {
            return res.status(403).json({ message: 'User is not part of the winning team' });
        }

        // Find or create the user's progress
        let progress = await Progress.findOne({ user: userId });

        if (!progress) {
            // Create new progress if it does not exist
            progress = new Progress({
                user: userId,
                overallScore: 10, // Start with the initial score
                sportScores: [] // Initialize with an empty array
            });
        } else {
            // Increase the user's overall score by 10
            progress.overallScore += 10;
        }

        // Update or add sport score
        const sport = match.sport; // Extract sport from the match
        let sportScore = progress.sportScores.find(s => s.sport.equals(sport._id));
        
        if (sportScore) {
            // Update existing sport score
            sportScore.score += 10; // Increase score by 10, adjust if needed
        } else {
            // Add new sport score
            progress.sportScores.push({
                sport: sport._id,
                score: 10
            });
        }

        // Save updated progress
        await progress.save();

        // calling the updateUserAchievements
        await updateUserAchievements(userId);

        return res.status(200).json({ message: 'Score and sport scores updated successfully', progress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
  userProgress,
  updateScore
};
