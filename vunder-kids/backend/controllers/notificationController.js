const Notification = require('../models/Notifiication');
const User = require('../models/User');

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

module.exports={
    allNotification
}