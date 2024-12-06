const User = require('../../models/User');

const getUserDataById = async (userId) => {
    try {
        // Find user by ID with all necessary population
        const userData = await User.findById(userId)
            .populate({
                path: 'matchIds',
                populate: [
                    {
                        path: 'sport',
                        select: 'name description',
                    },
                    {
                        path: 'teams.team',
                        select: 'name participants',
                        populate: {
                            path: 'participants',
                            select: 'userName name',
                        },
                    },
                    {
                        path: 'location',
                        select: 'address',
                    },
                ],
            })
            .populate({
                path: 'teamIds',
                select: 'name participants admins',
                populate: [
                    {
                        path: 'participants',
                        select: '_id userName name',
                    },
                    {
                        path: 'admins',
                        select: '_id userName name',
                    },
                ],
            })
            .populate({
                path: 'progress',
                populate: [
                    {
                        path: 'sportScores.sport',
                        select: 'name description',
                    },
                    {
                        path: 'userAchievements',
                        select: 'title description',
                    },
                ],
            })
            .populate({
                path: 'followers',
                select: 'userName name',
            })
            .populate({
                path: 'following',
                select: 'userName name',
            })
            .populate({
                path: 'likes',
                select: 'title content',
            })
            .select('-password'); // Exclude password for security reasons

        if (!userData) {
            throw new Error('User not found');
        }

        // Structure and return the response
        return {
            userName: userData.userName,
            name: userData.name,
            school: userData.school || null,
            userClass: userData.userClass || null,
            email: userData.email,
            wonMatches: userData.wonMatches || 0,
            totalMatches: userData.totalMatches || 0,
            teams: userData.teamIds || [],
            matches: userData.matchIds || [],
            progress: userData.progress ? {
                overallScore: userData.progress.overallScore || 0,
                sportScores: userData.progress.sportScores || [],
                userAchievements: userData.progress.userAchievements || [],
            } : {},
            followers: userData.followers || [],
            following: userData.following || [],
            likes: userData.likes || [],
        };
    } catch (error) {
        // Catch and rethrow errors with a clear message
        throw new Error(`Error fetching user data: ${error.message}`);
    }
};

module.exports = getUserDataById;
