const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  title: { type: String },
  mediaURL: { type: String },
  mediaType: { type: String, enum: ['image', 'video'] },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  tags: [{ type: String }],
  sport: { type: String, index: true },
  sportTags: [{ type: String }],
  location: { type: String },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

PostSchema.index({ sport: 1, createdAt: -1 });
PostSchema.index({ sportTags: 1 });

module.exports = mongoose.model('Post', PostSchema);
