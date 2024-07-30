require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const postRoutes = require('./routes/postRoute');
const progressRoutes=require('./routes/progressRoute');

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
  useFindAndModify: false // Add this line to avoid the deprecation warning
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.log('Failed to connect to MongoDB', err);
});

//  userRoutes
app.use('/api', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/user-achievements', progressRoutes);

// 404 Error Handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Global Error Handler
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  res.status(statusCode).json({
    message: error.message,
    data: error.data || null,
  });
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
