const User = require("../models/User");

const userName=async(req,res)=>{
    const  newUserName  = req.body.userName;
    const userId = req.user.id;
  
    try {
      // Check if the new username already exists
      const existingUser = await User.findOne({ userName: newUserName });
      if (existingUser) {
        return res.json({ msg: 'Username already taken' ,success,role:"warning"});
      }
  
      // Update the user's username
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' ,role:"warning"});
      }
  
      user.userName = newUserName;
      await user.save();
      success=true;
     res.json({ msg: 'Username changed' ,success,user,role:"success"});
    } catch (error) {
      console.error(error);
      res.json({ msg: error.message,success,role:"warning" });
    }
}

module.exports = {
    userName
  };
  