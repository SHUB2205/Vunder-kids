const User = require("../models/User");
const Post = require("../models/post");
const { ObjectId } = require('mongodb'); 

const userName=async(req,res)=>{
    try {
        let query = {};
    
        // Check if name query parameter is provided
        if (req.query.name) {
            query.$or = [
              { name: { $regex: req.query.name, $options: 'i' } }, // Search by name
              { userName: { $regex: req.query.name, $options: 'i' } } // Search by username
            ];
          }
    
        const users = await User.find(query).select('-password');
        success=true;
        res.status(200).json({msg:"This is the user",users,success});
      } catch (error) {
        res.json({ msg: error.message,success });
      }
}



const search = async (req, res, next) => {
  const { query } = req.query;
  let userId = '';
  if (req.user && req.user.id) userId = req.user.id;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Search for users
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: new ObjectId(userId) }, // Exclude the current user
          $or: [
            { userName: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } },
            { 'passions.name': { $regex: query, $options: 'i' } } // Match on passions
          ]
        }
      },
      {
        $addFields: {
          matchType: {
            $cond: [
              { $regexMatch: { input: '$userName', regex: new RegExp(query, 'i') } },
              'userName',
              {
                $cond: [
                  { $regexMatch: { input: '$name', regex: new RegExp(query, 'i') } },
                  'name',
                  'passion'
                ]
              }
            ]
          }
        }
      },
      {
        $sort: {
          matchType: { $eq: ['userName', 'userName'] } ? -1 : 0, // Prioritize userName, then name, then passion
          name: 1 // Secondary alphabetical sorting
        }
      },
      {
        $project: {
          userName: 1,
          name: 1,
          avatar: 1,
          followRequests:1,
          followers: { $size: "$followers" },
          matchType: 1 // Include match type for debugging or UI usage
        }
      }
    ]);

    // Search for posts
    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    }).populate('creator', 'userName name avatar');

    res.status(200).json({
      users,
      posts
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

module.exports = {
    userName,
    search
};
  