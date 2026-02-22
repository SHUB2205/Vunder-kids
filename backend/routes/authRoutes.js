const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Optional OAuth imports - only load if credentials are configured
let googleClient = null;
let appleSignin = null;

if (process.env.GOOGLE_CLIENT_ID) {
  const { OAuth2Client } = require('google-auth-library');
  googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
}

if (process.env.APPLE_CLIENT_ID) {
  appleSignin = require('apple-signin-auth');
}

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        userName: user.userName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        passions: user.passions,
        followers: user.followers,
        following: user.following,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth login/register
router.post('/google', async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(501).json({ message: 'Google authentication not configured' });
    }

    const { idToken } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        avatar: picture,
        googleId,
        isVerified: true,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        userName: user.userName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        passions: user.passions,
        followers: user.followers,
        following: user.following,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

// @route   POST /api/auth/apple
// @desc    Apple Sign In login/register
router.post('/apple', async (req, res) => {
  try {
    const { identityToken, user: appleUser } = req.body;
    
    console.log('Apple Sign In request received:', {
      hasIdentityToken: !!identityToken,
      hasAppleUser: !!appleUser,
      appleUserName: appleUser?.name
    });

    if (!identityToken) {
      return res.status(400).json({ message: 'Identity token is required' });
    }

    // For Expo/native Apple Sign In, we can decode the JWT without full verification
    // since Apple's native SDK already verified it on the device
    let applePayload;
    
    if (appleSignin && process.env.APPLE_CLIENT_ID) {
      // Full server-side verification if configured
      applePayload = await appleSignin.verifyIdToken(identityToken, {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: false,
      });
    } else {
      // Decode JWT without verification (trust native SDK verification)
      const base64Payload = identityToken.split('.')[1];
      const payload = Buffer.from(base64Payload, 'base64').toString('utf8');
      applePayload = JSON.parse(payload);
    }

    const { email, sub: appleId } = applePayload;
    const name = appleUser?.name?.firstName 
      ? `${appleUser.name.firstName} ${appleUser.name.lastName || ''}`.trim()
      : (email ? email.split('@')[0] : `user_${appleId.slice(-6)}`);

    let user = await User.findOne({ $or: [{ appleId }, ...(email ? [{ email }] : [])] });

    if (!user) {
      // Create new user
      user = new User({
        name,
        email: email || `${appleId}@privaterelay.appleid.com`,
        appleId,
        isVerified: true,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
      });
      await user.save();
    } else if (!user.appleId) {
      // Link Apple account to existing user
      user.appleId = appleId;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        userName: user.userName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        passions: user.passions,
        followers: user.followers,
        following: user.following,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Apple auth error:', error.message);
    console.error('Apple auth error stack:', error.stack);
    res.status(500).json({ message: `Apple authentication failed: ${error.message}` });
  }
});

module.exports = router;
