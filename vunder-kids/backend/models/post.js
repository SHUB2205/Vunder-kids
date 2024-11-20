const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  mediaURL: {
    type: String,
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
  },
  content: {
    type: String,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;