const Progress = require("../models/Progress");
const User = require("../models/User");
const Match = require("../models/Match");
const UserAchievement = require("../models/UserAchievement");
const Achievement = require("../models/Achievement.js");

const updateUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from authenticated user

    // Find the user and populate their progress
    const user = await User.findById(userId).populate("progress");
    if (!user || !user.progress) {
      return res
        .status(404)
        .json({ message: "User or user progress not found" });
    }

    // Find the progress document
    const progress = await Progress.findById(user.progress).populate(
      "userAchievements"
    );
    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    // Fetch all achievements
    const achievements = await Achievement.find({});
    if (!achievements) {
      return res.status(404).json({ message: "Achievements not found" });
    }

    // Find or create UserAchievement document
    let userAchievements = await UserAchievement.findById(
      progress.userAchievements
    );
    if (!userAchievements) {
      userAchievements = new UserAchievement({
        _id: progress.userAchievements,
        achievements: [],
      });
    }

    // Determine which achievements the user has earned
    for (const achievement of achievements) {
      if (progress.overallScore >= achievement.score) {
        // Check if the achievement is already in the user's list
        const existingAchievement = userAchievements.achievements.find((a) =>
          a.achievement.equals(achievement._id)
        );

        if (!existingAchievement) {
          // Add new achievement
          userAchievements.achievements.push({
            achievement: achievement._id,
            completedDate: new Date(),
          });
        }
      }
    }

    // Save updated achievements
    await userAchievements.save();

    res
      .status(200)
      .json({
        message: "User achievements updated successfully",
        userAchievements,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  updateUserAchievements,
};
