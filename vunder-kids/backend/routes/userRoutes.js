const express = require('express');
const { registerUser, loginUser,verifyEmail,sendVerificationEmail } = require('../controllers/userController');
const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-verification-email',sendVerificationEmail);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;
