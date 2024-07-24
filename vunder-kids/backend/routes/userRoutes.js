const express = require('express');
const { registerUser, loginUser,verifyEmail,sendVerificationEmail } = require('../controllers/userController');
const router = express.Router();
const { body } = require('express-validator');
const Limiter = require('../middleware/Limiter');


router.post('/register',
    [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password of at least 5 characters.'
    )
      .isLength({ min: 5 })
      .trim(),
    body('confirmPassword') //this field must be in frontend 
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      })
  ], registerUser);

  
router.post('/login', [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 5 })
      .trim()
  ],loginUser);



router.post('/send-verification-email',[
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail()
],Limiter.emailVerificationLimiter,sendVerificationEmail);

router.get('/verify-email/:token', verifyEmail);

module.exports = router;
