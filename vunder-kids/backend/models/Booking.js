const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      index: { expires: '24h' }
    }
  }, { timestamps: true });

// Custom validation to ensure endTime is after startTime
bookingSchema.pre('validate', function(next) {
  if (this.startTime >= this.endTime) {
    this.invalidate('endTime', 'End time must be after start time');
  }
  next();
});

// Method to calculate total price based on duration and place's price per hour
bookingSchema.pre('save', async function(next) {
  if (this.isModified('startTime') || this.isModified('endTime') || this.isNew) {
    const Place = mongoose.model('Place');
    const place = await Place.findById(this.place);
    
    if (!place) {
      throw new Error('Associated place not found');
    }

    const durationHours = (this.endTime - this.startTime) / (1000 * 60 * 60);
    this.totalPrice = durationHours * place.pricePerHour;
  }
  next();
});

// Static method to check for booking conflicts
bookingSchema.statics.checkForConflicts = async function(placeId, startTime, endTime, excludeBookingId = null) {
  const conflictingBookings = await this.find({
    place: placeId,
    _id: { $ne: excludeBookingId },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      { startTime: { $gte: startTime, $lt: endTime } },
      { endTime: { $gt: startTime, $lte: endTime } }
    ]
  });
  
  return conflictingBookings.length > 0;
};

module.exports = mongoose.model('Booking', bookingSchema);