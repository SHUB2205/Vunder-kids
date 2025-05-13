const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/User');
const Match = require('../models/Match');
const {cloudinary,bufferToStream} = require('../config/cloudinary');
const notificationService = require('../services/notification/notificationService');


const { validationResult } = require('express-validator');
const Notification = require('../models/Notifiication');
const { post } = require('../routes/matchRoutes');

//Get Post from id
exports.getPost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId)
      .populate('creator', '_id userName email avatar')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: {
          path: 'user',
          select: 'userName email avatar'
        },
      })
      .lean();

    
    if (!post) {
      const error = new Error('Post not found.');
      error.statusCode = 404;
      throw error;
    }
    let isLiked;
    if (req.user){
      const user = await User.findById(req.user.id);
      isLiked = user && user.likes.includes(postId);
    }
    
    if (req.user) {
      post.comments = post.comments.map(comment => ({
        ...comment,
        isLikedByCurrentUser: comment.likedBy.some(user => user._id.toString() === req.user.id.toString()),
        likedBy: comment.likedBy.length
      }));
    } else {
      post.comments = post.comments.map(comment => ({
        ...comment,
        likedBy: comment.likedBy.length
      }));
    }
    res.status(200).json({ post, isLiked });
  } catch (err) {
    console.log(err);
    next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
};

//Get Posts of a User/All Users
exports.getPosts = async (req,res,next) => {
  const {username} = req.params;
  let posts;
  try{
    if (username){
      const user = await User.findOne({userName : username});
      posts = await Post.find({ 'creator': user._id }).populate('creator', '_id userName email avatar').sort({createdAt : -1});
    }
    else{
      allPosts = await Post.find().populate('creator', '_id userName email avatar isPrivate').sort({createdAt : -1});
      const userId = req.user?.id;
      const requestingUser = userId ? await User.findById(userId) : false;
      posts = [];
      if(userId && requestingUser){
        posts = allPosts.filter((post) => {
          return (post.creator.isPrivate === false || post.creator._id.toString() === userId.toString() || (requestingUser.following.some(f => f.equals(post.creator._id))));
        })
      }
      else{
        posts = allPosts.filter((post) => {
          return (post.creator.isPrivate === false);
        })
      }
    }
    res.status(200).json({posts : posts});
  }
  catch (err){
    console.log(err);
    next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
}

//Create Post
exports.createPost = async (req, res, next) => {
    const {content} = req.body;
    let mediaURL = '';
    let mediaType = 'image';
    
    try {

      if (req.file) {
        const stream = bufferToStream(req.file.buffer);
        
        // Upload to Cloudinary using stream
        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'posts',
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
        mediaURL = uploadMediaRes.secure_url;
        mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      }

      const post = new Post({ 
        content, 
        mediaURL, 
        mediaType, 
        creator: req.user.id,
      });
      
      const result = await post.save();

      res.status(201).json({ message: 'Post created!', post: result });
    } catch (err) {
      console.log(err);
      next(err.statusCode ? err : { ...err, statusCode: 500 });
    }
  };

exports.toggleLike = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not found.');
      error.statusCode = 404;
      throw error;
    }
    const user = await User.findById(req.user.id);
    const isLiked = user.likes.includes(postId);
    const updateOp = isLiked ? '$pull' : '$push';
    const likesDelta = isLiked ? -1 : 1;
    
    const [userUpdate, postUpdate] = await Promise.all([
      User.updateOne({ _id: req.user.id }, { [updateOp]: { likes: postId } }),
      Post.findByIdAndUpdate(postId, { $inc: { likes: likesDelta } }, { new: true })
    ]);

    res.status(200).json({ 
      message: isLiked ? 'Post Unliked!' : 'Post Liked!', 
      likes: postUpdate.likes,
      isLiked: !isLiked
    });
  } catch (err) {
    console.log(err);
    next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
};

//Post Comment on /:commentid
exports.commentOnPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { postId } = req.params;
  const { content } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not found.');
      error.statusCode = 404;
      throw error;
    }
    const comment = new Comment({
      content,
      user:req.user.id
    });
    post.comments.push(comment);
   
    await Promise.all([comment.save(), post.save()]);
    res.status(201).json({ message: 'Comment added!', comment });
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
    await Comment.updateOne({ _id: commentId }, { [updateOp]: { likedBy: req.user.id } });
    const updatedComment = await Comment.findById(commentId);
    res.status(200).json({ message: 'Comment like toggled!', likes: updatedComment.likedBy.length });
  } catch (err) {
    next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
};

