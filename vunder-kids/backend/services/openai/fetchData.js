const User = require('../../models/User'); 

const getUserDataById = async (userId) => {
    try {
        const userData = await User.findById(userId)
            .populate({
                path: 'matchIds',
                populate: [
                    {
                        path: 'sport',            // Populate sport data
                        select: 'name description', // Include only name and description from Sport
                    },
                    {
                        path: 'teams.team',       // Populate team data inside matches
                        select: 'name participants', // Include team name and participants
                        populate: {
                            path: 'participants',  // Populate participants inside teams
                            select: 'userName name',
                        },
                    },
                    {
                        path: 'location',         // Populate match location
                        select: 'address',        // Include location address
                    },
                ],
            })
            .populate({
                path: 'teamIds',
                select: 'name participants admins',    // Include 'admins' along with 'participants' and 'name'
                populate: [
                    {
                        path: 'participants',          // Populate participants field
                        select: '_id userName name',   // Select both _id and name fields
                    },
                    {
                        path: 'admins',                // Populate admins field
                        select: '_id userName name',   // Select both _id and name fields for admins as well
                    }
                ]
            })
            .populate({
                path: 'progress',
                populate: [
                    {
                        path: 'sportScores.sport',
                        select: 'name description', // Populate sports inside progress
                    },
                    {
                        path: 'userAchievements',    // Populate achievements inside progress
                        select: 'title description',
                    },
                ],
            })
            .populate({
                path: 'followers',              // Populate followers if they exist
                select: 'userName name',
            })
            .populate({
                path: 'following',              // Populate following users if they exist
                select: 'userName name',
            })
            .populate({
                path: 'likes',                  // Populate liked entities (e.g., posts, etc.)
                select: 'title content',        // Select fields to include in likes
            }).select('-password');

        if (!userData) {
            throw new Error('User not found');
        }

        // Convert the userData to a plain object to work with it easily
        const userObject = userData.toObject();
        // console.log(JSON.stringify(userObject,null,2))
        return {
            userName: userObject.userName,
            name: userObject.name,
            school: userObject.school,
            userClass: userObject.userClass,
            email: userObject.email,
            wonMatches: userObject.wonMatches,
            totalMatches: userObject.totalMatches,
            teams: userObject.teamIds,            // Fully populated team data
            matches: userObject.matchIds,         // Fully populated match data
            progress: userObject.progress ? {
                overallScore: userObject.progress.overallScore,
                sportScores: userObject.progress.sportScores || [],  // Handle undefined sportScores
                userAchievements: userObject.progress.userAchievements || [], // Handle undefined userAchievements
            } : {},  // Handle missing progress field
            followers: userObject.followers || [],      // Fully populated followers data
            following: userObject.following || [],      // Fully populated following data
            likes: userObject.likes || [],              // Fully populated likes data
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = getUserDataById;
