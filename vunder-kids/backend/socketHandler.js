const Message = require('./models/chatModels/Message');
const Group = require('./models/chatModels/Group');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (io) => {
  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.user = decoded; 
        next();
      });
    } else {
      next(new Error('Authentication error'));
    }
  }).on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('leave room', (roomId) => {
      socket.leave(roomId);
    });

    socket.on('private message', async (data, callback) => {
      try {
        const { recipientId, content } = data;
        const senderId = socket.user.id; 
        const message = new Message({
          sender: senderId,
          recipient: recipientId,
          content
        });

        await message.save();
        message.populate('sender', 'name');
        io.to(recipientId).emit('new message', message);
        callback({ success: true, message });
      } catch (error) {
        console.error('Error sending private message:', error);
        callback({ success: false, error: 'Failed to send message' });
      }
    });

    socket.on('group message', async (data, callback) => {
      try {
        const { groupId, content } = data;
        const senderId = socket.user.id; 

        const group = await Group.findById(groupId);
        if (!group || !group.members.includes(senderId)) {
          return callback({ success: false, error: 'Access denied' });
        }

        const message = new Message({
          sender: senderId,
          group: groupId,
          content
        });

        await message.save();
        await message.populate('sender', 'name');
        io.to(groupId).emit('new group message', message);
        callback({ success: true, message });
      } catch (error) {
        console.error('Error sending group message:', error);
        callback({ success: false, error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};
