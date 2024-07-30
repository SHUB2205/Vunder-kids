const express = require('express');
const router = express.Router();
const { userProgress,updateScore} = require('../controllers/progressController');

//  Middleware
const {isAuth}=require("../middleware/is-Auth");



// Route to get user progress

router.get("/:userId",userProgress);
router.put("/update-score",isAuth,updateScore);


module.exports = router;