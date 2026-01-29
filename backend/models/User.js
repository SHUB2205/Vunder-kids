const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userName: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: function() { return !this.googleId; } },
  avatar: { 
    type: String, 
    default: 'https://res.cloudinary.com/dlolz3flx/image/upload/v1734952795/jgwiq6esp4mipcltneeo.jpg' 
  },
  bio: { type: String, default: '' },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  location: { type: String },
  isVerified: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false },
  
  // Social
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Sports & Passions
  passions: [{
    name: { type: String, required: true },
    skillLevel: { type: String, enum: ['Beginner', 'Foundation', 'Intermediate', 'Advance', 'Pro'] }
  }],
  
  // Matches & Teams
  matchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
  teamIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  
  // Messaging
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  privateChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  lastSeen: { type: Map, of: Date, default: {} },
  
  // Notifications
  notificationToken: { type: String },
  
  // Auth
  googleId: { type: String, unique: true, sparse: true },
  isGoogleUser: { type: Boolean, default: false },
  verifyToken: { type: String },
  tokenExpiration: { type: Date },
  
  // Likes
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  
  // Industry
  industry: {
    type: String,
    enum: ['Technology', 'Banking', 'Consulting', 'Healthcare', 'Education', 'Player', 'Other'],
    default: 'Player'
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Handle follow request
UserSchema.methods.handleFollowRequest = async function(requesterId) {
  const User = mongoose.model('User');
  const requester = await User.findById(requesterId);
  if (!requester) throw new Error('Requester not found');
  
  if (!this.isPrivate) {
    if (!this.followers.includes(requesterId)) {
      this.followers.push(requesterId);
      requester.following.push(this._id);
      await Promise.all([this.save(), requester.save()]);
    }
    return { status: 'followed', message: 'Successfully followed' };
  }
  
  if (!this.followRequests.includes(requesterId)) {
    this.followRequests.push(requesterId);
    await this.save();
    return { status: 'requested', message: 'Follow request sent' };
  }
  
  return { status: 'pending', message: 'Request already pending' };
};

module.exports = mongoose.model('User', UserSchema);
