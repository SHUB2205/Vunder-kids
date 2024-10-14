const Progress = require("../models/Progress");
const User = require("../models/User");
const Match = require("../models/Match");
//  Do Not remove These
const Team = require("../models/Team");
const Sport = require("../models/Sport");
//  userAchievements
const { updateUserAchievements } = require("./userAchievementsController");

// get user progress
const userProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user and populate their progress
    const user = await User.findById(userId).populate({
      path: "progress",
      populate: {
        path: "userAchievements",
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has associated progress
    if (!user.progress) {
      return res
        .status(404)
        .json({ message: "Progress not found for this user" });
    }

    // Return the user's progress including achievements
    res.status(200).json(user.progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update score based on match results
const updateScore = async (matchId, winnerTeamId) => {
  try {
    // Find the match and populate related teams and sport
    const match = await Match.findById(matchId)
      .populate("teams.team")
      .populate("sport");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Verify that the winnerTeamId matches the match winner
    if (!match.winner || !match.winner.equals(winnerTeamId)) {
      return res.status(400).json({
        message: "The specified team is not the winner of this match",
      });
    }

    // Find all teams that participated in the match
    const allTeams = await Team.find({ _id: { $in: match.teams.map(t => t.team) } })
      .populate("participants.user");

    // Find the winning team
    const winningTeam = allTeams.find((team) => team._id.equals(winnerTeamId));
    if (!winningTeam) {
      return res.status(404).json({ message: "Winning team not found" });
    }

    // Iterate through each team to update participants
    const updatePromises = allTeams.map(async (team) => {
      const isWinningTeam = team._id.equals(winnerTeamId); // Check if this is the winning team

      // Iterate through each participant in the current team
      return Promise.all(
        team.participants.map(async (participant) => {
          const participantId = participant.user._id;

          // Find the user and their progress
          let user = await User.findById(participantId).populate("progress");

          // Update or create progress record
          let progress = user.progress
            ? await Progress.findById(user.progress._id)
            : null;

          if (!progress) {
            // Create new progress if it does not exist
            progress = new Progress({
              user: participantId,
              overallScore: isWinningTeam ? 10 : 0, // Add score only for the winning team
              sportScores: [],
            });
            user.progress = progress._id;
          } else {
            // Increase overall score for winning team
            if (isWinningTeam) {
              progress.overallScore += 10;
            }
          }

          // Update or add sport score
          const sport = match.sport;
          let sportScore = progress.sportScores.find((s) =>
            s.sport.equals(sport._id)
          );
          if (sportScore) {
            // Update existing sport score
            if (isWinningTeam) sportScore.score += 10; // Increase score by 10 only for the winning team
          } else {
            // Add new sport score
            progress.sportScores.push({
              sport: sport._id,
              score: isWinningTeam ? 10 : 0,
            });
          }

          // Save updated progress
          await progress.save();

          // Update user fields for totalMatches and wonMatches
          user.totalMatches = (user.totalMatches || 0) + 1; // Increment total matches for everyone
          if (isWinningTeam) {
            user.wonMatches = (user.wonMatches || 0) + 1; // Increment won matches only for the winning team
          }
          await user.save();

          // Update user achievements if applicable
          const achievementsUpdate = await updateUserAchievements(participantId);

          return { user, progress, achievementsUpdate };
        })
      );
    });

    // Wait for all updates to complete
    const updatedResults = await Promise.all(updatePromises);

    return res.status(200).json({
      message: "Score, sport scores, and match statistics updated successfully for all team members",
      updatedResults,
    });
  } catch (error) {
    console.error("Error updating score:", error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  userProgress,
  updateScore,
};
