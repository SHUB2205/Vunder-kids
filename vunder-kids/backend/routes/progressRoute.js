const express = require('express');
const router = express.Router();
const { userProgress,updateScore} = require('../controllers/progressController');

//  Middleware
const {isAuth}=require("../middleware/is-Auth");



// Route to get user progress

router.get("/user-achievements/:userId",userProgress);
router.put("/user-achievements/update-score",isAuth,updateScore);
