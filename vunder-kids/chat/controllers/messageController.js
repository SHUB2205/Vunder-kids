
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

      // console.log(messages)
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


const getUnseenMessageCount = async (userId, chatId, type) => {
  // Get the user's lastSeen timestamp for the specific chat
  const user = await User.findById(userId);
  const lastSeen = user.lastSeen?.get(chatId) || new Date(0); // Default to epoch if no lastSeen

  // Count messages that were sent after the user's lastSeen timestamp
  let unseenCount = 0;

  if (type === 'user') {
    // For private chat, filter by recipient and sender
    unseenCount = await Message.countDocuments({
      recipient: userId,
      sender: chatId,  // Assuming chatId here refers to the sender's ID in a private chat
      timestamp: { $gt: lastSeen }, // Messages sent after lastSeen
      readBy: { $ne: userId }, // Exclude messages already read
    });
  } else if (type === 'group') {
    // For group chat, filter by groupId
    unseenCount = await Message.countDocuments({
      group: chatId,
      timestamp: { $gt: lastSeen }, // Messages sent after lastSeen
      readBy: { $ne: userId }, // Exclude messages already read
    });
  }

  return unseenCount;
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
          select: "name avatar",
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

    // Use a Map to avoid duplicates
    const chatMap = new Map();

    // Process private messages
    for (const message of user.messages) {
      const otherUser =
        message.sender._id.toString() === userId
          ? message.recipient
          : message.sender;

      const existingChat = chatMap.get(otherUser._id.toString());

      if (!existingChat) {
        // Add a new entry if not already present
        const unseenCount = await getUnseenMessageCount(userId, otherUser._id, 'user');

        chatMap.set(otherUser._id.toString(), {
          type: "user",
          id: otherUser._id,
          name: otherUser.name,
          lastMessage: message.content,
          timestamp: message.timestamp,
          avatar: otherUser.avatar,
          unseenCount,  // Add unseen message count
        });
      }
    }

    // Process group chats
    const groupChats = await Promise.all(user.groups.map(async (group) => {
      const unseenCount = await getUnseenMessageCount(userId, group._id, 'group');

      return {
        type: "group",
        id: group._id,
        name: group.name,
        lastMessage: group.messages ? group.messages[0].content : null,
        timestamp: group.messages ? group.messages[0].timestamp : null,
        unseenCount, // Add unseen message count
      };
    }));

    const privateChats = Array.from(chatMap.values());

    // Combine private and group chats and sort by timestamp
    const allChats = [...privateChats, ...groupChats].sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );
    // console.log(allChats);
    res.json(allChats);
  } catch (error) {
    console.error("Error in getUserChats:", error);
    res.status(500).json({ message: "Error fetching user chats" });
  }
};



exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const creatorId = req.user.id;
    console.log(members);
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

//  seen feature
// Mark messages as seen for private messages
exports.markMessagesAsSeen = async (req, res) => {
  try {
    //  fro private chatid is the senderId which send the message 
    const { chatId } = req.params;
    const userId = req.user.id;
    const { type } = req.body; // "user" or "group"
    await User.findByIdAndUpdate(userId, {
      $set: { [`lastSeen.${chatId}`]: new Date() },
    });
    if (type === "user") {
      await Message.updateMany(
        { recipient: userId, sender: chatId, seenBy: { $ne: userId } },
        { $addToSet: { seenBy: userId } }
      );
    } else if (type === "group") {
      await Message.updateMany(
        { group: chatId, seenBy: { $ne: userId } },
        { $addToSet: { seenBy: userId } }
      );
      await Group.updateOne(
        { _id: chatId },
        { $set: { [`unseenCounts.${userId}`]: 0 } } // Reset unseen counts
      );
    }
    // console.log("here");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking messages as seen:", error);
    res.status(500).json({ message: "Failed to mark messages as seen" });
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
