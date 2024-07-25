const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require('crypto');


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

//  Register The User //
const registerUser = async (req, res) => {
  const {
    name,
    school,
    class: userClass,
    email,
    phoneNumber,
    password,
  } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      school,
      class: userClass,
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
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login The User //
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
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Session For Reset Password  //

//  Sending The Verification mail for the reset
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
    user.verifyToken = token;
    // Token valid for 1 hour
    user.tokenExpiration = Date.now() + 3600000;
    await user.save();

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
    const tokenData = resetTokens.get(token);
    if (!tokenData || tokenData.expires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Remove the token from memory
    resetTokens.delete(token);

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
};
