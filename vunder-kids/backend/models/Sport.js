const mongoose = require('mongoose');

const SportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  }
});

const Sport = mongoose.model('Sport', SportSchema);

module.exports = Sport;