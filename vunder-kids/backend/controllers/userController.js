const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Notification = require("../models/Notifiication");

// console.log(process.env.EMAIL);
// console.log(process.env.APP_PASSWORD);
//  For the Unique Name
const { v4: uuidv4 } = require("uuid");
const { bufferToStream,cloudinary } = require("../config/cloudinary");
const Progress = require("../models/Progress");
// Middleware to generate unique username
const generateUniqueUserName = (displayName) => {
  const shortUuid = uuidv4().split("-")[0];
  return `${displayName}-${shortUuid}`;
};

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const generateToken = (id, isVerified) => {
  return jwt.sign({ id, isVerified }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = "User already exists change the e-mail";
      res.status(400).json({ error });
    }

    const progress = await Progress.create({
      overallScore: 0,
      totalMatches: 0,
      matchesWon: 0,
      sportScores: [], 
      userAchievements: []
    });


    const user = await User.create({
      email,
      password,
      progress: progress._id
    });

    if (user) {
      const token = generateToken(user._id, user.isVerified);
      // console.log(token);
      res.status(201).json({
        _id: user._id,
        email: user.email,
        token,
      });
    } else {
      const error = new Error("Invalid user data");
      error.status = 400;
      throw error;
    }
  } catch (e) {
    // console.log(e);
    // const error = "Server Error";
    next(e);
  }
};

// Login The User //
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // If validation passes, send the user details and token
    // console.log(user);
    if(!user.isVerified){
      return res.json({
        success: false,
        message:"We have sent a verification email to your email address. Please verify your email to login.",
        });
    }
    return res.json({
      success: true,
      _id: user._id,
      userName: user.userName,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      token: generateToken(user._id, user.isVerified),
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    next(error); // Pass error to global error handler
  }
};


