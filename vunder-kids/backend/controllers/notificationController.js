const Notification = require('../models/Notifiication');
const User = require('../models/User');
const Match = require('../models/Match');
const allNotification=async(req,res)=>{
    try {
        const userId = req.user.id; // Assuming `req.user` is populated via middleware (e.g., `protect`)
    
        // Validate user existence
        const userExists = await User.findById(userId);
        if (!userExists) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
    
        // Fetch notifications for the user
        const notifications = await Notification.find({ user: userId })
          .sort({ createdAt: -1 }) // Sort notifications by newest first
          .exec();
        //   console.log(notifications);
        res.status(200).json({
          success: true,
        notifications,
        });
      } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
          success: false,
          message: "Server error while fetching notifications",
        });
      }
}

const allMatches = async (req, res) => {
    try {
      const userId = req.user.id; // Assuming `req.user` is populated via middleware (e.g., `protect`)
  
      // Validate user existence
      const userExists = await User.findById(userId);
      if (!userExists) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Fetch matches where the user is a player
      const matches = await Match.find({ players: userId })
        .sort({ date: -1 }) // Sort matches by date, newest first
        .exec();
  
      // If no matches found
      if (matches.length === 0) {
        return res.status(404).json({ success: false, message: "No matches found for the user" });
      }
    //   console.log(matches);
      res.status(200).json({
        success: true,
        matches,
      });
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching matches",
      });
    }
  };
  const markNotificationsAsRead = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Update all unread notifications for the user to read
      await Notification.updateMany(
        { user: userId, read: false }, 
        { $set: { read: true } }
      );
  
      res.status(200).json({
        success: true,
        message: "All notifications marked as read"
      });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res.status(500).json({
        success: false,
        message: "Server error while marking notifications as read"
      });
    }
  };
module.exports={
    allNotification,
    allMatches,
    markNotificationsAsRead
}