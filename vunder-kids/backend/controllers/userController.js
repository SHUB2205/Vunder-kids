const User = require('../models/User');
const jwt = require('jsonwebtoken');
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

//  Session For Reset Password  //

//  Sending The Verification mail for the reset
const requestResetPassword = async (req, res) =>{
  const { id } = req.user; // Extract user ID from the token payload

  try {
    const user = await User.findById(id); // Find user by ID
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a verification token
    const token = crypto.randomBytes(32).toString('hex');
    user.verifyToken = token;
    user.tokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send email
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>Click this <a href="http://localhost:5000/api/reset-password/${token}">link</a> to reset your password.</p>
      `
    });

    return res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const resetPassword = async (req, res) =>{
  const { token } = req.params; // Extract token from URL
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required' });
  }

  try {
    // Verify the token from the request header
    const { id } = req.user; // This is set by the isAuth middleware
    const user = await User.findById(id)
    
    // Check if the token is valid
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Find user associated with the token
    const tokenData = resetTokens.get(token);
    if (!tokenData || tokenData.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Remove the token from memory
    resetTokens.delete(token);

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { registerUser, loginUser ,requestResetPassword ,resetPassword };
