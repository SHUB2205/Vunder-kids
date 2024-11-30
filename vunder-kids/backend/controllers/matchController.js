const Match = require("../models/Match");
const Team = require("../models/Team");
const schedule = require("node-schedule");
// const { CronJob } = require("cron");
const CalendarEvent = require("../models/calendarEvent");
const notificationService = require("../services/notification/notificationService.js");
const User = require("../models/User.js");
const {updateScore}=require("./progressController.js")
//when creating a match
// {
//   "date": "2024-08-10T14:00:00Z",
//   "location": "66b4a9ea7db1567036cf1b0a",
//   "sport": "66b4aa437db1567036cf1b0f",
//   "teams": [
//       {
//           "team": "66b5e9259485cf1dc0a47038",
//           "score": 0
//       },
//       {
//           "team": "66b4ad4a7db1567036cf1b19",
//           "score": 0
//       }
//   ],
//   "matchmakingTeam": "66b5e9259485cf1dc0a47038",
//   "agreementTime" : 1723266230     (this is epoch time : https://www.epochconverter.com/)
// }

//create match
exports.createMatch = async (req, res) => {
  try {
    const { team1, team2, matchdata } = req.body;

    // Determine if it's a team match
    const isTeamMatch = !!team1 && !!team2;

    let teams = [];
    let players = [];
    let team1Obj = {};
    let team2Obj = {}

    if (isTeamMatch) {
      // Team match logic
      team1Obj = await Team.findById(team1);
      team2Obj = await Team.findById(team2);

      if (!team1Obj || !team2Obj) {
        return res.status(404).json({ error: "Teams not found" });
      }

      teams = [
        { team: team1Obj._id },
        { team: team2Obj._id }
      ];

      // Combine participants from both teams
      players = [...team1Obj.participants, ...team2Obj.participants];
    } else {
      // 1on1 match logic
      // Assuming players are passed directly in the request
      players = req.body.players;
    }

    // Prepare match data
    const newMatchData = {
      ...matchdata,
      isTeamMatch,
      teams: isTeamMatch ? teams : [],
      players: players,
      status: "in-progress"
    };

    const newMatch = new Match(newMatchData);
    const savedMatch = await newMatch.save();

    // Notify participants
    const notificationRecipients = isTeamMatch 
      ? [...team1Obj.admins, ...team2Obj.admins] 
      : players;

    notificationService(
      notificationRecipients,
      'matchmaking',
      `You have a new ${isTeamMatch ? 'team' : 'individual'} match request. Please review the details.`
    );

    // Update participants' match history
    await User.updateMany(
      { _id: { $in: players } },
      { $addToSet: { matchIds: savedMatch._id } }
    );
    console.log(savedMatch.agreementTime);

    // Schedule agreement deadline job (similar to previous implementation)
    if (savedMatch.agreementTime) {
      const agreementTimeEpoch = parseInt(matchdata.agreementTime, 10);
      const agreementDate = new Date(agreementTimeEpoch * 1000);
      console.log(agreementDate);

      schedule.scheduleJob(savedMatch._id.toString(), agreementDate, async () => {
        const currentMatch = await Match.findById(savedMatch._id);
        if (currentMatch && currentMatch.status !== 'scheduled' && !currentMatch.agreement) {
          currentMatch.status = 'cancelled';
          await currentMatch.save();

          // Notify participants about cancellation
          notificationService(
            players,
            'match-cancelled',
            `The match scheduled on ${currentMatch.date} has been cancelled due to no response.`
          );
        }
      });
    }

    res.status(201).json(savedMatch);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(400).json({ error: error.message });
  }
};


