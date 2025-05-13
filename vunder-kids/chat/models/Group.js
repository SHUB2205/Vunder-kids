const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  industry: {
    type: String,
    enum: [
      "Technology", "Banking and Financial Services", "Consulting", 
      "Insurance", "Government", "Legal Services", "Hospitality", 
      "Airlines and Aviation", "Healthcare", "Engineering", "Education", 
      "Non Profit", "Media", "Defense", "Manufacturing", "Farming", 
      "Human Resources", "Finance", "Supply Chain", "Customer Service", 
      "Marketing and Advertising", "Sales", "Player"
    ]
  },
  location: {
    type: String
  },
  passions: [{
    name: String,
    skillLevel: {
      type: String, 
      enum: ["Beginner", "Foundation", "Intermediate", "Advance", "Pro"]
    }
  }],
  joinRequests: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Group', GroupSchema);