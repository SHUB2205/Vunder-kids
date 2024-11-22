require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const Message = require("./models/Message");
const Group = require("./models/Group");
const messageRoutes = require("./routes/messageRoutes");
const socketAuth=require("./middleware/socketAuth");
const app = express();
const PORT = process.env.PORT || 4000;
const User=require('./models/User')
// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/Vunder-Kids", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, // Add this line
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Routes
app.use("/api/messages", messageRoutes);

// 404 Error Handler
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// General Error Handler
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    message: error.message,
    data: error.data || null,
  });
});

// Create HTTP Server and Socket.IO Initialization
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.IO Middleware 
io.use(socketAuth);

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  const userId = socket.user.id;
  socket.join(userId); // Join the user's room
  // console.log(`User ${userId} joined their room`);
  socket.on("join room", (roomId) => {
    socket.join(roomId);
    // console.log(`Reciver User joined room: ${roomId}`);
  });

  socket.on("leave room", (roomId) => socket.leave(roomId));

  
  socket.on("private message", async (data, callback) => {
    try {
      const { recipientId, content } = data;
      const senderId = socket.user.id;
      // console.log("sender Id "+senderId);
      // Create and save the message
      const message = new Message({
        sender: senderId,
        recipient: recipientId,
        content,
      });
      await message.save();
      await message.populate("sender", "name"); // Populate sender details
  
      // Emit the message to the recipient
      
      await User.findByIdAndUpdate(senderId, {
        $push: { messages: message._id },
      });
      await User.findByIdAndUpdate(recipientId, {
        $push: { messages: message._id },
      });

      await User.updateOne(
        { _id: senderId },
        { $addToSet: { privateChats: recipientId } }
      );
      await User.updateOne(
        { _id: recipientId },
        { $addToSet: { privateChats: senderId } }
      );

      await User.findByIdAndUpdate(senderId , {
        $set: { [`lastSeen.${recipientId}`]: new Date() },
      });
      
      const updatedMessage = await Message.findOneAndUpdate(
        { _id: message._id, readBy: { $ne: senderId } }, // Filter
        { $addToSet: { readBy: senderId } },            // Update
        { new: true }                                   // Return the updated document
      );
      
      console.log(updatedMessage);
      
      io.to(recipientId).emit("new private message", updatedMessage);

      callback({ success: true, message });
    } catch (error) {
      console.error("Error sending private message:", error);
      callback({ success: false, error: "Failed to send message" });
    }
  });
  

  socket.on("group message", async (data, callback) => {
    try {
      const { groupId, content } = data;
      const senderId = socket.user.id;

      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(senderId)) {
        return callback({ success: false, error: "Access denied" });
      }

      const message = new Message({
        sender: senderId,
        group: groupId,
        content,
      });
      await message.save();
      await message.populate("sender", "name");

      io.to(groupId).emit("new group message", message);
      callback({ success: true, message });
    } catch (error) {
      console.error("Error sending group message:", error);
      callback({ success: false, error: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
