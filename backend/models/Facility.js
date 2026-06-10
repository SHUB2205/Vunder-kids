const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  day: { type: Number, required: true }, // 0-6 (Sunday-Saturday)
  open: { type: String, required: true }, // "06:00"
  close: { type: String, required: true }, // "22:00"
  isOpen: { type: Boolean, default: true }
}, { _id: false });

const FacilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  
  // Location details
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, default: 'India' },
  pincode: { type: String },
  location: { type: String }, // Legacy field - full address string
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  
  // Media
  image: { type: String }, // Primary image
  images: [{ type: String }], // Gallery
  
  // Sports & Pricing
  sports: [{ type: String }],
  pricePerHour: { type: Number, required: true },
  pricePerSlot: { type: Number }, // If different from hourly
  slotDuration: { type: Number, default: 60 }, // Minutes per slot
  currency: { type: String, default: 'INR' },
  
  // Scheduling
  schedule: [TimeSlotSchema], // Weekly schedule
  openingHours: { // Legacy/simple format
    open: { type: String, default: '06:00' },
    close: { type: String, default: '22:00' }
  },
  blockedDates: [{ type: Date }], // Holidays, maintenance
  
  // Ratings & Reviews
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Amenities & Features
  amenities: [{ type: String }], // Parking, Changing Room, etc.
  surfaceType: { type: String }, // Grass, Turf, Indoor, etc.
  capacity: { type: Number }, // Max players
  
  // Owner & Management
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  contactPhone: { type: String },
  contactEmail: { type: String },
  
  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  
  // Stats
  totalBookings: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

// Index for geo queries
FacilitySchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });
FacilitySchema.index({ city: 1, sports: 1 });
FacilitySchema.index({ owner: 1 });

// Calculate average rating on review add
FacilitySchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.totalReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Facility', FacilitySchema);
