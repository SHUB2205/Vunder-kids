const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { isAuth } = require('../middleware/is-Auth');

router.get('/private/:otherUserId', isAuth, messageController.getPrivateMessages);
router.get('/group/:groupId', isAuth, messageController.getGroupMessages);
router.get('/chats', isAuth, messageController.getUserChats);
router.post('/group/create', isAuth, messageController.createGroup);
// router.post('/send',isAuth,messageController.sendMessage);
router.post('/notify', isAuth, messageController.notifyFollowers);
router.post('/markMessagesAsSeen/:chatId',isAuth,messageController.markMessagesAsSeen);
module.exports = router;