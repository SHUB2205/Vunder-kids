const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

// Test account credentials for App Store Review
const TEST_ACCOUNT = {
  name: 'App Review Tester',
  email: 'appreview@fisiko.io',
  password: 'FisikoReview2024!',
  userName: 'appreview_tester',
  bio: 'Test account for App Store review purposes',
  isVerified: true,
};

const createTestAccount = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fisiko';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Import User model after connection
    const User = require('../models/User');

    // Check if test account already exists
    let user = await User.findOne({ email: TEST_ACCOUNT.email });
    
    if (user) {
      console.log('Test account already exists. Updating password...');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(TEST_ACCOUNT.password, salt);
      await user.save();
      console.log('Password updated successfully!');
    } else {
      // Create new test account
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(TEST_ACCOUNT.password, salt);
      
      user = new User({
        name: TEST_ACCOUNT.name,
        email: TEST_ACCOUNT.email,
        password: hashedPassword,
        userName: TEST_ACCOUNT.userName,
        bio: TEST_ACCOUNT.bio,
        isVerified: TEST_ACCOUNT.isVerified,
      });
      
      await user.save();
      console.log('Test account created successfully!');
    }

    console.log('\n========================================');
    console.log('APP STORE REVIEW TEST ACCOUNT');
    console.log('========================================');
    console.log(`Email: ${TEST_ACCOUNT.email}`);
    console.log(`Password: ${TEST_ACCOUNT.password}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test account:', error);
    process.exit(1);
  }
};

createTestAccount();
