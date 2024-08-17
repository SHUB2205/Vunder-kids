const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const Notification = require('../models/Notifiication');
const Progress = require('../models/Progress')

//  For the Unique Name
const { v4: uuidv4 } = require('uuid');
// Middleware to generate unique username
const generateUniqueUserName = (displayName) => {
  const shortUuid = uuidv4().split('-')[0];
  return `${displayName}-${shortUuid}`;
};


const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD
  }
});

const generateToken = (id, isVerified) => {
  return jwt.sign({ id, isVerified }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res, next) => {
  const { name, school, userClass  , email, phoneNumber, password } = req.body;
  const invitedBy = req.params.userid;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
      // const error = new Error('Validation failed');
      // error.status = 422;
      // error.data = errors.array();
      // throw error;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error('User already exists');
      error.status = 400;
      throw error;
    }
    const userName = generateUniqueUserName(name);
    const user = await User.create({
      userName,
      name,
      school,
      userClass,
      email,
      phoneNumber,
      password,
      invitedBy: invitedBy || null, // Set invitedBy if provided, otherwise null
    });

    if (user) {
      await Notification.create({
        user: user._id,
        type: 'user',
        message: `You were registered with Email ${user.email}.`,
      });
      res.status(201).json({
        _id: user._id,
        userName:user.userName,
        name: user.name,
        email: user.email,
      });
    } else {
      const error = new Error('Invalid user data');
      error.status = 400;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};


// Login The User //
const loginUser = async (req, res,next) => {
  const { email, password } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.status = 422;
      error.data = errors.array();
      throw error;
    }

    const user = await User.findOne({ email });
    if (!user) {  
      const error = new Error('User not found');
      error.status = 401;
      throw error;
    }

    if (!(await user.matchPassword(password))) {
      const error = new Error('Invalid password');
      error.status = 401;
      throw error;
    }

    res.json({
      _id: user._id,
      userName:user.userName,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      token: generateToken(user._id, user.isVerified)
    });
  } catch (error) {
    next(error);
  }
};

const sendVerificationEmail = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.status = 422;
      error.data = errors.array();
      throw error;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      const error = new Error('No account with that email found');
      error.status = 404;
      throw error;
    }

    if (user.isVerified) {
      const error = new Error('User is already verified');
      error.status = 400;
      throw error;
    }

    user.verifyToken = token;
    user.tokenExpiration = Date.now() + 3600000; //1 hour
    await user.save();

    const verificationLink = `${BACKEND_URL}/api/verify-email/${token}`;

    await transporter.sendMail({
      to: user.email,
      subject: 'Email Verification',
      html: `
        <p>Please click this <a href="${verificationLink}">link</a> to verify your email address.</p>
      `
    });

    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    next(error);
  }
};


const verifyEmail = async (req, res, next) => {
  const token = req.params.token;
  try {
    const user = await User.findOne({ 
      verifyToken: token, 
      tokenExpiration: { $gt: Date.now() } 
    });

    if (!user) {
      const error = new Error('Invalid or expired token');
      error.status = 400;
      throw error;
    }

    user.verifyToken = undefined;
    user.tokenExpiration = undefined;
    user.isVerified = true;

    // Create a new Progress document
    const progress = await Progress.create({ overallScore: 0, sportScores: [] , userAchievements : [] });
    user.progress = progress._id;

    // Check if the user was invited and update scores
    if (user.invitedBy) {
      const inviter = await User.findById(user.invitedBy).populate('progress');
      if (inviter) {

        // Update inviter's score
        inviter.progress.overallScore += 15;
        await inviter.progress.save();

        // Update invited user's score
        progress.overallScore += 5;
        await progress.save();

        // Create notifications for both users
        await Notification.create({
          user: inviter._id,
          type: 'invitation',
          message: `You earned 5 points for inviting ${user.name}.`,
        });

        await Notification.create({
          user: user._id,
          type: 'invitation',
          message: `You earned 15 points for joining through an invitation.`,
        });
      }
    }

    await user.save();
    await Notification.create({
      user: user._id,
      type: 'user',
      message: `Your email ${user.email} was verified.`,
    });
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

const requestResetPassword = async (req, res) => {

  const { id } = req.user;

  try {

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a verification token
    const token = crypto.randomBytes(32).toString("hex");
    console.log(token);
    // Send email
    await transporter.sendMail({
      // to check
      to: req.body.email, 
      // to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Click this <a href="http://localhost:5000/api/reset-password/${token}">link</a> to reset your password.</p>
      `,
    });
    
    // Token valid fo 1 hour
    user.verifyToken = token;
    user.tokenExpiration = Date.now() + 3600000;
    await user.save();



    return res
      .status(200)
      .json({ message: "Password reset email sent successfully" ,link:`http://localhost:5000/api/reset-password/${token}`});
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  // Extract token from URL
  const { token } = req.params;
  console.log(token);
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  try {

    // This is set by the isAuth middleware
    const { id } = req.user;
    const user = await User.findById(id);


    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find user associated with the token
    const tokenExpiration = user.tokenExpiration;
    const verifyToken=user.verifyToken;
    if (!verifyToken || tokenExpiration < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password 
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Remove the token from database
    // error in this line
    //  user.verifyToken;
    // await user.save();
    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//  To get the User Id Form the Token in the localStorage //

const userId = async (req, res) => {
  try {
    let userId = req.user.id;
    const client = await User.findById(userId).select("-password");
    res.json({ msg: "Id of the user", client, success: true });
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
      html: htmlContent
    });

    res.status(200).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  registerUser,
  loginUser,
  requestResetPassword,
  resetPassword,
  userId,
  verifyEmail,
  sendVerificationEmail,
  inviteUser
};