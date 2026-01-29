const mongoose = require('mongoose');

const FacilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  images: [{ type: String }],
  sports: [{ type: String }],
  pricePerHour: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  amenities: [{ type: String }],
  openingHours: {
    open: { type: String, default: '06:00' },
    close: { type: String, default: '22:00' }
  },
  isActive: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Facility', FacilitySchema);
