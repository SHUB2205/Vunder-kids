const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/User');
//adding cloudinary integration at time of frontend
// const upload = require('../cloudinary');
const { validationResult } = require('express-validator');

//Get Post from id
exports.getPost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId)
      .populate('creator', '_id name email')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name email'
        }
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
      const user = await User.findOne({name : username});
      posts = await Post.find({ 'creator': user._id }).populate('creator', '_id name email').sort({createdAt : -1});
    }
    else{
      posts = await Post.find().populate('creator', '_id name email').sort({createdAt : -1});
    }
    res.status(200).json({posts : posts});
  }
  catch (err){
    next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
}

//Create Post
exports.createPost = [
//   upload.single('media'), 
  async (req, res, next) => {
    
    const { title, content, tags } = req.body;
    let mediaURL = '';
    let mediaType = 'image';

    // if (req.file) {
    //   mediaURL = req.file.path;
      
    //   if (req.file.mimetype.startsWith('image/')) {
    //     mediaType = 'image';
    //   } else if (req.file.mimetype.startsWith('video/')) {
    //     mediaType = 'video';
    //   }
    // }
    
    try {
      const post = new Post({ 
        title, 
        content, 
        mediaURL, 
        mediaType, 
        creator: req.user.id,
        tags
      });
      
      const result = await post.save();

      res.status(201).json({ message: 'Post created!', post: result });
    } catch (err) {
      console.log(err);
      next(err.statusCode ? err : { ...err, statusCode: 500 });
    }
  }
];




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
    const isLiked = req.user.likes.includes(postId);
    const updateOp = isLiked ? '$pull' : '$push';
    const likesDelta = isLiked ? -1 : 1;
    
    const [userUpdate, postUpdate] = await Promise.all([
      User.updateOne({ _id: req.user._id }, { [updateOp]: { likes: postId } }),
      Post.findByIdAndUpdate(postId, { $inc: { likes: likesDelta } }, { new: true })
    ]);

    res.status(200).json({ 
      message: isLiked ? 'Post Unliked!' : 'Post Liked!', 
      likes: postUpdate.likes,
      isLiked: !isLiked
    });
  } catch (err) {
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
  const user = req.user;
  try{
    if (!user){
      const error = new Error('Not Authorized.');
      error.statusCode = 403;
      throw error;
    }
    const posts = await Post.find({ _id: { $in: req.user.likes } }).populate('creator','_id username profilePic');
    res.status(200).json({posts});
  }
  catch (err){
    next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
};

exports.toggleFollow = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { followId } = req.body;
  try {
    if (followId.toString() === req.user.id.toString()) {
      const error = new Error("Can't follow own account");
      error.statusCode = 403;
      throw error;
    }

    const followUser = await User.findById(followId);
    const user =await User.findById(req.user.id);

    if (!followUser) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const isFollowing = user.following.includes(followId);
    const updateOp = isFollowing ? '$pull' : '$push';
    await Promise.all([
      User.updateOne({ _id: user._id }, { [updateOp]: { 'following': followId } }),
      User.updateOne({ _id: followUser._id }, { [updateOp]: { 'followers': user._id} })
    ]);
    res.status(200).json({ message: 'Follow status updated!' });
  } catch (err) {
    next(err.statusCode ? err : { ...err, statusCode: 500 });
  }
};