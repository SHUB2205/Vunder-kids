const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true 
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
      }],
      admins: [{ // Changed from admin to admins and made it an array
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Still required, but can now accommodate multiple admins
      }]
      //  this will be done in next update
        // role: {
        //     type: String,
        //     enum: ['player', 'coach', 'captain'], // Example roles; adjust as needed
        //     default: 'player'
        // }
  });
  

const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;
