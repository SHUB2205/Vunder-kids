const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  user: {
    type:Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
  },
  likedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
},
{ timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);