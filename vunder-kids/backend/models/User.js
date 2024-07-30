const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Match = require('./Match');
const Schema = mongoose.Schema;


  const UserSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    school: {
      type: String,
      required: true
    },
    userClass: { // Renamed 'class' to avoid reserved word conflict
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true // Indexing for faster queries
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true // Indexing for faster queries
    },
    password: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },

  matches: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  progress: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Progress' 
  },
  date: {
    type: Date,
    default: Date.now
  },
  verifyToken: {
    type: String
  },
  tokenExpiration: {
    type: Date
  },
  likes:[
    {
    type:Schema.Types.ObjectId,
    ref: 'Post',
    }
  ],
  following: [
    {
      type:Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  followers: [
    {
      type:Schema.Types.ObjectId,
      ref: 'User',
    }
  ]
});



UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;


