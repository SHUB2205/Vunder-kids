const express = require('express');
const { registerUser, loginUser ,requestResetPassword , resetPassword ,getUserId,sendVerificationEmail,verifyEmail,userInfo,inviteUser} = require('../controllers/userController');
const router = express.Router();
const { body } = require('express-validator');
const Limiter = require('../middleware/Limiter');
const {isAuth}=require("../middleware/is-Auth");
const { route } = require('./matchRoutes.js');

//  POst rquest from client side
// {
//   "name":"vikrant",
//   "school":"St.Marys",
//   "userClass":"Xth",
//   "email":"vikrant@example.com",
//   "phoneNumber":"1234567895",
//   "password":"vikrant123",
//   "confirmPassword":"vikrant123"
// }

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

router.post("/request-reset-password",isAuth,requestResetPassword);
router.get("/reset-password/:token",isAuth,resetPassword);
router.get("/getUserId",isAuth,getUserId);
// Specific User Info
router.get("/users/:id",isAuth,userInfo);

router.post("/inviteUser",isAuth,inviteUser);

module.exports = router;


