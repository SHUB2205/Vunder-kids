const mongoose = require('mongoose');

const SportSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Sport', SportSchema);
