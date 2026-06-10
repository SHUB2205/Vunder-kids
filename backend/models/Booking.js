const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  // Core booking info
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  
  // Date & Time
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true }, // "11:00"
  slots: [{ type: String }], // ["09:00", "10:00"] - individual hour slots
  duration: { type: Number }, // Total minutes booked
  
  // Sport for this booking
  sport: { type: String, required: true },
  
  // Auto-created match
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  
  // Pricing
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'partial'],
    default: 'pending'
  },
  paymentMethod: { type: String },
  paymentId: { type: String }, // External payment reference
  
  // Cancellation
  cancelledAt: { type: Date },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancellationReason: { type: String },
  
  // Notes
  notes: { type: String },
  facilityNotes: { type: String }, // Notes from facility owner
  
  // Confirmation
  bookingCode: { type: String, unique: true },
  confirmedAt: { type: Date }
}, { timestamps: true });

// Generate unique booking code
BookingSchema.pre('save', function(next) {
  if (!this.bookingCode) {
    this.bookingCode = 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

// Indexes
BookingSchema.index({ user: 1, date: -1 });
BookingSchema.index({ facility: 1, date: 1 });
BookingSchema.index({ match: 1 });
BookingSchema.index({ bookingCode: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
