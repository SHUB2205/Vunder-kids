require('dotenv').config({ path: __dirname + '/.env' })
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
const User=require('./models/User');
const router = express.Router();
const notificationService = require("./services/notification/notificationService");
// Middleware
app.use(cors());
app.use(express.json());

// For fireBase Admin
const admin = require('firebase-admin');

const serviceAccount = {
  "type": "service_account",
  "project_id": "vunder-kids-bb948",
  "private_key_id": "dc66bf35c4ed660cf1c127721ca1e6b40b613dff",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC5fGzd1S82p8jx\nRedrfSlyKO9+8GnVpPbjvyHrdpvKe+TV6gPS7jfacdEgd2vUyzNOeBAJcmKbFdFF\nY6r5K+JC7qxEQxvbnhIkRauajS/JfZ53+AyOWc4gcen5vqmaPNB/6qSu3gpb190K\n6ChkrlQumtWrnVpSTToSx5iWELOW8eH9GRJ6Vkv+BekSRS3oMwyV5aohdGBObB9O\nQr1gJUmBCfyHXBhR8YSEiQcWSRC2CR2MKrYy+tKPZkA6ItR8rSllwEkRzsnci+Td\nuKnHVr9pC5lrb1i2aZHS3cn6eGofmX1dzNMc0TNsgRBPsNh32vsn28U5wSnLJHkg\nFCZ9cNMzAgMBAAECggEAC+H/PXTnWeqE0oQmb7nsek5KDYlMVm4DjRKVEzcdgurN\n/bBIv24YcOuiuKA97bt41XmWmWxVCddreTUJ4n2fuKb+rT7ZXYfyZJV8CWIrIg7k\npI3lDAePz39MvH2s8t8bgl5fX36FDl41YHoAAHc0mGm974kcnLIq2sIjsdVvE+fe\nFhUgVhTZUkWEXhAm2gY4dSBYyFuH7YlDUhn5KTbr5CW9NT2LFZs7a+ql9NC4SRF1\nA7W7C0HngD/aay1pvZJCjvuxZKgUu9l0C7VLlB3a1ZkC4za5YW+Xa/o/r0UJM27y\nDkvYQCELvtWq24XNuQsT9OfTOEl01rzsr6w4DmeBdQKBgQDonwrmkmmTHOtV5jfF\nUgk9OI2BSwZ1nkBpSDm8r4mIM6BqBjzwHpQBeWZkJDiGcVrSmpipP3wrqd3je/FI\nZL4N6084q7dneDQg/pnc1P4NQ2+AwRyFVrr/ofQX90ZaG0EbDJolTrW99saa4Ugn\nSvYLyVu7K7y3S5ZhtWhB12+RDwKBgQDMIKwCEKTmiqb9aidES9TX+KhQyzDlC0Em\n9LsnNs65GOANy53nCmbepen4Ablm4r3WC8ZCbRxgVxNP5/DMNXIKmqayyDsXZeLi\nUXyu7BnGBwKYRUCHFdgKyzKUf/c5a5iXKsKDnNJzLj3Q2baxjPDTMzjIh/xE4LOI\nwv+Q9DNTnQKBgQC9r9sSs7d1Z/KbRDScKc4w5um00bn9tULu1x+Ftlpe/0JC0r1k\nTHsCTL1q0YJqVwrpi3kLIiKd9FFky8+v6b502Tnri1LuA732XcaXpfNYW3IUOuSH\n8nZgN+80j8YFeg34Aam83FclBZNj/mp46A6FA/hSQ1MK4I9LM8NFVWi7jwKBgQCi\nb/1xRz1yGDP6xVaqCo49ryqB4K/wFJysG2QzOHIY6aqiT74/9Q8XboBZU0XukdDv\nXD9Q7PL/10sO80uztXQi7B5rdttPK0z5PE80A74ez8VI1xMabE+Xh0ug0JQzpWOw\nJ97STSFLdyjJ4fZ4I+ggqUouicg+J3G3CzXEbA/MIQKBgQCDtU0+1vx2CLTuhHof\nIsZRCyJ98Ejkxqdf7vDnz6jTDbAAdwjOqJtdUuZMVZBXsi29AZi4gUtvFE30qgFY\nb4HPknUPx39/zHoIimHk3h9Z7H3jGTeKiJYqyJ6w88S8iXY5jP+lgBW4j/tCYSD7\n+c1KWBlzZGHaUx76LFWuw8P3nQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-euoht@vunder-kids-bb948.iam.gserviceaccount.com",
  "client_id": "111998003950981537193",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-euoht%40vunder-kids-bb948.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'vunder-kids-bb948',
});
// end her firebase

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
app.get("/", (req, res) => {
  res.send("Chat Server is Alive!");
});
app.use("/api/messages", messageRoutes);

app.use(router);
router.post('/api/send-notification', async (req, res) => {
  // console.log("Received notification request:", req.body);
  const { senderId, recipientId } = req.body;
  try {
    await notificationService(senderId, recipientId);
    res.status(200).json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error in sending notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
      
      // console.log(updatedMessage); 
      // console.log(recipientId);

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
