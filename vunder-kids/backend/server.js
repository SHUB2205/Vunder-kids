require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const http = require('http');



const matchRoutes = require('./routes/matchRoutes');
const teamRoutes = require('./routes/teamRoutes');
const postRoutes = require('./routes/postRoute');
const userRoutes = require('./routes/userRoutes');
const progressRoutes = require('./routes/progressRoute');
const searchRoute = require('./routes/searchRoute');
const editRoute = require("./routes/editRoute");
const calendarRoutes = require ("./routes/calendarRoute")
const openaiRoute=require("./routes/openaiRoute");

//for google calender
const { google } = require('googleapis');
const dayjs = require('dayjs')
const User = require('./models/User');
const { isAuth } = require('./middleware/is-Auth');

const app = express();
const PORT = process.env.PORT || 5000;
// For fireBase Admin

// const admin = require('firebase-admin');

// const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   projectId: 'vunder-kids-bb948',
// });
// end her firebase
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.log('Failed to connect to MongoDB', err);
});
// Test.addFollowers();
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
// OpenAi
app.use("/api/ai", openaiRoute);


//for website calendar
app.use('/api/calendar', calendarRoutes);

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

const calendar = google.calendar({
  version: 'v3',
  // CALENDAR_API
  auth: 'ID' // specify your API key here
});

// Specify the required scopes
const scopes = ['https://www.googleapis.com/auth/calendar'];

// // Route to initiate the OAuth flow
app.get('/google', isAuth, (req, res) => {
  try {
    console.log('Google OAuth route hit');

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // Force consent screen to get a refresh token
      scope: scopes,
      state: req.user.id, // Access the user ID here
    });

    console.log("OAuth URL generated:", url);

    // Send the URL as a response
    return res.status(200).json({
      message: "OAuth URL generated successfully",
      url: url
    });

  } catch (error) {
    console.error("Error in /google route:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
});

// Callback route to handle the OAuth response
app.get('/google/redirect', async (req, res) => {
  const code = req.query.code;
  const userId = req.query.state; // Retrieve the user ID from the state

  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Retrieve the user document from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Update the user's Google credentials
    await User.findByIdAndUpdate(userId, {
      google: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || (user.google && user.google.refreshToken), // Safely access refreshToken
      },
    });

    res.send('Successfully authenticated with Google!');
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.post('/schedule_event', isAuth, async (req, res) => {
  try {
    // Fetch the user from the database using the authenticated user's ID
    const user = await User.findById(req.user.id);
    
    if (!user.google.accessToken || !user.google.refreshToken) {
      return res.status(400).send('User has not authenticated with Google');
    }

    // Set credentials for the current user
    oauth2Client.setCredentials({
      access_token: user.google.accessToken,
      refresh_token: user.google.refreshToken,
    });

    // Now, you can proceed to schedule the event
    await calendar.events.insert({
      calendarId: 'primary',
      auth: oauth2Client,
      requestBody: {
        summary: req.body.summary,
        description: req.body.description,
        start: {
          dateTime: dayjs(req.body.startDateTime).toISOString(),
          timeZone: req.body.timeZone || 'Asia/Kolkata',
        },
        end: {
          dateTime: dayjs(req.body.endDateTime).toISOString(),
          timeZone: req.body.timeZone || 'Asia/Kolkata',
        },
      },
    });

    res.status(200).send({ message: 'Event scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling event:', error);
    res.status(500).send('Error scheduling event');
  }
});

// Automatically refresh tokens when needed
oauth2Client.on('tokens', async (tokens) => {
  try {
    const userId = oauth2Client.credentials.userId; // Access the stored user ID

    if (tokens.refresh_token) {
      await User.findByIdAndUpdate(userId, {
        'google.refreshToken': tokens.refresh_token,
      });
    }
    if (tokens.access_token) {
      await User.findByIdAndUpdate(userId, {
        'google.accessToken': tokens.access_token,
      });
    }
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
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


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// server.listen(PORT, () => {
//   console.log(Server running on port ${PORT});
// });