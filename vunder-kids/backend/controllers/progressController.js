const Progress = require("../models/Progress");
const User = require("../models/User");
const Match = require("../models/Match");
const Team = require("../models/Team");
const Sport = require("../models/Sport");
//  userAchievements
const { updateUserAchievements } = require("../controllers/userAchievementsController");

// Update user progress
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
const updateScore = async (req, res) => {
  try {
    const { matchId, winnerTeamId } = req.body;
    const userId = req.user.id; // Get userId from authenticated user

    // Find the match and populate related teams and sport
    const match = await Match.findById(matchId)
      .populate("teams.team")
      .populate("sport");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Verify that the winnerTeamId matches the match winner
    if (!match.winner || !match.winner.equals(winnerTeamId)) {
      return res
        .status(400)
        .json({
          message: "The specified team is not the winner of this match",
        });
    }

    // Check if the user is part of the winning team
    const winningTeam = match.teams.find((t) =>
      t.team._id.equals(winnerTeamId)
    );
    if (!winningTeam) {
      return res
        .status(404)
        .json({ message: "Winning team not found in match" });
    }

    // Find the user in the winning team's participants
    const userInTeam = winningTeam.team.participants.some((p) =>
      p.user.equals(userId)
    );
    if (!userInTeam) {
      return res
        .status(403)
        .json({ message: "User is not part of the winning team" });
    }

    // Find the user and their associated progress
    let user = await User.findById(userId).populate("progress");
    let progress = user.progress
      ? await Progress.findById(user.progress._id)
      : null;

    if (!progress) {
      // Create new progress if it does not exist
      progress = new Progress({
        user: userId, // Associate the progress with the user
        overallScore: 10, // Start with the initial score
        sportScores: [], // Initialize with an empty array
      });
      // Update the user's progress reference
      user.progress = progress._id;
      await user.save();
    } else {
      // Increase the user's overall score by 10
      progress.overallScore += 10;
    }

    // Update or add sport score
    const sport = match.sport;
    let sportScore = progress.sportScores.find((s) =>
      s.sport.equals(sport._id)
    );
    if (sportScore) {
      // Update existing sport score
      sportScore.score += 10; // Increase score by 10
    } else {
      // Add new sport score
      progress.sportScores.push({
        sport: sport._id,
        score: 10,
      });
    }

    // Save updated progress
    await progress.save();


    // Update user achievements
    const achievementsUpdate = await updateUserAchievements(userId);


    return res.status(200).json({
      message: "Score and sport scores updated successfully",
      progress,
      achievementsUpdate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  userProgress,
  updateScore,
};
