const Match = require("../models/Match");
const Team = require("../models/Team");
const schedule = require("node-schedule");
// const { CronJob } = require("cron");
const CalendarEvent = require("../models/calendarEvent");
const notificationService = require("../services/notification/notificationService.js");
const User = require("../models/User.js");
const { updateScore } = require("./progressController.js");
const Progress = require("../models/Progress.js");

exports.createMatch = async (req, res) => {
  try {
    const { team1, team2, matchdata } = req.body;

    // Determine if it's a team match
    const isTeamMatch = !!team1 && !!team2;
    let teams = [];
    let players = [];
    let team1Obj = {};
    let team2Obj = {};

    // Get the creator's ID (assuming it's in the request body or determined in some other way)
    const creatorUserId = req.user.id;
    const creatorUser = await User.findById(creatorUserId);

    if (!creatorUser) {
      return res.status(404).json({ error: "Creator not found" });
    }

    // You can also retrieve the creator's image here (if available)
    const creatorUserImage = creatorUser.avatar; // Example: assuming the user has an image field

    if (isTeamMatch) {
      team1Obj = await Team.findById(team1);
      team2Obj = await Team.findById(team2);

      if (!team1Obj || !team2Obj) {
        return res.status(404).json({ error: "Teams not found" });
      }

      teams = [{ team: team1Obj._id }, { team: team2Obj._id }];

      // Combine participants from both teams
      players = [...team1Obj.participants, ...team2Obj.participants];

      // Fetch team leader data including their image
      const team1Leader = await User.findById(team1Obj.admins[0]);
      const team2Leader = await User.findById(team2Obj.admins[0]);

      if (!team1Leader || !team2Leader) {
        return res.status(404).json({ error: "Team leaders not found" });
      }

      // Separate participants excluding the creator
      const team1RemainingPlayers = team1Obj.participants.filter(
        (participant) =>
          participant.toString() !== creatorUserId &&
          participant.toString() !== team1Leader._id.toString()
      );

      const team2RemainingPlayers = team2Obj.participants.filter(
        (participant) =>
          participant.toString() !== creatorUserId &&
          participant.toString() !== team2Leader._id.toString()
      );

      // Notify Team 1 Leader
      if (team1Leader._id.toString() !== creatorUserId) {
        notificationService(
          [team1Leader._id],
          "matchmaking",
          `You have been chosen as the team leader for the match: ${matchdata.name}. `,
          team2Leader._id,
          team2Leader.avatar // Pass creator image as initiator
        );
      }

      // Notify Team 2 Leader
      if (team2Leader._id.toString() !== creatorUserId) {
        notificationService(
          [team2Leader._id],
          "matchmaking",
          `You have been chosen as the team leader for the match: ${matchdata.name}.`,
          team1Leader._id,
          team1Leader.avatar // Pass creator image as initiator
        );
      }

      // Notify Team 1 Players (excluding the creator and leader)
      if (team1RemainingPlayers.length > 0) {
        notificationService(
          team1RemainingPlayers,
          "matchmaking",
          `You have been selected as a player for the match: ${matchdata.name}. Your team leader is ${team1Leader.name}.`,
          team1Leader._id,
          team1Leader.avatar // Pass team leader's image
        );
      }

      // Notify Team 2 Players (excluding the creator and leader)
      if (team2RemainingPlayers.length > 0) {
        notificationService(
          team2RemainingPlayers,
          "matchmaking",
          `You have been selected as a player for the match: ${matchdata.name}. Your team leader is ${team2Leader.name}.`,
          team2Leader._id,
          team2Leader.avatar // Pass team leader's image
        );
      }

      console.log("Team 1 remaining players:", team1RemainingPlayers);
      console.log("Team 2 remaining players:", team2RemainingPlayers);
    } else {
      // Handle individual match logic
      players = req.body.players;

      // Notify players (excluding the creator)
      const otherPlayers = players.filter(
        (player) => player.toString() !== creatorUserId
      );
      notificationService(
        otherPlayers,
        "matchmaking",
        `You have been chosen for a new individual match : ${matchdata.name} . Please check the match details.`,
        creatorUserId, // Pass the creator as the person who initiated the match
        creatorUserImage // Pass the creator's image
      );
    }

    // Prepare match data
    const newMatchData = {
      ...matchdata,
      isTeamMatch,
      teams: isTeamMatch ? teams : [],
      players: players,
      status: "in-progress",
      creator: creatorUserId, // Adding creator to the match data
      admins: isTeamMatch
        ? [team1Obj.admins[0], team2Obj.admins[0]] // For team matches
        : players, // For 1-on-1, creator is admin along with the player
    };

    const newMatch = new Match(newMatchData);
    const savedMatch = await newMatch.save();

    await User.updateMany(
      { _id: { $in: players } },
      { $addToSet: { matchIds: savedMatch._id } }
    );

    // Schedule agreement deadline job
    if (savedMatch.agreementTime) {
      const agreementTimeEpoch = parseInt(matchdata.agreementTime, 10);
      const agreementDate = new Date(agreementTimeEpoch * 1000);

      schedule.scheduleJob(
        savedMatch._id.toString(),
        agreementDate,
        async () => {
          const currentMatch = await Match.findById(savedMatch._id);
          if (
            currentMatch &&
            currentMatch.status !== "scheduled" &&
            !currentMatch.agreement
          ) {
            currentMatch.status = "cancelled";
            await currentMatch.save();

            // Notify players about cancellation (excluding the creator)
            notificationService(
              players.filter((player) => player.toString() !== creatorUserId),
              "match-cancelled",
              `The match scheduled on ${currentMatch.date} has been cancelled due to no response.`,
              null,
              null
            );
          }
        }
      );
    }

    res.status(201).json(savedMatch);
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get all matches
exports.getAllMatches = async (req, res) => {
  try {
    const userId = req.params.userid;

    // Find the user and get the matchIds
    const user = await User.findById(userId).select("matchIds");

    if (!user || user.matchIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No matches found for this user." });
    }

    // Find all matches using the matchIds from the user schema
    const matches = await Match.find({
      _id: { $in: user.matchIds },
    });

    // If no matches are found
    if (matches.length === 0) {
      return res
        .status(404)
        .json({ message: "No matches found for this user." });
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

// Update a match (score)
exports.updateMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match.agreement) {
      return res.status(400).json({
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
    updateScore(req.params.id, updatedMatchData.winner);

    res.status(200).json(updatedMatch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.updateAgreement2 = async (req, res) => {
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
    const scheduledMatches = await Match.find({ status: "scheduled" })
      .populate("sport", "_id name") // If sport is a reference
      .populate("teams.team") // Populate team details
      .populate("players", "_id avatar userName name") // Populate player details
      .sort({ date: 1 }); // Sort by earliest date first

    res.json(scheduledMatches);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching scheduled matches",
        error: error.message,
      });
  }
};

exports.getUpcomingMatches = async (req, res) => {
  try {
    // Ensure user is authenticated
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the start of the day
    // Query for my matches
    const myMatchesQuery = {
      status: { $in: ["scheduled", "in-progress"] },
      date: { $gte: today }, // Ensure matches are for today or later
      $or: [{ players: userId }, { "teams.team": { $in: user.teamIds } }],
    };
    // Query for friends matches
    const friendIds = user.following.map((friend) => friend._id);

    const friendsMatchesQuery = {
      status: { $in: ["scheduled"] },
      date: { $gte: today },
      $or: [
        { players: { $in: friendIds } },
        { "teams.team": { $in: user.following.flatMap((f) => f.teamIds) } },
      ],
    };

    // Fetch matches for both types
    const myMatches = await Match.find(myMatchesQuery)
      .populate("sport")
      .populate({
        path: "teams.team",
        select: "name",
      })
      .populate("players", "_id name userName avatar")
      .sort({ date: 1 });

    const friendsMatches = await Match.find(friendsMatchesQuery)
      .populate("sport")
      .populate({
        path: "teams.team",
        select: "name",
      })
      .populate("players", "_id name userName avatar")
      .sort({ date: 1 });

    res.json({
      myMatches,
      friendsMatches,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching matches",
      error: error.message,
    });
  }
};


exports.updateAgreement = async (req, res) => {
  try {
    const { matchId, userResponse } = req.body;
    const userId = req.user.id; // Acting user's ID
    const userInfo = await User.findById(userId);
    if (!matchId) {
      return res.status(400).json({ message: "Match ID is required" });
    }


    // Find the match by ID
    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // If the response is true, update agreement and status
    if (userResponse === "accept") {
      match.agreement = true;
      match.status = "scheduled";

      // Save the updated match
      await match.save();

      // Notify all players except the acting user
      const playersToNotify = match.players.filter(
        (playerId) => playerId !== userId
      );
      notificationService(
        playersToNotify,
        "matchmaking",
        `The match "${match.name}" has been scheduled.`,
        userId,
        userInfo.avatar // Pass creator image as initiator
      );

      return res.status(200).json({
        message:
          "Agreement updated successfully, match scheduled, and notifications sent.",
        match,
      });
    } else {

      match.agreement = false;
      match.status = "cancelled";
          // Save the updated match
          await match.save();
      // Notify all players except the acting user about rejection
      const playersToNotify = match.players.filter(
        (playerId) => playerId !== userId
      );
      notificationService(
        playersToNotify,
        "matchmaking",
        `Opponent team leader has rejected the agreement for the match "${match.name}".`,
        userId,
        userInfo.avatar // Pass creator image as initiator
      );
      return res.status(200).json({
        message: "User did not agree. Notifications sent to other players.",
      });
    }
  } catch (error) {
    console.error("Error updating agreement:", error);
    return res.status(500).json({
      message: "An error occurred while updating the agreement.",
      error: error.message,
    });
  }
};

//To Do:
//more than onces posible
//only admin should have permission
exports.updateMatch2 = async (req, res, next) => {
  const { matchId, score1, score2 } = req.body;

  try {
    // Find the match and populate necessary references
    const match = await Match.findById(matchId)
      .populate('teams.team') // Populate team if it's a team match
      .populate('players') // Populate players if it's an individual match
      .populate('sport'); // Populate the sport details

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Ensure sport exists
    if (!match.sport) {
      return res.status(400).json({ message: 'Sport not specified for the match' });
    }

    // Handle Team Match
    if (match.isTeamMatch) {
      // Ensure we have two teams
      if (match.teams.length !== 2) {
        return res.status(400).json({ message: 'Match must have exactly two teams' });
      }
    
      const [team1, team2] = match.teams;
    
      let winnerTeam, loserTeam;
      if (score1 > score2) {
        winnerTeam = team1.team;
        loserTeam = team2.team;
        match.winner = { type: 'Team', ref: team1.team._id };
      } else if (score2 > score1) {
        winnerTeam = team2.team;
        loserTeam = team1.team;
        match.winner = { type: 'Team', ref: team2.team._id };
      } else {
        return res.status(400).json({ message: 'Draw not supported. A clear winner is required.' });
      }
    
      // Update team players progress
      const updateTeamPlayersProgress = async (team, isWinner) => {
        for (const playerId of team.participants) {
          // Find the user
          const user = await User.findById(playerId);
          
          if (user && user.progress) {
            // Find the progress document
            const userProgress = await Progress.findById(user.progress);
            
            if (userProgress) {
              // Update overall progress
              userProgress.overallScore += isWinner ? 10 : 5;
              userProgress.totalMatches += 1;
              if (isWinner) userProgress.matchesWon += 1;
    
              // Find or create sport-specific score entry
              let sportScoreEntry = userProgress.sportScores.find(
                ss => ss.sport.toString() === match.sport._id.toString()
              );
    
              if (!sportScoreEntry) {
                sportScoreEntry = {
                  sport: match.sport._id,
                  score: isWinner ? 10 : 5,
                  totalMatches: 1,
                  wonMatches: isWinner ? 1 : 0
                };
                userProgress.sportScores.push(sportScoreEntry);
              }
    
              // Update sport-specific progress
              sportScoreEntry.totalMatches += 1;
              if (isWinner) {
                sportScoreEntry.wonMatches += 1;
                sportScoreEntry.score += 10;
              } else {
                sportScoreEntry.score += 5;
              }
    
              await userProgress.save();
            }
          }
        }
      };
    
      // Update progresses for both teams
      await updateTeamPlayersProgress(winnerTeam, true);
      await updateTeamPlayersProgress(loserTeam, false);
    }
    // Handle Individual Player Match
    else {
      // Ensure we have exactly 2 players
      if (match.players.length !== 2) {
        return res.status(400).json({ message: 'Individual match must have exactly two players' });
      }

      const [player1, player2] = match.players;

      let winner, loser;
      if (score1 > score2) {
        winner = player1;
        loser = player2;
        match.winner = { type: 'User', ref: player1._id };
      } else if (score2 > score1) {
        winner = player2;
        loser = player1;
        match.winner = { type: 'User', ref: player2._id };
      } else {
        return res.status(400).json({ message: 'Draw not supported. A clear winner is required.' });
      }

      // Update winner's progress
      const updatePlayerProgress = async (player, isWinner) => {
        const playerProgress = await Progress.findById(player.progress);
        
        if (playerProgress) {
          // Overall progress
          playerProgress.overallScore += isWinner ? 10 : 5;
          playerProgress.totalMatches += 1;
          if (isWinner) playerProgress.matchesWon += 1;

          // Find or create sport-specific score entry
          let sportScoreEntry = playerProgress.sportScores.find(
            ss => ss.sport.toString() === match.sport._id.toString()
          );

          if (!sportScoreEntry) {
            sportScoreEntry = {
              sport: match.sport._id,
              score: isWinner ? 10 : 5,
              totalMatches: 1,
              wonMatches: isWinner ? 1 : 0
            };
            playerProgress.sportScores.push(sportScoreEntry);
          }

          // Update sport-specific progress
          sportScoreEntry.totalMatches += 1;
          if (isWinner) {
            sportScoreEntry.wonMatches += 1;
            sportScoreEntry.score += 10;
          } else {
            sportScoreEntry.score += 5;
          }

          await playerProgress.save();
        }
      };

      // Update progresses for both players
      await updatePlayerProgress(winner, true);
      await updatePlayerProgress(loser, false);
    }

    // Update match status and save
    match.status = 'completed';
    match.scores = [score1,score2];
    await match.save();

    res.status(200).json({
      message: 'Match updated successfully',
      match: {
        _id: match._id,
        isTeamMatch: match.isTeamMatch,
        winner: match.winner,
        status: match.status,
        scores: [score1, score2]
      }
    });

  } catch (error) {
    console.error('Error updating match:', error);
    next(error);
  }
};

exports.getCompletedMatchesByUsername = async (req, res) => {
  try {
    // Find user by username
    const user = await User.findOne({ userName: req.params.username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find matches where user is in players and status is completed
    const matches = await Match.find({ 
      players: user._id,
      status: 'completed' 
    })
    .populate({
      path: 'sport',
      select: 'name'
    })
    .populate({
      path: 'teams.team',
      select: 'name'
    })
    .populate({
      path: 'winner.ref',
      select: 'name userName'
    })
    .populate('players' ,'name userName avatar')
    .sort({ date: -1 }); // Sort by most recent first

    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching completed matches', 
      error: error.message 
    });
  }
};