// Get all matches
exports.getAllMatches = async (req, res) => {
  try {
    const userId = req.params.userid;

    // Find the user and get the matchIds
    const user = await User.findById(userId).select('matchIds');
    
    if (!user || user.matchIds.length === 0) {
      return res.status(404).json({ message: "No matches found for this user." });
    }

    // Find all matches using the matchIds from the user schema
    const matches = await Match.find({
      _id: { $in: user.matchIds }
    });

    // If no matches are found
    if (matches.length === 0) {
      return res.status(404).json({ message: "No matches found for this user." });
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
      .populate({
        path: "winner",
        select: "_id name",
      });
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
      return res
        .status(400)
        .json({
          error: "Match agreement is not finalized. Update not allowed.",
        });
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
    updatedMatchData.status = "completed";

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
    updateScore(req.params.id,updatedMatchData.winner);
    
    res.status(200).json(updatedMatch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//when updating agreement
// {
//   "matchId": "66b6f482e477b41f1c93f476",
//   "teamId": "66b4ad4a7db1567036cf1b19"
// }
//if agreement route is hit within the time, then match is scheduled,
//else cancelled

//update agreement
// exports.updateAgreement = async (req, res) => {
//   const { matchId, teamId } = req.body;

//   try {
//     const match = await Match.findById(matchId);
//     if (!match) {
//       return res.status(404).json({ message: "Match not found" });
//     }

//     // Ensure the team is part of the match
//     const isTeamPartOfMatch = match.teams.some((t) => t.team.equals(teamId));
//     if (!isTeamPartOfMatch) {
//       return res.status(400).json({ message: "Team not part of this match" });
//     }

//     // Add team to agreedTeams if they haven't already agreed
//     if (!match.agreedTeams) {
//       match.agreedTeams = [];
//     }
//     if (!match.agreedTeams.includes(teamId)) {
//       match.agreedTeams.push(teamId);
//     }

//     await match.save();

//     // Get the current time in epoch seconds
//     const nowEpoch = Math.floor(Date.now() / 1000);

//     console.log('Current Time (Epoch):', nowEpoch);
//     console.log('Agreement Time (Epoch):', match.agreementTime);

//     // Check if all teams have agreed and the current time is within the agreementTime
//     if (match.agreedTeams.length === match.teams.length && nowEpoch <= match.agreementTime) {
//       match.agreement = true;
//       match.status = 'scheduled';
//       //create event after match s scheduled
//       console.log('Match scheduled');

//       // Notify all participants about the match schedule
//       const teams = await Team.find({ _id: { $in: match.teams.map(t => t.team) } });
//       const participants = teams.flatMap(team => team.participants);

//       await Promise.all(participants.map(participantId => {
//         return Notification.create({
//           user: participantId,
//           type: 'match-scheduled',
//           message: `The match scheduled on ${match.date} has been confirmed. Details: ${match._id}.`,
//           match: match._id
//         });
//       }));

//       // Cancel any previously scheduled job for this match
//       const job = schedule.scheduledJobs[matchId];
//       if (job) {
//         job.cancel();
//         console.log(`Scheduled job for match ${matchId} has been canceled.`);
//       }
//     } else {
//       // Notify participants of the accepting team
//       const acceptingTeam = await Team.findById(teamId);
//       const participants = acceptingTeam.participants;

//       await Promise.all(participants.map(participantId => {
//         return Notification.create({
//           user: participantId,
//           type: 'match-accepted',
//           message: `The match with team ID: ${match._id} has been accepted by your team.`,
//           match: match._id
//         });
//       }));
//     }

//     await match.save();
//     res.status(200).json(match);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.updateAgreement = async (req, res) => {
  const { matchId, teamId } = req.body;

  try {
    // Find the match by ID
    const match = await Match.findById(matchId).populate("teams.team"); // Populate the teams

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Ensure the team is part of the match
    const isTeamPartOfMatch = match.teams.some((t) => t.team.equals(teamId));
    if (!isTeamPartOfMatch) {
      return res.status(400).json({ message: "Team not part of this match" });
    }

    // Add team to agreedTeams if they haven't already agreed
    if (!match.agreedTeams.includes(teamId)) {
      match.agreedTeams.push(teamId);
    }

    await match.save();

    // Get the current time in epoch seconds
    const nowEpoch = Math.floor(Date.now() / 1000);

    console.log("Current Time (Epoch):", nowEpoch);
    console.log("Agreement Time (Epoch):", match.agreementTime);

    // Check if all teams have agreed and the current time is within the agreementTime
    if (
      match.agreedTeams.length === match.teams.length &&
      nowEpoch <= match.agreementTime
    ) {
      match.agreement = true;
      match.status = "scheduled";
      console.log("Match scheduled");

      // Notify all participants about the match schedule
      const teams = await Team.find({
        _id: { $in: match.teams.map((t) => t.team) },
      });
      const participants = teams.flatMap((team) => team.participants);

      // Create and schedule the eventy
      const event = new CalendarEvent({
        title: `match Scheduled`,
        //error in here, the teams names are not displaying in the events
        description: `The match between ${match.teams
          .map((t) => t.team.name)
          .join(" and ")} has been scheduled.`,
        location: match.location,
        organizer: match.matchmakingTeam, // Matchmaking team is the organizer
        participants,
        startDate: new Date(), // Start time is the current time when the match is scheduled
        endDate: new Date(match.agreementTime * 1000), // Convert epoch time to milliseconds and set as the end date
      });

      const savedEvent = await event.save();
      console.log("events:", event);

      notificationService(
        participants,
        "match-accepted",
        `The match with team ID: ${match._id} has been accepted by your team.`,
        savedEvent._id
      );

      // Cancel any previously scheduled job for this match
      const job = schedule.scheduledJobs[matchId];
      if (job) {
        job.cancel();
        console.log(`Scheduled job for match ${matchId} has been canceled.`);
      }
    } else {
      // Notify participants of the accepting team
      const acceptingTeam = await Team.findById(teamId);
      const participants = acceptingTeam.participants;

   
      notificationService(
        participants,
        "matchmaking",
        `The match with team ID: ${match._id} has been accepted by your team.`,
        match._id
      );
    }

    await match.save();
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.scheduledMatches = async (req, res) => {
  try {
    const scheduledMatches = await Match.find({ status: 'scheduled' })
      .populate('sport' , '_id name')     // If sport is a reference
      .populate('teams.team') // Populate team details
      .populate('players' , '_id avatar userName name')    // Populate player details
      .sort({ date: 1 });     // Sort by earliest date first

    res.json(scheduledMatches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching scheduled matches', error: error.message });
  }
};

exports.getUpcomingMatches = async (req, res) => {
  try {
    // Ensure user is authenticated
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the start of the day
    // Query for my matches
    const myMatchesQuery = {
      status: { $in: ['scheduled', 'in-progress'] },
      date: { $gte: today }, // Ensure matches are for today or later
      $or: [
        { players: userId },
        { 'teams.team': { $in: user.teamIds } }
      ]
    };

    // Query for friends matches
    const friendIds = user.following.map(friend => friend._id);

    const friendsMatchesQuery = {
      status: { $in: ['scheduled'] },
      date: { $gte: today },
      $or: [
        { players: { $in: friendIds } },
        { 'teams.team': { $in: user.following.flatMap(f => f.teamIds) } }
      ]
    };

    // Fetch matches for both types
    const myMatches = await Match.find(myMatchesQuery)
      .populate('sport')
      .populate({
        path: 'teams.team',
        select: 'name'
      })
      .populate('players', '_id name userName avatar')
      .sort({ date: 1 });

    const friendsMatches = await Match.find(friendsMatchesQuery)
      .populate('sport')
      .populate({
        path: 'teams.team',
        select: 'name'
      })
      .populate('players', '_id name userName avatar')
      .sort({ date: 1 });

    res.json({
      myMatches,
      friendsMatches
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching matches', 
      error: error.message 
    });
  }
};
