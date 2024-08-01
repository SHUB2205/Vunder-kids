const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { isAuth } = require('../middleware/is-Auth');

router.get('/private/:otherUserId', isAuth, messageController.getPrivateMessages);
router.get('/group/:groupId', isAuth, messageController.getGroupMessages);
router.get('/chats', isAuth, messageController.getUserChats);
router.post('/send', isAuth, messageController.sendMessage);

module.exports = router;