exports.recentPost = async (req, res , next) => {
  try {
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'creator',
        select: '_id name email'
      });
    res.json(recentPosts);
  } 
  catch (err) {
    next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
};

exports.getLikedPosts = async (req,res,next) => {
  const user = await User.findById(req.user.id);
  try{
    if (!user){
      const error = new Error('Not Authorized.');
      error.statusCode = 403;
      throw error;
    }
    const posts = await Post.find({ _id: { $in: user.likes } }).populate('creator','_id userName avatar');
    res.status(200).json({posts});
  }
  catch (err){
    next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
};

exports.toggleFollow = async (req, res, next) => {
  const { followId } = req.body;
  try {
    if (followId.toString() === req.user.id.toString()) {
      throw new Error("Can't follow own account");
    }

    const targetUser = await User.findById(followId);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) {
      throw new Error('User not found');
    }

    // Check if already following
    const isFollowing = currentUser.following?.includes(followId);
    
    if (isFollowing) {
      // Unfollow logic
      await Promise.all([
        User.updateOne(
          { _id: currentUser._id }, 
          { $pull: { following: followId } }
        ),
        User.updateOne(
          { _id: targetUser._id }, 
          { $pull: { followers: currentUser._id } }
        )
      ]);
      
      return res.status(200).json({ 
        status: 'unfollowed',
        message: 'Successfully unfollowed' 
      });
    }


    // Handle new follow/request
    const result = await targetUser.handleFollowRequest(currentUser._id);
    
    // Create notification
    if (result.status === 'followed') {
      notificationService(
        [followId],
        "follow",
        `${currentUser.name} is a follower now.`,
        currentUser._id,
        currentUser.avatar
      );
    } else if (result.status === 'requested') {
      notificationService(
        [followId],
        "followRequest",
        `${currentUser.name} requested to follow you.`,
        currentUser._id,
        currentUser.avatar
      );
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.handleFollowRequest = async (req, res, next) => {
  const { requesterId, action } = req.body;
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.followRequests.includes(requesterId)) {
      return res.status(400).json({ message: 'No such follow request exists' });
    }
    
    if (action === 'accept') {
      const accepted = await user.acceptFollowRequest(requesterId);
      if (accepted) {
        notificationService(
          [requesterId],
          "follow",
          `${user.name} accepted your follow request.`,
          user._id,
          user.avatar
        );
      }
    } else if (action === 'reject') {
      await user.rejectFollowRequest(requesterId);
    }
    
    res.status(200).json({ message: `Request ${action}ed successfully` });
  } catch (err) {
    next(err);
  }
};

exports.postMatchResult = async (req, res, next) => {
  const { matchId } = req.params;
  const { title, additionalContent } = req.body;

  try {
    // Fetch the match
    const match = await Match.findById(matchId)
      .populate('sport', 'name')
      .populate('teams.team', 'name')
      .populate('winner', 'name')
      .populate('location', 'name');

    if (!match) {
      const error = new Error('Match not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check if the match is completed
    if (match.status !== 'completed') {
      const error = new Error('Cannot post result for an incomplete match.');
      error.statusCode = 400;
      throw error;
    }

    // Generate content for the post
    const matchContent = `
    Match Result:
    Sport: ${match.sport.name}
    Location: ${match.location.name}
    Date: ${match.date.toDateString()}
    Time: ${match.date.toTimeString().split(' ')[0]}

    Teams:
    ${match.teams.map(team => `${team.team.name}: ${team.score}`).join('\n')}

    Winner: ${match.winner.name}
        `.trim();

    const content = additionalContent 
      ? `${matchContent}\n\n${additionalContent}`
      : matchContent;

    // Create the post
    const post = new Post({
      title: title || `Match Result: ${match.sport.name}`,
      content,
      creator: req.user.id,
      tags: ['match result', match.sport.name],
      // The mediaURL and mediaType will be added later on 
      mediaURL: '',
      mediaType: 'image'
    });

    const savedPost = await post.save();

    res.status(201).json({ 
      message: 'Match result posted successfully!', 
      post: savedPost 
    });

  } catch (err) {
    next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
};


// Add this to your postController.js

exports.editPost = async (req, res, next) => {
  const { postId } = req.params;
  const { content } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Post not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check if the user is the creator of the post
    if (post.creator.toString() !== req.user.id.toString()) {
      const error = new Error('Not authorized to edit this post.');
      error.statusCode = 403;
      throw error;
    }

    post.content = content;
    const updatedPost = await post.save();

    res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (err) {
    next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
};