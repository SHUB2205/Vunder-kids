require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('./socketio');
const socketHandler = require('./socketHandler');
const path = require('path')
const fs = require('fs')
const matchRoutes = require('./routes/matchRoutes');
const teamRoutes = require('./routes/teamRoutes');
const postRoutes = require('./routes/postRoute');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const progressRoutes = require('./routes/progressRoute');
const searchRoute = require('./routes/searchRoute');
const editRoute = require("./routes/editRoute");

//for google calender
const { google } = require('googleapis');
const dayjs = require('dayjs')
const calendar = google.calendar({
  version: 'v3',
  // CALENDAR_API
  auth: 'ID' // specify your API key here
});
const app = express();
const PORT = process.env.PORT || 5000;


//  for test purpose only
// const {
//   seedData,
//   seedSports

// }=require('./routes/TestRoute');

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.log('Failed to connect to MongoDB', err);
});

//  userRoutes
app.use('/api', userRoutes);
// google auth
app.use("/api/auth", require("./controllers/googleAuth"));
app.use('/api/matches', matchRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/post', postRoutes);
//  Progress Ans UserAchievements
app.use('/api/user-achievements', progressRoutes);
// searcRoute
app.use("/api/search", searchRoute);
// editRoute
app.use("/api/edit", editRoute);

app.use('/api/messages', messageRoutes);


// For Google Calendar
// Google OAuth2 credentials
const CLIENT_ID = 'ID';
const CLIENT_SECRET = 'ID';
const REDIRECT_URL = 'ID';

const oauth2Client = new google.auth.OAuth2({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URL
});

// Specify the required scopes
const scopes = ['https://www.googleapis.com/auth/calendar'];

// Route to initiate the OAuth flow
app.get('/google', (req, res) => {
  console.log('Google OAuth route hit');
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });
  res.redirect(url);
});

// Callback route to handle the OAuth response
app.get('/google/redirect', async (req, res) => {
  try {
    console.log("here")
    const code = req.query.code;
    if (!code) {
      return res.status(400).send('Authorization code is missing');
    }
    console.log("where")
    // Exchange the authorization code for an access token
    const { tokens } = await oauth2Client.getToken(code);
    console.log(code)
    oauth2Client.setCredentials(tokens);
    console.log("hiiiiiiiii")

    // Save the tokens for future use
    const TOKEN_PATH = path.join(__dirname, 'token.json');
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

    console.log('Authorization code:', code);
    console.log('Tokens:', tokens);

    res.send({
      msg: "you have sucessfuly logged in"
    });
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/schedule_event", async (req, res) => {
  console.log("here i am")
  console.log(oauth2Client.credentials.access_token);
  console.log("how here i am standing")
  await calendar.events.insert({
    calendarId: "primary",
    auth: oauth2Client,
    requestBody: {
      summary: "This is a test event",
      description: "something important",
      start: {
        dateTime: dayjs(new Date()).add(1, "day").toISOString(),
        timeZone: "Asia/Kolkata"
      },
      end: {
        dateTime: dayjs(new Date()).add(1, "day").add(1, "hour").toISOString(),
        timeZone: "Asia/Kolkata"
      },
    },
  });
  console.log("after calenddar")
  res.send({
    msg: "DONE"
  });
});


// 404 Error Handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});
// General Error Handling Middleware
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  res.status(statusCode).json({
    message: error.message,
    data: error.data || null,
  });
});

const server = http.createServer(app);
const io = socketIo.init(server);

socketHandler(io);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// server.listen(PORT, () => {
//   console.log(Server running on port ${PORT});
// });