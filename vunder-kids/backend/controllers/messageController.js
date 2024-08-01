const Message = require('../models/chatModels/Message');
const User = require('../models/User');
const Group = require('../models/chatModels/Group');
const io = require('../socketio').getIo;
const mongoose = require('mongoose')

exports.getPrivateMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    }).sort({ timestamp: 1 }).populate('sender', 'name');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching private messages', error: error.message });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { groupId } = req.params;
    
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ group: groupId })
      .sort({ timestamp: 1 })
      .populate('sender', 'name');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group messages', error: error.message });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all messages where the user is either the sender or recipient
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(userId) },
            { recipient: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", mongoose.Types.ObjectId(userId)] },
              "$recipient",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "chatPartner"
        }
      },
      {
        $unwind: "$chatPartner"
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          "chatPartner.name": 1,
          "chatPartner._id": 1
        }
      }
    ]);

    // Find group messages
    const groupMessages = await Message.aggregate([
      {
        $match: {
          group: { $exists: true },
          sender: mongoose.Types.ObjectId(userId)
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: "$group",
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "groups",
          localField: "_id",
          foreignField: "_id",
          as: "groupInfo"
        }
      },
      {
        $unwind: "$groupInfo"
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          "groupInfo.name": 1
        }
      }
    ]);

    // Combine and format the results
    const chats = [
      ...messages.map(m => ({
        type: 'user',
        id: m.chatPartner._id,
        name: m.chatPartner.name,
        lastMessage: m.lastMessage.content,
        timestamp: m.lastMessage.timestamp
      })),
      ...groupMessages.map(g => ({
        type: 'group',
        id: g._id,
        name: g.groupInfo.name,
        lastMessage: g.lastMessage.content,
        timestamp: g.lastMessage.timestamp
      }))
    ];

    // Sort chats by the most recent message
    chats.sort((a, b) => b.timestamp - a.timestamp);

    res.json(chats);
  } catch (error) {
    console.error('Error in getUserChats:', error);
    res.status(500).json({ message: 'Error fetching user chats', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, groupId, content } = req.body;
    const senderId = req.user.id;

    let message;
    if (recipientId) {
      message = new Message({
        sender: senderId,
        recipient: recipientId,
        content
      });
      await message.save();
      io().to(recipientId).emit('new message', message);
    } else if (groupId) {
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(senderId)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      message = new Message({
        sender: senderId,
        group: groupId,
        content
      });
      await message.save();
      io().to(groupId).emit('new group message', message);
    } else {
      return res.status(400).json({ message: 'Invalid request' });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};