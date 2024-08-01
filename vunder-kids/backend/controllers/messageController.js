const User = require('../models/User');
const Group = require('../models/chatModels/Group');
const Message = require('../models/chatModels/Message');


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
    console.error('Error fetching private messages:', error);
    res.status(500).json({ message: 'Error fetching private messages' });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const userId = req.user.id;
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
    console.error('Error fetching group messages:', error);
    res.status(500).json({ message: 'Error fetching group messages' });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: 'messages',
        options: { sort: { timestamp: -1 } },
        populate: {
          path: 'sender recipient',
          select: 'name'
        }
      })
      .populate({
        path: 'groups',
        select: 'name',
        populate: {
          path: 'messages',
          options: { sort: { timestamp: -1 }, limit: 1 },
          populate: {
            path: 'sender',
            select: 'name'
          }
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const privateChats = user.messages.reduce((chats, message) => {
      const otherUser = message.sender._id.toString() === userId ? message.recipient : message.sender;
      const existingChat = chats.find(chat => chat.id === otherUser._id.toString());

      if (!existingChat) {
        chats.push({
          type: 'user',
          id: otherUser._id,
          name: otherUser.name,
          lastMessage: message.content,
          timestamp: message.timestamp
        });
      }

      return chats;
    }, []);

    const groupChats = user.groups.map(group => ({
      type: 'group',
      id: group._id,
      name: group.name,
      lastMessage: group.messages ? group.messages[0].content : null,
      timestamp: group.messages  ? group.messages[0].timestamp : null
    }));

    const allChats = [...privateChats, ...groupChats]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    res.json(allChats);
  } catch (error) {
    console.error('Error in getUserChats:', error);
    res.status(500).json({ message: 'Error fetching user chats' });
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

      await User.updateMany(
        { _id: { $in: [senderId, recipientId] } },
        { $push: { messages: message._id } }
      );
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

      await Group.updateOne(
        { _id: groupId },
        { $push: { messages: message._id } }
      );
    } else {
      return res.status(400).json({ message: 'Invalid request' });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const creatorId = req.user.id;

    if (!members.includes(creatorId)) {
      members.push(creatorId);
    }

    const newGroup = new Group({
      name,
      members,
      createdBy: creatorId
    });

    await newGroup.save();

    await User.updateMany(
      { _id: { $in: members } },
      { $push: { groups: newGroup._id } }
    );

    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Error creating group' });
  }
};