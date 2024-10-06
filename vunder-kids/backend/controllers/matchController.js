const Match = require("../models/Match");
const Team = require("../models/Team");
const schedule = require("node-schedule");
const { CronJob } = require("cron");
const CalendarEvent = require("../models/calendarEvent");

const notificationService = require('../services/notification/notificationService.js');

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
    const newMatchData = req.body;

    // Ensure the `teams` field contains at least one team
    if (!newMatchData.teams || newMatchData.teams.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one team must be provided" });
    }

    // Extract team IDs from the teams array
    const teamIds = newMatchData.teams.map(team => team.team);

    // Fetch all teams using the teamIds
    const teams = await Team.find({ _id: { $in: teamIds } });
    if (teams.length !== teamIds.length) {
      return res.status(404).json({ error: "Some teams were not found" });
    }

    // Gather all participants from all teams
    const allParticipants = teams.flatMap(team => team.participants);

    // Check for duplicate participants
    const participantCount = allParticipants.reduce((acc, participant) => {
      acc[participant] = (acc[participant] || 0) + 1;
      return acc;
    }, {});

    const duplicateParticipants = Object.entries(participantCount)
      .filter(([_, count]) => count > 1)
      .map(([participant]) => participant);

    if (duplicateParticipants.length > 0) {
      return res
        .status(400)
        .json({
          error: "A player cannot be part of more than one team in the same match",
          duplicates: duplicateParticipants,
        });
    }

    // Set default match properties
    newMatchData.status = "in-progress";
    newMatchData.agreedTeams = teamIds;
    newMatchData.winner = null;

    const newMatch = new Match(newMatchData);
    const savedMatch = await newMatch.save();

    // Get the admin who is creating the match (assuming the requester is the admin)
    const matchCreatorAdminId = req.user.id;  // Assuming req.user holds the authenticated user's ID

    // Notify all other team admins and participants except the match creator
    const otherTeams = await Team.find({ id: { $ne: teamId } });
    const otherAdminsAndParticipants = otherTeams.flatMap(team => [
      ...team.admins.filter(admin => admin.toString() !== matchCreatorAdminId.toString()), // Exclude the match creator
      ...team.participants.filter(participant => participant.toString() !== matchCreatorAdminId.toString()) // Exclude the match creator if they are a participant
    ]);

    // Remove duplicates using a Set
    const usersToNotify = [...new Set(otherAdminsAndParticipants.map(user => user.toString()))];

    // Send notifications to all other admins and participants
    notificationService(
      // otherAdminsAndParticipants,
      usersToNotify,
      'matchmaking',
      `You have a new match request with team ID: ${savedMatch._id}. Please review the details.`,
      savedMatch._id
    );

    // Notify all other team admins

    // const otherTeams = await Team.find({ _id: { $ne: teamId } });
    // const admins = otherTeams.flatMap(otherTeam => otherTeam.admins);

    // await Promise.all(adminIds.map(adminId => {
    //   return Notification.create({
    //     user: adminId,
    //     type: 'matchmaking',
    //     message: `You have a new match request with team ID: ${savedMatch._id}. Please review the details.`,
    //     match: savedMatch._id
    //   });
    // }));

    // notificationService(
    //   admins,
    //   'matchmaking',
    //   `You have a new match request with team ID: ${savedMatch._id}. Please review the details.`,
    //   savedMatch._id
    // );

    const admins = teams.flatMap(team => team.admins);

    notificationService(
      admins,
      'matchmaking',
      `You have a new match request with match ID: ${savedMatch._id}. Please review the details.`,
      savedMatch._id
    );


    // Remove duplicates from allParticipants (in case of same player in multiple teams)
    const uniqueParticipants = [...new Set(allParticipants)];

    // Update each participant's matchIds field
    await User.updateMany(
      { _id: { $in: uniqueParticipants } }, // Match all participants
      { $addToSet: { matchIds: savedMatch._id } } // Add the match ID to the user's matchIds array, avoiding duplicates
    );

    // Schedule a job to check the agreement deadline if agreementTime is provided
    if (newMatchData.agreementTime) {
      const agreementTimeEpoch = parseInt(newMatchData.agreementTime, 10); // Ensure it's an integer
      const agreementDate = new Date(agreementTimeEpoch * 1000); // Convert seconds to milliseconds if necessary

      console.log('Scheduling Job for Agreement Deadline:', agreementDate);

      schedule.scheduleJob(savedMatch._id.toString(), agreementDate, async () => {
        console.log('Job Triggered at:', new Date());

        const currentMatch = await Match.findById(savedMatch._id);
        if (currentMatch && currentMatch.status !== 'scheduled' && !currentMatch.agreement) {
          currentMatch.status = 'cancelled';
          console.log('Match cancelled due to no agreement within the time limit.');
          await currentMatch.save();

          // Notify both teams about the match cancellation
          const teams = await Team.find({ _id: { $in: currentMatch.teams.map(t => t.team) } });
          const participants = teams.flatMap(team => team.participants);
          
          notificationService(

            participant,

            participants,

            'matchmaking',
            `The match scheduled on ${currentMatch.date} has been cancelled due to no response.`,
            currentMatch._id
          );
        }
      });
    }

    res.status(201).json(savedMatch);
  } catch (error) {
    console.error('Error creating match:', error); // Log the error for debugging
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
    updateScore(req.params.id,updatedMatchData.winner)
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

    // Find the match by ID and populate teams
    const match = await Match.findById(matchId).populate('teams.team');

    // Find the match by ID
    const match = await Match.findById(matchId).populate("teams.team"); // Populate the teams


    // If no match is found, return 404
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Ensure the team is part of the match
    const isTeamPartOfMatch = match.teams.some((t) => t.team.equals(teamId));
    if (!isTeamPartOfMatch) {
      return res.status(400).json({ message: "Team not part of this match" });
    }

    // Add the team to agreedTeams if they haven't already agreed
    if (!match.agreedTeams.includes(teamId)) {
      match.agreedTeams.push(teamId);
    }

    // Save the match with the new agreement
    await match.save();

    // Get the current time in epoch seconds
    const nowEpoch = Math.floor(Date.now() / 1000);

    console.log('Current Time (Epoch):', nowEpoch);
    console.log('Agreement Time (Epoch):', match.agreementTime);

    // Check if all teams have agreed and the current time is within the agreementTime
    if (match.agreedTeams.length === match.teams.length && nowEpoch <= match.agreementTime) {
      // Set match status to 'scheduled'
      match.agreement = true;
      match.status = 'scheduled';

      console.log('Match scheduled');

      // Get all participants from the teams
      const teams = await Team.find({ _id: { $in: match.teams.map(t => t.team) } });
      const participants = teams.flatMap(team => team.participants);


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


      // Create and schedule the event
      const event = new CalendarEvent({

        title: 'Match Scheduled',
        description: `The match between ${teams.map(t => t.name).join(' and ')} has been scheduled.`,

        title: `match Scheduled`,
        //error in here, the teams names are not displaying in the events
        description: `The match between ${match.teams
          .map((t) => t.team.name)
          .join(" and ")} has been scheduled.`,

        location: match.location,
        organizer: match.matchmakingTeam, // Matchmaking team is the organizer
        participants,

        startDate: new Date(),  // The current date (when the event is created)
        endDate: new Date(match.agreementTime * 1000)  // The agreement time as the end date

        startDate: new Date(), // Start time is the current time when the match is scheduled
        endDate: new Date(match.agreementTime * 1000), // Convert epoch time to milliseconds and set as the end date

      });

      // Save the event in the calendar
      const savedEvent = await event.save();

      console.log("Event Created: ", savedEvent);

      // Notify all participants about the scheduled match
      notificationService(
        participants,
        'match-scheduled',
        `A new match event has been scheduled to end on ${new Date(match.agreementTime * 1000)}. Event ID: ${savedEvent._id}.`,
        savedEvent._id
      );

      // Schedule a push notification 24 hours before the match start time
      const matchStartTime = new Date(match.agreementTime * 1000);  // Convert agreement time to a date
      const notificationTime = new Date(matchStartTime.getTime() - 2 * 60 * 1000);  // 2 minutes before match start
      // const notificationTime = new Date(matchStartTime.getTime() - 24 * 60 * 60 * 1000);  // 24 hours before the match start time

      // Schedule the notification job
      schedule.scheduleJob(savedEvent._id.toString(), notificationTime, () => {
        notificationService(
          participants,
          'match-reminder',
          `Reminder: The match between ${teams.map(t => t.name).join(' and ')} starts in 24 hours.`,
          savedEvent._id
        );
        console.log('Reminder notification sent 24 hours before the event.');
      });

      console.log("events:", event);

      notificationService(
        participants,
        "matchmaking",
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


      console.log("Match scheduling logic executed successfully.");
    }
    // Save the match after updating its status or sending notifications
    await match.save();

    // Send the match response back to the client
    res.status(200).json(match);
  } catch (error) {
    // Error handling
    res.status(500).json({ message: error.message });
  }

}
};

