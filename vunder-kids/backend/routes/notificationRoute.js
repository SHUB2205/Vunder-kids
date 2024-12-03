const express = require('express');
const {allNotification, allMatches} = require('../controllers/notificationController');
const {isAuth}=require("../middleware/is-Auth");
const router = express.Router();

router.get('/all',isAuth,allNotification);
router.get('/matches',isAuth,allMatches);



module.exports = router;
