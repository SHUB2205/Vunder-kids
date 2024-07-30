const mongoose = require('mongoose');
const Sport = require('../models/Sport.js'); // Adjust the path to your Sport model
const Match = require('../models/Match'); // Adjust path as necessary
const Team = require('../models/Team'); // Adjust path as necessary


async function seedSports() {
    try {
      // Connect to MongoDB
      await mongoose.connect('mongodb://localhost:27017/Vunder-Kids', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
  
      // Sample data
      const sports = [
        { name: 'Football', description: 'A team sport played with a round ball.' },
        { name: 'Basketball', description: 'A team sport where players score points by shooting a ball through a hoop.' },
        { name: 'Cricket', description: 'A bat-and-ball game played between two teams of eleven players.' }
      ];
  
      // Insert sample data into the database
      await Sport.insertMany(sports);
  
      console.log('Sports data seeded successfully.');
  
    } catch (error) {
      console.error('Error seeding sports data:', error);
    } finally {
      // Close the connection
      mongoose.connection.close();
    }
  }
  

async function seedData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Vunder-Kids', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const teamA = await Team.create({
      name: 'Team A',
      participants: [{ user: '66a8a03673fa0b5068b75e03' }]
    });

    const teamB = await Team.create({
      name: 'Team B',
      participants: [{ user: '66a8a06c73fa0b5068b75e07' }]
    });

    // const teamC = await Team.create({
    //   name: 'Team B',
    //   participants: [{ user: '66a8a08273fa0b5068b75e0a' }]
    // });

    const match = await Match.create({
      date: '2024-08-01T15:00:00Z',
      location: '64e88d9d73a5d5b10f3423b1',
      sport: '66a8a63b49145b44c8398efd',
      teams: [
        { team: teamA._id, score: 2 },
        { team: teamB._id, score: 1 }
      ],
      winner: teamA._id
    });     
    console.log('Data seeded successfully:');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

module.exports = {
    seedData,
    seedSports
    
  };


