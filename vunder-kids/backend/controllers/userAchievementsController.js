// userAchievementsController.js
const Progress = require("../models/Progress");
const User = require("../models/User");
const UserAchievement = require("../models/UserAchievement");
const Achievements = require("../models/Achievement"); // Import static achievements

const updateUserAchievements = async (userId) => {
  try {
    // Find the user and populate their progress
    const user = await User.findById(userId).populate("progress");
    if (!user || !user.progress) {
      throw new Error("User or user progress not found");
    }

    // Find the progress document
    const progress = await Progress.findById(user.progress).populate(
      "userAchievements"
    );
    if (!progress) {
      throw new Error("Progress not found");
    }

    // Find or create UserAchievement document
    let userAchievements = await UserAchievement.findById(progress.userAchievements);
    if (!userAchievements) {
      userAchievements = new UserAchievement({
        achievements: [] // Initialize with empty achievements array
      });
    }
    
    // Determine which achievements the user has earned
    for (const achievement of Achievements) {
      if (progress.overallScore >= achievement.score) {
        // Check if the achievement is already in the user's list
        const existingAchievement = userAchievements.achievements.find(
          (a) => a.title === achievement.title
        );
        
        if (!existingAchievement) {
          // Add new achievement based on title comparison
          userAchievements.achievements.push({
            title: achievement.title, // Store title
            completedDate: new Date(),
          });
        }
      }
    }
    
    // Save updated achievements
    await userAchievements.save();
    return { message: "User achievements updated successfully", userAchievements };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  updateUserAchievements
};