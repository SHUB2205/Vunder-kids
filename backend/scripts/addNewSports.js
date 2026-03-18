const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const addNewSports = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fisiko';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const Sport = require('../models/Sport');

    const newSports = [
      { name: 'Pickleball', icon: 'tennisball', isActive: true },
      { name: 'Padel', icon: 'tennisball', isActive: true },
    ];

    for (const sport of newSports) {
      const exists = await Sport.findOne({ name: sport.name });
      if (!exists) {
        await Sport.create(sport);
        console.log(`Added: ${sport.name}`);
      } else {
        console.log(`Already exists: ${sport.name}`);
      }
    }

    console.log('Done!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addNewSports();
