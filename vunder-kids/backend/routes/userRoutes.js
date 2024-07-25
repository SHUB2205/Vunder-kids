const express = require('express');
const { registerUser, loginUser ,requestResetPassword , resetPassword ,userId} = require('../controllers/userController');
const router = express.Router();


// middleware
const isAuth=require("../middleware/is-Auth");

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/request-reset-password",isAuth,requestResetPassword);
router.post("/reset-password/:token",resetPassword);
router.get("/userId",isAuth,userId);


module.exports = router;
