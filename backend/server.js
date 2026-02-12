require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const storyRoutes = require('./routes/storyRoutes');
const reelRoutes = require('./routes/reelRoutes');
const matchRoutes = require('./routes/matchRoutes');
const sportRoutes = require('./routes/sportRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const searchRoutes = require('./routes/searchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const messageRoutes = require('./routes/messageRoutes');
const scoreRoutes = require('./routes/scoreRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api/', limiter);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fisiko')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Fisiko API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/story', storyRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/sport', sportRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/scores', scoreRoutes);

// Socket.IO for real-time chat
const socketAuth = require('./middleware/socketAuth');
io.use(socketAuth);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  const userId = socket.user.id;
  socket.join(userId);

  socket.on('join room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('leave room', (roomId) => {
    socket.leave(roomId);
  });

  socket.on('private message', async (data, callback) => {
    try {
      const { recipientId, content } = data;
      const Message = require('./models/Message');
      const User = require('./models/User');

      const message = new Message({
        sender: userId,
        recipient: recipientId,
        content,
      });
      await message.save();
      await message.populate('sender', 'name userName avatar');

      // Update users' message lists
      await User.findByIdAndUpdate(userId, { $push: { messages: message._id } });
      await User.findByIdAndUpdate(recipientId, { $push: { messages: message._id } });

      // Add to private chats
      await User.updateOne({ _id: userId }, { $addToSet: { privateChats: recipientId } });
      await User.updateOne({ _id: recipientId }, { $addToSet: { privateChats: userId } });

      io.to(recipientId).emit('new private message', message);
      callback({ success: true, message });
    } catch (error) {
      console.error('Error sending message:', error);
      callback({ success: false, error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
    data: error.data || null,
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Accessible at http://10.226.171.40:${PORT}`);
});

module.exports = { app, io };
