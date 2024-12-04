const express = require('express');
const { registerUser, loginUser ,requestResetPassword , resetPassword ,getUserId,sendVerificationEmail,verifyEmail,userInfo,inviteUser,checkUsername,checkVerification,aboutUser,submitSports,saveProfilePicture,getAllUsers,getByUsername,notificationToken, editUser} = require('../controllers/userController');
const router = express.Router();
const { body } = require('express-validator');
const Limiter = require('../middleware/Limiter');
const {isAuth, optionalAuth}=require("../middleware/is-Auth");
const { route } = require('./matchRoutes.js');
const { upload } = require('../config/cloudinary.js');

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
      .trim()
  ], registerUser);

  
router.post('/login',loginUser);



router.post('/send-verification-email',sendVerificationEmail);

router.get('/verify-email/:token', verifyEmail);
router.get('/check-verification',isAuth,checkVerification);
router.post("/request-reset-password",isAuth,requestResetPassword);
router.get("/reset-password/:token",isAuth,resetPassword);
router.get("/getUserId",isAuth,getUserId);
// Specific User Info
router.get("/users/:id",isAuth,userInfo);
router.get('/check-username',isAuth,checkUsername);
router.post("/inviteUser",isAuth,inviteUser);
router.post('/aboutUser',isAuth,aboutUser);
router.post('/submit-sports',isAuth,submitSports);
router.post('/saveProfilePicture',isAuth,saveProfilePicture);
router.get('/getusers',getAllUsers);
router.get('/getUser/:username',optionalAuth,getByUsername);
router.post('/notification-token',isAuth,notificationToken);
router.put('/edit-profile', 
  isAuth, 
  upload.single('media'),
  [
    body('name').optional().trim(),
    body('userName').optional().trim(),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('bio').optional().trim(),
    body('location').optional().trim(),
  ],
  editUser
);
module.exports = router;


