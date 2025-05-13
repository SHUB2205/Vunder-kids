const express = require('express');
const {allNotification, allMatches,markNotificationsAsRead} = require('../controllers/notificationController');
const {isAuth}=require("../middleware/is-Auth");
const router = express.Router();

router.get('/all',isAuth,allNotification);
router.get('/matches',isAuth,allMatches);
router.put('/mark-read', isAuth, markNotificationsAsRead);


module.exports = router;