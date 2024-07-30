const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD
  }
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res, next) => {
  const { name, school, userClass  , email, phoneNumber, password } = req.body;
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

    const user = await User.create({
      name,
      school,
      userClass ,
      email,
      phoneNumber,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
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
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
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

    await user.save();

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


module.exports = {
  registerUser,
  loginUser,
  requestResetPassword,
  resetPassword,
  userId,
  verifyEmail,
  sendVerificationEmail
};