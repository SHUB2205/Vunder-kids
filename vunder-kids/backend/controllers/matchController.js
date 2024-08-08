const Match = require("../models/Match");
const Sport = require("../models/Sport");
const Location = require("../models/Location");
const Team = require("../models/Team");
const Notification=require("../models/Notifiication");

// Create a new match
exports.createMatch = async (req, res) => {
  try {
    const newMatchData = req.body;

    // Ensure the `teams` field contains at least one team
    if (!newMatchData.teams || newMatchData.teams.length <= 1) {
      return res
        .status(400)
        .json({ error: "At least two team must be provided" });
    }


    const teamIds = newMatchData.teams.map((team) => team.team);

    const teams = await Team.find({ _id: { $in: teamIds } });

    const allParticipants = teams.flatMap((team) => team.participants);

    const participantCount = allParticipants.reduce((acc, participant) => {
      acc[participant] = (acc[participant] || 0) + 1;
      return acc;
    }, {});

    // Check for duplicates
    const duplicateParticipants = Object.entries(participantCount)
      .filter(([_, count]) => count > 1)
      .map(([participant]) => participant);

    if (duplicateParticipants.length > 0) {
      return res
        .status(400)
        .json({
          error:
            "A player cannot be part of more than one team in the same match",
          duplicates: duplicateParticipants,
        });
    }

    const matchmakingTeamId = newMatchData.matchmakingTeam;
    newMatchData.status = "in-progress"; 
    newMatchData.agreedTeams = [matchmakingTeamId];
    newMatchData.winner = null;

    const newMatch = new Match(newMatchData);

    const savedMatch = await newMatch.save();
   // Find all other team admins to notify
   const otherTeams = teams.filter(team => team._id.toString() !== matchmakingTeamId.toString());


   const adminIds = otherTeams.flatMap(team => team.admins);


   await Promise.all(adminIds.map(adminId => {
     return Notification.create({
       user: adminId,
       type: 'matchmaking',
       message: `You have a new match request with team ID: ${newMatch._id}. Please review the details.`,
       match: savedMatch._id
     });
   }));


    res.status(201).json(savedMatch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all matches
exports.getAllMatches = async (req, res) => {
  try {
    const userId = req.params.userid;
    const userTeams = await Team.find({ participants: userId });

    if (userTeams.length === 0) {
      return res.status(404).json({ message: 'No teams found for this user.' });
    }


    const teamIds = userTeams.map(team => team._id);


    const matches = await Match.find({
      'teams.team': { $in: teamIds }
    })
    // .populate('location sport teams.team')
    // .populate({
    //   path: 'teams.team',
    //   populate: {
    //     path: 'participants.user',
    //     model: 'User',
    //     select: '_id name'
    //   }
    // })


    // If no matches are found
    if (matches.length === 0) {
      return res.status(404).json({ message: 'No matches found for this user.' });
    }

    res.status(200).json(matches);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a match by ID
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
    //   .populate("location sport teams.team")
    //   .populate({
    //     path: "teams.team",
    //     populate: {
    //       path: "participants.user",
    //       model: "User",
    //       select: "_id name",
    //     },
    //   })
    //   .populate({
    //     path: "winner",
    //     select: "_id name",
    //   });
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.status(200).json(match);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//  {
//   "teams":[
//     {"team":"66afc5cd7be83c2bf8154ece", "score": "4" },
//     {"team":"66afc58b7be83c2bf8154ec7","score":"2"}
//   ]
// }

// Update a match
exports.updateMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match.agreement) {
        return res.status(400).json({ error: "Match agreement is not finalized. Update not allowed." });
      }  
    const updatedMatchData = req.body;

    // Find the team with the highest score
    const highestScoringTeam = updatedMatchData.teams.reduce(
      (prev, current) => {
        return prev.score > current.score ? prev : current;
      }
    );  

    // Set the winner field to the team with the highest score
    updatedMatchData.winner = highestScoringTeam.team;
    updatedMatchData.status = 'completed';

    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      updatedMatchData,
      { new: true }
    )
      .populate("location sport teams.team")
      .populate({
        path: "teams.team",
        populate: {
          path: "participants.user",
          model: "User",
          select: "_id name",
        },
      })
      .populate({
        path: "winner",
        select: "_id name",
      });

    if (!updatedMatch) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.status(200).json(updatedMatch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//agreement to a match
exports.updateAgreement = async (req, res) => {
  const { matchId, teamId } = req.body;
  try {
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Ensure the team is part of the match
    const isTeamPartOfMatch = match.teams.some((t) => t.team.equals(teamId));
    if (!isTeamPartOfMatch) {
      return res.status(400).json({ message: "Team not part of this match" });
    }

    // If the team hasn't already agreed, add them to agreedTeams
    if (!match.agreedTeams) {
      match.agreedTeams = [];
    }
    if (!match.agreedTeams.includes(teamId)) {
      match.agreedTeams.push(teamId);
    }

    // Check if all teams have agreed
    if (match.agreedTeams.length === match.teams.length) {
        match.agreement = true;
        match.status = 'scheduled';
        
        // Notify all participants about the match schedule
        const teams = await Team.find({ _id: { $in: match.teams.map(t => t.team) } });
        const participants = teams.flatMap(team => team.participants);
  
        // Create notifications for all participants
        await Promise.all(participants.map(participantId => {
          return Notification.create({
            user: participantId,
            type: 'match-scheduled',
            message: `The match scheduled on ${match.date} has been confirmed. Details: ${match._id}.`,
            match: match._id
          });
        }));
      } else {
        // Notify participants of the accepting team
        const acceptingTeam = await Team.findById(teamId);
        const adminIds = acceptingTeam.admins;
        const participants = acceptingTeam.participants;
  
        // Create notifications for all participants of the accepting team
        await Promise.all(participants.map(participantId => {
          return Notification.create({
            user: participantId,
            type: 'match-accepted',
            message: `The match with team ID: ${match._id} has been accepted by your team.`,
            match: match._id
          });
        }));
      }

    await match.save();
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
