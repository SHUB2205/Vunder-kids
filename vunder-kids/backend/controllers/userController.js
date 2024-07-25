const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
  const { name, school, class: userClass, email, phoneNumber, password } = req.body;
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.status = 422;
      error.data = errors.array();
      throw error;
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
      class: userClass,
      email,
      phoneNumber,
      password
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

const loginUser = async (req, res, next) => {
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

module.exports = { registerUser, loginUser, verifyEmail, sendVerificationEmail };