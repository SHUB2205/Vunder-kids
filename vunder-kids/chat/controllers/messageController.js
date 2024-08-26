
const User = require('../models/User');
const Group = require('../models/Group');
const Message = require('../models/Message');


exports.getPrivateMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate("sender", "name");

    res.json(messages);
  } catch (error) {
    console.error("Error fetching private messages:", error);
    res.status(500).json({ message: "Error fetching private messages" });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ group: groupId })
      .sort({ timestamp: 1 })
      .populate("sender", "name");

    res.json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({ message: "Error fetching group messages" });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: "messages",
        options: { sort: { timestamp: -1 } },
        populate: {
          path: "sender recipient",
          select: "name",
        },
      })
      .populate({
        path: "groups",
        select: "name",
        populate: {
          path: "messages",
          options: { sort: { timestamp: -1 }, limit: 1 },
          populate: {
            path: "sender",
            select: "name",
          },
        },
      })
      .select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //  How this is working?
    const privateChats = user.messages.reduce((chats, message) => {
      const otherUser =
        message.sender._id.toString() === userId
          ? message.recipient
          : message.sender;
      const existingChat = chats.find(
        (chat) => chat.id === otherUser._id.toString()
      );

      if (!existingChat) {
        chats.push({
          type: "user",
          id: otherUser._id,
          name: otherUser.name,
          lastMessage: message.content,
          timestamp: message.timestamp,
        });
      }

      return chats;
    }, []);

    const groupChats = user.groups.map((group) => ({
      type: "group",
      id: group._id,
      name: group.name,
      lastMessage: group.messages ? group.messages[0].content : null,
      timestamp: group.messages ? group.messages[0].timestamp : null,
    }));

    const allChats = [...privateChats, ...groupChats].sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );

    res.json(allChats);
  } catch (error) {
    console.error("Error in getUserChats:", error);
    res.status(500).json({ message: "Error fetching user chats" });
  }
};

// exports.sendMessage = async (req, res) => {
//   try {
//     const { recipientId, groupId, content } = req.body;
//     const senderId = req.user.id;

//     let message;
//     if (recipientId) {
//       message = new Message({
//         sender: senderId,
//         recipient: recipientId,
//         content
//       });
//       await message.save();

//       await User.updateMany(
//         { _id: { $in: [senderId, recipientId] } },
//         { $push: { messages: message._id } }
//       );
//     } else if (groupId) {
//       const group = await Group.findById(groupId);
//       if (!group || !group.members.includes(senderId)) {
//         return res.status(403).json({ message: 'Access denied' });
//       }
//       message = new Message({
//         sender: senderId,
//         group: groupId,
//         content
//       });
//       await message.save();

//       await Group.updateOne(
//         { _id: groupId },
//         { $push: { messages: message._id } }
//       );
//     } else {
//       return res.status(400).json({ message: 'Invalid request' });
//     }

//     res.status(201).json(message);
//   } catch (error) {
//     console.error('Error sending message:', error);
//     res.status(500).json({ message: 'Error sending message' });
//   }
// };

exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const creatorId = req.user.id;

    // why?
    if (!members.includes(creatorId)) {
      members.push(creatorId);
    }

    const newGroup = new Group({
      name,
      members,
      createdBy: creatorId,
    });

    await newGroup.save();

    await User.updateMany(
      { _id: { $in: members } },
      { $push: { groups: newGroup._id } }
    );

    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Error creating group" });
  }
};

// POST endpoint to notify followers to play match
exports.notifyFollowers = async (req, res) => {
  try {
    const { userId, time, location } = req.body;

    // Ensure required fields are provided
    if (!userId || !time || !location) {
      return res
        .status(400)
        .json({ message: "userId, time, and location are required" });
    }

    // Find the user and their followers
    const user = await User.findById(userId).populate(
      "followers",
      "name email"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare the notification message
    const message = `Hey! ${
      user.name
    } is planning to play a match at ${location} on ${new Date(
      time
    ).toLocaleString()}.`;

    // Create notifications for each follower
    const notifications = user.followers.map((follower) => {
      return {
        user: follower._id,
        message,
        type: "matchmaking", // or another type depending on your use case
      };
    });

    // Save notifications to the database
    await Notification.insertMany(notifications);

    // Optionally, you can log or perform additional actions
    console.log("All followers notified successfully");
    console.log(message);
    res.status(200).json({ message: message });
  } catch (error) {
    console.error("Error notifying followers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
