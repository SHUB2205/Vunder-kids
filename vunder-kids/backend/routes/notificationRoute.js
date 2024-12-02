const express = require('express');
const {allNotification} = require('../controllers/notificationController');
const {isAuth}=require("../middleware/is-Auth");
const router = express.Router();

router.get('/all',isAuth,allNotification);
router.get('/matche',isAuth,allNotification);



module.exports = router;