const sendVerificationEmail = async (req, res, next) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    const verificationToken = generateToken(); // A function to generate a unique token
    user.verifyToken = verificationToken;
    user.tokenExpiration = Date.now() + 3600000; // 1 hour expiration
   
    await user.save();
    await transporter.sendMail({
      to: user.email,
      subject: "Verify Your Email",
      text:`Hey ${user.userName},\n\nWelcome to Fisiko! We're excited that Fisiko is now a part of your sports journey.\n\nClick here to confirm your email address and get started: ${process.env.EMAIL_URL}/api/verify-email/${verificationToken}\n\nHave fun playing sports!\n\nSee you soon!\n\nThe Fisiko Team`,
    });

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const verifyEmail = async (req, res, next) => {
  const token = req.params.token;
  try {
    const user = await User.findOne({
      verifyToken: token,
      tokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error("Invalid or expired token");
      error.status = 400;
      throw error;
    }

    user.verifyToken = undefined;
    user.tokenExpiration = undefined;
    user.isVerified = true;

    await user.save();
    // console.log(user);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};
const checkVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Replace with your user identification logic

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // console.log(user);

    res.status(200).json({ isVerified: user.isVerified });
  } catch (error) {
    // console.log(error);
    next(error);
  }
};

const requestResetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a verification token
    const token = crypto.randomBytes(32).toString("hex");

    // Send email
    const resetLink = `${process.env.FRONTEND_URL}/reEnter-password/${token}`;
    await transporter.sendMail({
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hey ${user.userName},</p>
        <p>Looks like you forgot your password. No worries, it happens to the best of us because there are too many passwords to remember!!!</p>
        <p>No panic! Password security features are in place to ensure the security of your profile information.</p>
        <p>To reset your password, please click the link below and follow the instructions provided.</p>
        <p><a href="${resetLink}">Click here to reset your password.</a></p>
        <p>This link will remain active for the next 3 hours.</p>
        <p>Please do not reply to this e-mail.</p>
        <p>Your Fisiko Team!</p>
      `,
    });    
    // Save the token and expiration time to the user record
    user.verifyToken = token;
    user.tokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    return res.status(200).json({
      message: "Password reset email sent successfully",
      link: resetLink, // Send the link in the response for debugging purposes (optional)
    });
  } catch (error) {
    console.error("Error sending reset email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const resetPassword = async (req, res) => {
  const { token } = req.params; // Extract token from URL
  const { newPassword } = req.body; // Get new password from the request body

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  try {
    // Find the user with the token
    const user = await User.findOne({ verifyToken: token });

    if (!user || user.tokenExpiration < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    // const salt = await bcrypt.genSalt(10);
    user.password = newPassword;

    // Clear the token and expiration
    user.verifyToken = null;
    user.tokenExpiration = null;

    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
//  fetching the inforamtion of the user by his id

const userInfo = async (req, res) => {
  try {
    let userId = req.params.id;
    let user = null;

    if (userId === "myInfo") {
      userId = req.user.id;
      user = await User.findById(userId)
      .populate({
        path: 'following',
        select: 'avatar userName name followers',
        transform: (doc) => doc ? {
          ...doc.toObject(),
          followers: doc.followers.length
        } : null
      })
      .populate({
        path: 'followers',
        select: 'avatar userName name followers',
        transform: (doc) => doc ? {
          ...doc.toObject(),
          followers: doc.followers?.length
        } : null
      })
      .populate({
        path:'progress',
        populate:{path : 'sportScores.sport',select: 'name _id'}
      })
      .select('-password -matchIds -teamIds');
    } else if (userId) {
      user = await User.findById(userId, "-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const getByUsername = async (req, res) => {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({ message: "Username not provided" });
    }

    const user = await User.findOne({ userName: username },'_id name userName location avatar following totalMatches wonMatches passions bio').populate({
      path: 'followers',
      select:'name avatar'
    })
    .populate({
      path:'progress',
      populate:{path : 'sportScores.sport',select: 'name _id'}
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let followedBy = [];
    if (req.user) {
      const myuser = await User.findById(req.user.id).select('following');
      if (myuser.userName !== username) {
        // Find common followers (intersection of both followers and myuser.following)
        followedBy = user.followers.filter(follower =>
          (myuser.following.includes(follower._id) && follower._id !== req.user.id)
        ).slice(0, 3); // Limit to 3
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      userName: user.userName,
      avatar: user.avatar,
      totalMatches: user.totalMatches,
      wonMatches: user.wonMatches,
      following: user.following.length,
      followers: user.followers.length,
      location: user.location,
      passions:user.passions,
      bio:user.bio,
      progress:user.progress,
      industry:user.industry,
      followedBy,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
};


//  To get the User Id Form the Token in the localStorage //

const getUserId = async (req, res) => {
  try {
    let userId = req.user.id;
    const client = await User.findById(userId).select("-password");
    const profileCompletion = client.getProfileCompletion();
    res.json({
      msg: "Id of the user",
      client,
      profileCompletion: profileCompletion.toFixed(2),
      success: true,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid Token" });
    } else {
      return res.status(400).json({ error: error.message });
    }
  }
};

const checkUsername = async (req, res) => {
  const { userName } = req.query;

  try {
    // Check if the username already exists in the database
    const user = await User.findOne({ userName });

    if (user) {
      return res.json({ isAvailable: false });
    } else {
      return res.json({ isAvailable: true });
    }
  } catch (error) {
    console.error("Error checking username:", error);
    res
      .status(500)
      .json({ message: "An error occurred while checking username." });
  }
};

const inviteUser = async (req, res, next) => {
  const { email } = req.body;
  const inviterId = req.user.id;

  try {
    const inviteLink = `${process.env.CORS_ORIGIN}/register/${inviterId}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Join Our Platform</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; border-radius: 5px; padding: 20px; text-align: center;">
          <h1 style="color: #2c3e50;">You're Invited!</h1>
          <p style="font-size: 16px;">You've been invited to join our amazing platform.</p>
          <div style="margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #3498db; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Join Now</a>
          </div>
          <p style="font-size: 14px; color: #7f8c8d;">This invitation expires in 7 days.</p>
        </div>
        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #95a5a6;">
          <p>If you didn't request this invitation, please ignore this email.</p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      to: email,
      subject: "You're invited to join our platform!",
      html: htmlContent,
    });

    res.status(200).json({ message: "Invitation sent successfully" });
  } catch (error) {
    next(error);
  }
};

const aboutUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { userName, name, location, age, gender,industry,bio } = req.body;
    // console.log(req.body);
    // Validate required fields
    if (!userName || !name || !location) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled." });
    }

    // Validate gender
    const allowedGenders = ["male", "female", "other", ""];
    if (!allowedGenders.includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value." });
    }

    // Update the user data
    user.userName = userName || user.userName;
    user.name = name || user.name;
    user.location = location || user.location;
    user.age = age || user.age;
    user.gender = gender || user.gender;
    user.industry = industry || user.industry;
    if(bio){
      user.bio = bio;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "User information updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error saving user data:", error.message);
    return res
      .status(500)
      .json({ error: "An error occurred while saving the user data." });
  }
};

const submitSports = async (req, res) => {
  try {
    const { selectedSports } = req.body;
    const userId = req.user.id; // Assumes user ID is in `req.user` (after authentication)

    if (!selectedSports || Object.keys(selectedSports).length === 0) {
      return res.status(400).json({ message: "No sports selected" });
    }

    // Prepare the passions array from selected sports and their skill levels
    const passions = Object.keys(selectedSports).map((sportName) => ({
      name: sportName,
      skillLevel: selectedSports[sportName],
    }));

    // Find the user by userId and update the passions field
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's passions field
    user.passions = passions;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Passion data saved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
const saveProfilePicture = async (req, res) => {
  const { imageUrl } = req.body;
  
  try {
    // Assuming you're using some kind of user authentication
    const result = await User.updateOne(
      { _id: req.user.id }, // Find user by ID
      { $set: { avatar: imageUrl } } // Update the avatar field
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Profile picture saved successfully" });
    } else {
      res.status(400).json({ message: "Failed to update profile picture" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving profile image" });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, '_id userName followers name avatar');
    const renamedUsers = users.map(user => ({
      _id: user._id,
      name: user.userName, // Rename 'userName' to 'name'
      followers:user.followers.length,
      realName:user.name,
      avatar:user.avatar
    }));
    res.json(renamedUsers);
  } catch (error) {
    next(error);
  }
};

const notificationToken=async(req,res)=>{
  const userId=req.user.id;
  const token=req.body.token
  // console.log("Here");
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update or remove the token
    user.notificationToken = token || null;
    await user.save();
    // console.log(user);

    res.status(200).json({ message: "Token updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const editUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user.id;
    const { 
      name, 
      userName, 
      location,
      bio,
      industry
    } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    // Update user fields if provided
    if (name) user.name = name;
    if (userName) {
      // Check if username is already taken
      const existingUser = await User.findOne({ userName });
      if (existingUser && existingUser._id.toString() !== userId) {
        const error = new Error('Username is already taken.');
        error.statusCode = 400;
        throw error;
      }
      user.userName = userName;
    }
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if(industry) user.industry = industry;

    // Handle profile picture upload (similar to saveProfilePicture logic)
    if (req.file) {
      const stream = bufferToStream(req.file.buffer);
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'profile_pictures',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        stream.pipe(uploadStream);
      });

      const uploadMediaRes = await uploadPromise;
      user.avatar = uploadMediaRes.secure_url;
    }

    // Save updated user
    const updatedUser = await user.save();

    res.status(200).json({
      message: 'User profile updated successfully!'
    });
  } catch (err) {
    console.log(err);
    next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
};

module.exports = {
  registerUser,
  loginUser,
  requestResetPassword,
  resetPassword,
  getUserId,
  verifyEmail,
  sendVerificationEmail,
  userInfo,
  inviteUser,
  checkUsername,
  checkVerification,
  aboutUser,
  submitSports,
  saveProfilePicture,
  getAllUsers,
  getByUsername,
  notificationToken,
  editUser
};
