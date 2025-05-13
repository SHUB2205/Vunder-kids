require('dotenv').config({ path: __dirname + '/.env' })
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const http = require('http');
const matchRoutes = require("./routes/matchRoutes");
const teamRoutes = require("./routes/teamRoutes");
const postRoutes = require("./routes/postRoute");
const userRoutes = require("./routes/userRoutes");
const progressRoutes = require("./routes/progressRoute");
const searchRoute = require("./routes/searchRoute");
const editRoute = require("./routes/editRoute");
const calendarRoutes = require("./routes/calendarRoute");
const openaiRoute = require("./routes/openaiRoute");
const reelRoute = require("./routes/reelRoutes");
const sportRoute = require("./routes/sportRoute");
const notificationRoute = require("./routes/notificationRoute");
//for google calender
const { google } = require("googleapis");
const dayjs = require("dayjs");
const User = require("./models/User");
const { isAuth } = require("./middleware/is-Auth");

const app = express();
const PORT = process.env.PORT || 5000;
// For fireBase Admin
const admin = require("firebase-admin");
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
  projectId: "vunder-kids-bb948",
});
// end her firebase

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err);
  });
// Test.addFollowers();
//  userRoutes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api", userRoutes);
// google auth
app.use("/api/auth", require("./controllers/googleAuth"));

app.use("/api/matches", matchRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/post", postRoutes);
//  Progress Ans UserAchievements
app.use("/api/user-achievements", progressRoutes);
// searcRoute
app.use("/api/search", searchRoute);
// editRoute
app.use("/api/edit", editRoute);
// OpenAi
app.use("/api/ai", openaiRoute);

//for website calendar
app.use("/api/calendar", calendarRoutes);
app.use("/api/reels", reelRoute);
app.use("/api/sport", sportRoute);
app.use("/api/notifications", notificationRoute);
// For Google Calendar
// Google OAuth2 credentials
const CLIENT_ID = "ID";
const CLIENT_SECRET = "ID";
const REDIRECT_URL = "ID";

const oauth2Client = new google.auth.OAuth2({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URL,
});

const calendar = google.calendar({
  version: "v3",
  // CALENDAR_API
  auth: "ID", // specify your API key here
});

// Specify the required scopes
const scopes = ["https://www.googleapis.com/auth/calendar"];

// // Route to initiate the OAuth flow
app.get("/google", isAuth, (req, res) => {
  try {
    console.log("Google OAuth route hit");

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // Force consent screen to get a refresh token
      scope: scopes,
      state: req.user.id, // Access the user ID here
    });

    console.log("OAuth URL generated:", url);

    // Send the URL as a response
    return res.status(200).json({
      message: "OAuth URL generated successfully",
      url: url,
    });
  } catch (error) {
    console.error("Error in /google route:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Callback route to handle the OAuth response
app.get("/google/redirect", async (req, res) => {
  const code = req.query.code;
  const userId = req.query.state; // Retrieve the user ID from the state

  if (!code) {
    return res.status(400).send("Authorization code is missing");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Retrieve the user document from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Update the user's Google credentials
    await User.findByIdAndUpdate(userId, {
      google: {
        accessToken: tokens.access_token,
        refreshToken:
          tokens.refresh_token || (user.google && user.google.refreshToken), // Safely access refreshToken
      },
    });

    res.send("Successfully authenticated with Google!");
  } catch (error) {
    console.error("Error retrieving tokens:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/schedule_event", isAuth, async (req, res) => {
  try {
    // Fetch the user from the database using the authenticated user's ID
    const user = await User.findById(req.user.id);

    if (!user.google.accessToken || !user.google.refreshToken) {
      return res.status(400).send("User has not authenticated with Google");
    }

    // Set credentials for the current user
    oauth2Client.setCredentials({
      access_token: user.google.accessToken,
      refresh_token: user.google.refreshToken,
    });

    // Now, you can proceed to schedule the event
    await calendar.events.insert({
      calendarId: "primary",
      auth: oauth2Client,
      requestBody: {
        summary: req.body.summary,
        description: req.body.description,
        start: {
          dateTime: dayjs(req.body.startDateTime).toISOString(),
          timeZone: req.body.timeZone || "Asia/Kolkata",
        },
        end: {
          dateTime: dayjs(req.body.endDateTime).toISOString(),
          timeZone: req.body.timeZone || "Asia/Kolkata",
        },
      },
    });

    res.status(200).send({ message: "Event scheduled successfully" });
  } catch (error) {
    console.error("Error scheduling event:", error);
    res.status(500).send("Error scheduling event");
  }
});

// Automatically refresh tokens when needed
oauth2Client.on("tokens", async (tokens) => {
  try {
    const userId = oauth2Client.credentials.userId; // Access the stored user ID

    if (tokens.refresh_token) {
      await User.findByIdAndUpdate(userId, {
        "google.refreshToken": tokens.refresh_token,
      });
    }
    if (tokens.access_token) {
      await User.findByIdAndUpdate(userId, {
        "google.accessToken": tokens.access_token,
      });
    }
  } catch (error) {
    console.error("Error saving tokens:", error);
  }
});

// 404 Error Handler
app.use((req, res, next) => {
  const error = new Error("Not Found");
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
  console.log(`Server is running on http://localhost:${PORT}`);
});

// server.listen(PORT, () => {
//   console.log(Server running on port ${PORT});
// });
