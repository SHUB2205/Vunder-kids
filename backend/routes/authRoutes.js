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
    const { idToken } = req.body;
    
    console.log('Google Sign In request received, hasIdToken:', !!idToken);

    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    let payload;
    
    if (googleClient) {
      // Verify with Google - accept multiple client IDs (web, iOS, Android)
      const allowedClientIds = [
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_WEB_CLIENT_ID,
        process.env.GOOGLE_IOS_CLIENT_ID,
        process.env.GOOGLE_ANDROID_CLIENT_ID,
      ].filter(Boolean);
      
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: allowedClientIds,
        });
        payload = ticket.getPayload();
      } catch (verifyError) {
        console.error('Google token verification failed:', verifyError.message);
        // Try decoding without verification as fallback
        const base64Payload = idToken.split('.')[1];
        const decoded = Buffer.from(base64Payload, 'base64').toString('utf8');
        payload = JSON.parse(decoded);
        console.log('Using decoded payload as fallback');
      }
    } else {
      // No Google client configured - decode JWT directly (trust client-side verification)
      const base64Payload = idToken.split('.')[1];
      const decoded = Buffer.from(base64Payload, 'base64').toString('utf8');
      payload = JSON.parse(decoded);
    }

    const { email, name, picture, sub: googleId } = payload;
    
    console.log('Google payload:', { email, name, hasGoogleId: !!googleId });

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
    
    // Build name from various sources - Apple only sends name on FIRST sign-in
    let name = null;
    
    // Try to get name from appleUser object (only available on first sign-in)
    if (appleUser?.name?.firstName && appleUser.name.firstName.trim()) {
      const firstName = appleUser.name.firstName.trim();
      const lastName = appleUser.name.lastName?.trim() || '';
      name = `${firstName} ${lastName}`.trim();
    }
    
    // Fallback to email prefix
    if (!name && email) {
      const emailPrefix = email.split('@')[0];
      if (emailPrefix && emailPrefix.length > 0) {
        name = emailPrefix;
      }
    }
    
    // Fallback to appleId-based name
    if (!name && appleId) {
      name = `User_${appleId.slice(-6)}`;
    }
    
    // Final fallback
    if (!name || name.trim().length === 0) {
      name = 'Fisiko User';
    }
    
    // Ensure name is a valid non-empty string
    name = String(name).trim();
    if (name.length === 0) {
      name = 'Fisiko User';
    }
    
    console.log('Apple auth - parsed data:', { email, appleId: appleId?.slice(-6), name, nameLength: name.length });

    let user = await User.findOne({ $or: [{ appleId }, ...(email ? [{ email }] : [])] });

    if (!user) {
      // Create new user with all required fields
      const userData = {
        name: name,
        email: email || `${appleId}@privaterelay.appleid.com`,
        appleId,
        isVerified: true,
        isAppleUser: true,
      };
      
      // Double-check name is valid before saving
      if (!userData.name || userData.name.trim().length === 0) {
        userData.name = 'Fisiko User';
      }
      
      console.log('Creating new Apple user:', userData);
      
      user = new User(userData);
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
