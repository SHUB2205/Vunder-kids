const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// @route   GET /api/messages/conversations
// @desc    Get user's conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('privateChats', 'name userName avatar');

    const conversations = await Promise.all(
      user.privateChats.map(async (chatUser) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: req.user._id, recipient: chatUser._id },
            { sender: chatUser._id, recipient: req.user._id }
          ]
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          sender: chatUser._id,
          recipient: req.user._id,
          readBy: { $ne: req.user._id }
        });

        return {
          _id: chatUser._id,
          recipient: chatUser,
          lastMessage: lastMessage?.content,
          lastMessageTime: lastMessage?.createdAt,
          unread: unreadCount,
        };
      })
    );

    // Sort by last message time
    conversations.sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/:recipientId
// @desc    Get messages with a specific user
router.get('/:recipientId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.recipientId },
        { sender: req.params.recipientId, recipient: req.user._id }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name userName avatar');

    // Mark messages as read
    await Message.updateMany(
      {
        sender: req.params.recipientId,
        recipient: req.user._id,
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/send
// @desc    Send a message (HTTP fallback)
router.post('/send', auth, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content,
    });

    await message.save();
    await message.populate('sender', 'name userName avatar');

    // Update private chats
    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { privateChats: recipientId } }
    );
    await User.updateOne(
      { _id: recipientId },
      { $addToSet: { privateChats: req.user._id } }
    );

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
