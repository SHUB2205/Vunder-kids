const Reel = require("../models/Reel");
const { validationResult } = require('express-validator');
const Comment = require("../models/comment");
const User = require("../models/User");
const {cloudinary,bufferToStream} = require('../config/cloudinary');


exports.getReels = async (req, res) => {
  try {
    const { username } = req.query; 
    let query = {};

    if (username) {
      const user = await User.findOne({ userName: username });
      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }
      query = { userId: user._id };
    }

    let reels = await Reel.find(query)
      .populate({
        path: 'userId',
        select: '_id userName avatar isPrivate'
      })
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: {
          path: 'user',
          select: '_id userName avatar'
        },
        transform: (comment) => ({
          ...comment.toObject(),
          isLiked: req.user ? comment.likedBy.includes(req.user.id) : false,
          likeCount: comment.likedBy.length
        }),
      })
      .sort({ createdAt: -1 });

      const userId = req.user?.id;
      const requestingUser =userId ? await User.findById(userId) : false;
      if(userId && requestingUser){
      reels = reels.filter(reel => {
        return (reel.userId.isPrivate === false || reel.userId._id === userId || (requestingUser.following.some(f => f.equals(reel.userId._id))));
      });
    }
    else{
      reels = reels.filter(reel=>{
        return (reel.userId.isPrivate === false);
      });
    }
    res.status(200).json({ reels });
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Error fetching reels",
      error: err.message
    });
  }
};

exports.createReel = async(req, res) => {
  let videoUrl = '';
  const {description} = req.body;

  if (req.file) {
    const stream = bufferToStream(req.file.buffer);
    
    // Upload to Cloudinary using stream
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'reels',
          resource_type: 'auto', // Automatically detect resource type
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      stream.pipe(uploadStream);
    });
    const uploadMediaRes = await uploadPromise;
    videoUrl = uploadMediaRes.secure_url;
  }

  if (!videoUrl) return res.status(404).json({message: "Video not provided"});
  if (!description.trim()) return res.status(404).json({message: "Description not provided"});
  
  const reel = new Reel({
    userId: req.user.id,
    videoUrl: videoUrl,
    description: description.trim()
  });

  const savedReel = await reel.save();
  res.send(savedReel);
};





exports.toggleLikeReel = async (req, res) => {
  try {
      const reelId = req.params.reelId;
      const userId = req.user.id;

      const reel = await Reel.findById(reelId);
      if (!reel) {
          return res.status(404).json({message: "Reel not found"});
      }

      const isLiked = reel.likes.includes(userId);
      const updateOp = isLiked ? '$pull' : '$push';

      const updatedReel = await Reel.findByIdAndUpdate(
          reelId,
          { [updateOp]: { likes: userId } },
          { new: true }
      ).populate({path: 'userId',select: '_id userName avatar'})
      .populate({path: 'comments',populate: {path: 'user',select: '_id userName avatar'}});

      res.status(200).json({message: isLiked ? 'Reel unliked' : 'Reel liked',reel: updatedReel});
  } catch (err) {
      res.status(500).json({
          success: false,
          message: "Error toggling like",
          error: err.message
      });
  }
};

exports.commentOnReel = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { reelId } = req.params;
  const { content } = req.body;

  try {
      const reel = await Reel.findById(reelId);
      if (!reel) {
          const error = new Error('Reel not found.');
          error.statusCode = 404;
          throw error;
      }

      const comment = new Comment({
          content,
          user: req.user.id
      });

      reel.comments.push(comment);

      await Promise.all([comment.save(), reel.save()]);

      const populatedComment = await Comment.findById(comment._id).populate({
        path: 'user',
        select: '_id userName avatar'
    });

      res.status(201).json({  message: 'Comment added!' ,comment : populatedComment});

  } catch (err) {
      next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
};

exports.toggleLikeComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { commentId } = req.params;

  try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
          const error = new Error('Comment not found.');
          error.statusCode = 404;
          throw error;
      }

      const isLiked = comment.likedBy.includes(req.user.id);
      const updateOp = isLiked ? '$pull' : '$push';

      const updatedComment = await Comment.findByIdAndUpdate(
          commentId,
          { [updateOp]: { likedBy: req.user.id } },
          { new: true }
      ).populate({
          path: 'user',
          select: '_id userName avatar'
      });

      res.status(200).json({
          success: true, 
          message: isLiked ? 'Comment unliked' : 'Comment liked',
          comment: updatedComment,
          likesCount: updatedComment.likedBy.length
      });

  } catch (err) {
      next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
};

exports.getUsersLikedReel = async (req, res, next) => {
  try {
    const reels = await Reel.find({ 
      likes: req.user.id 
    })
    .populate({
      path: 'userId',
      select: '_id userName avatar'
    })
    .populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: '_id userName avatar'
      }
    })
    .sort({ createdAt: -1 });

    res.status(200).json({ reels });
  } catch (err) {
    console.log(err);
    next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
};
