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
          _id: { $ne: new ObjectId(userId) },
          $or: [
            { userName: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          userName: 1,
          name: 1,
          avatar: 1,
          followers: { $size: "$followers" }
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
  