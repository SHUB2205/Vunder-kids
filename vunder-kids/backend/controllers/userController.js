const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,  
    pass: process.env.APP_PASSWORD
  }
});

const generateToken = (id) => {
  return jwt.sign({ id }, 'your_jwt_secret', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { name, school, class: userClass, email, phoneNumber, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
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
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendVerificationEmail = async (req, res, next) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');

    const user = await User.findOne({ email : req.body.email });
    if (!user) {
      return res.status(404).json({ error: 'No account with that user ID found.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified.' });
    }

    user.verifyToken = token;
    user.tokenExpiration = Date.now() + 3600000;
    await user.save();

    await transporter.sendMail({
      to: user.email,
      subject: 'Email Verification',
      html: `
        <p>Click this <a href="http://localhost:5000/api/verify-email/${token}">link</a> to verify your email address.</p>
      `
    });

    return res.status(200).json({ message: 'Verification email sent successfully.' });
  }
  catch (error) {
    console.error('Error sending verification email:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const verifyEmail = async (req, res, next) => {
  const token = req.params.token;
  try {
    let user = await User.findOne({ verifyToken: token, tokenExpiration: { $gt: Date.now() } });
    if (!user) {
      throw new Error('Invalid or expired token');
    }

    user.verifyToken = undefined;
    user.tokenExpiration = undefined;
    user.isVerified = true;

    user = await user.save();

    return res.status(200).json({ message: 'Email verified successfully'});
  }
  catch (err) {
    console.error('Error verifying email:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = { registerUser, loginUser , verifyEmail , sendVerificationEmail };
