const Team = require("../models/Team");
const notificationService=require('../services/notification/notificationService.js');
const User = require('../models/User'); 
// Create a new team
exports.createTeam = async (req, res) => {
  try {
    const { name, participants } = req.body;
    const admin = req.user.id; // Extract the admin from req.user.id
    
    // Add the admin to the participants list if not already present
    if (!participants.includes(admin)) {
      participants.push(admin);
    }
    
    // Create a new team with the admins field as an array containing the current admin
    const newTeam = new Team({
      name,
      participants,
      admins: [admin], // Initialize the admins array with the current admin
    });
    
    // Save the new team to the database
    await newTeam.save();

    // Update each participant's teamIds field
    await User.updateMany(
      { _id: { $in: participants } }, // Match all participants
      { $addToSet: { teamIds: newTeam._id } } // Add the team ID to the user's teamIds array, avoiding duplicates
    );

    // Send notifications to participants
    notificationService(
      participants, 
      'matchmaking', 
      `You have been added to the team "${newTeam.name}"`,
      newTeam._id
    );

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

    // Retrieve the user document to get their teamIds
    const user = await User.findById(userId).select('teamIds');
    
    // If the user does not exist or has no teams
    if (!user || user.teamIds.length === 0) {
      return res.status(404).json({ message: "No teams found for this user." });
    }

    // Fetch all teams where the teamId matches the user's teamIds
    const teams = await Team.find({
      _id: { $in: user.teamIds } // Fetch teams with IDs in the user's teamIds array
    });

    // Respond with the teams
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
  
