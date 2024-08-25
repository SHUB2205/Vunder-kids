require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');


const matchRoutes = require('./routes/matchRoutes');
const teamRoutes = require('./routes/teamRoutes');
const postRoutes = require('./routes/postRoute');
const userRoutes = require('./routes/userRoutes');
const progressRoutes = require('./routes/progressRoute');
const searchRoute = require('./routes/searchRoute');
const editRoute = require("./routes/editRoute");
// const Test=require("./routes/TestRoute");
const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/Vunder-Kids", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.log('Failed to connect to MongoDB', err);
});
// Test.addFollowers();
//  userRoutes
app.use('/api', userRoutes);
// google auth
app.use("/api/auth",require("./controllers/googleAuth"));
app.use('/api/matches', matchRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/post', postRoutes);
//  Progress Ans UserAchievements
app.use('/api/user-achievements', progressRoutes);
// searcRoute
app.use("/api/search",searchRoute);
// editRoute
app.use("/api/edit",editRoute);



// 404 Error Handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  res.status(statusCode).json({
    message: error.message,
    data: error.data || null,
  });
});

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
