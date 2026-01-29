const mongoose = require('mongoose');

const ReelSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaURL: { type: String, required: true },
  caption: { type: String },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  views: { type: Number, default: 0 },
  tags: [{ type: String }],
  audio: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Reel', ReelSchema);
