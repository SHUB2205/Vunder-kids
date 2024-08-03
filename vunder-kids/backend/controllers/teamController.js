const Team = require("../models/Team");

// Create a new team
exports.createTeam = async (req, res) => {
  try {
    const { name, participants } = req.body;
    const admin = req.user.id; // Extract the admin from req.user.id

    // Create a new team with the admins field as an array containing the current admin
    const newTeam = new Team({
      name,
      participants,
      admins: [admin], // Initialize the admins array with the current admin
    });

    // Save the new team to the database
    await newTeam.save();

    //  For understnading to how to get the user info
    //   const populatedTeam = await Team.findById(newTeam._id)
    //   .populate({
    //     path: 'participants', // Field to populate
    //     select: '-password' // Optionally exclude the password field
    //   })
    //   .populate({
    //     path: 'admins', // Ensure admins are populated if needed
    //     select: '-password' // Optionally exclude the password field
    //   })
    //   .exec();

    // Respond with the created team
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all teams
exports.getAllTeams = async (req, res) => {
  try {
    const userId = req.params.userid; // Get the user ID from the request parameters

    // Find all teams where the user ID is in the participants list
    const teams = await Team.find({
        participants: userId // Check if userId is present in the participants array
      })

    // If no teams are found
    if (teams.length === 0) {
      return res.status(404).json({ message: "No teams found for this user." });
    }

    res.status(200).json(teams);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single team by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.status(200).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a team 
exports.addParticipant = async (req, res) => {
    try {
      const teamId = req.params.id;
      const userId = req.body.userId; // Get the user ID from the request body
      const adminId = req.user.id; // Get the admin ID from the authenticated user
  
      // Find the team by ID
      const team = await Team.findById(teamId);
  
      // Check if the team exists
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
  
      // Check if the user is an admin of the team
      if (!team.admins.includes(adminId)) {
        return res.status(403).json({ error: 'Only admins can add participants' });
      }
  
      // Check if the user is already a participant
      if (team.participants.includes(userId)) {
        return res.status(400).json({ error: 'User is already a participant' });
      }
  
      // Add the user to the participants list
      team.participants.push(userId);
      await team.save();
  
      // Populate the participants field
    //   await team.populate({
    //     path: 'participants',
    //     select: '-password'
    //   }).execPopulate();
  
      res.status(200).json(team);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  exports.removeParticipant = async (req, res) => {
    try {
      const teamId = req.params.id;
      const userId = req.body.userId; // Get the user ID from the request body
      const adminId = req.user.id; // Get the admin ID from the authenticated user
  
      // Find the team by ID
      const team = await Team.findById(teamId);
  
      // Check if the team exists
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
  
      // Check if the user is an admin of the team
      if (!team.admins.includes(adminId)) {
        return res.status(403).json({ error: 'Only admins can remove participants' });
      }
  
      // Check if the user is actually a participant
      if (!team.participants.includes(userId)) {
        return res.status(400).json({ error: 'User is not a participant' });
      }
  
      // Remove the user from the participants list
      team.participants = team.participants.filter(participant => !participant.equals(userId));
      await team.save();
  
      // Populate the participants field
    //   await team.populate({
    //     path: 'participants',
    //     select: '-password'
    //   }).execPopulate();
  
      res.status(200).json(team);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // In your teamController file
exports.updateTeamName = async (req, res) => {
    try {
      const teamId = req.params.id;
      const newName = req.body.name; // The new team name from the request body
      const adminId = req.user.id; // Extracted from the authenticated user
  
      // Find the team by ID
      const team = await Team.findById(teamId);
  
      // Check if the team exists
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
  
      // Check if the user is an admin of the team
      if (!team.admins.includes(adminId)) {
        return res.status(403).json({ error: "Only admins can update the team name" });
      }
  
      // Update the team name
      team.name = newName;
      await team.save();
  
      // Populate fields if necessary
    //   await team.populate({
    //     path: 'participants',
    //     select: '-password'
    //   }).execPopulate();
  
      res.status(200).json(team);
    } catch (error) {
      console.error('Error:', error.message); // Log error details for debugging
      res.status(400).json({ error: error.message });
    }
  };
  

// Delete a team by ID
exports.deleteTeamById = async (req, res) => {
    try {
      const teamId = req.params.id;
      const adminId = req.user.id; // Extract the admin ID from the authenticated user
  
      // Find the team by ID
      const team = await Team.findById(teamId);
  
      // Check if the team exists
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
  
      // Check if the user is an admin of the team
      if (!team.admins.includes(adminId)) {
        return res.status(403).json({ error: "Only admins can delete the team" });
      }
  
      // Delete the team
      await Team.findByIdAndDelete(teamId);
  
      res.status(200).json({ message: "Team deleted successfully" });
    } catch (error) {
      console.error('Error:', error.message); // Log error details for debugging
      res.status(400).json({ error: error.message });
    }
  };
  
