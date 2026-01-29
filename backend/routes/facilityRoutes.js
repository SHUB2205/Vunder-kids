const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Facility = require('../models/Facility');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @route   GET /api/facilities
// @desc    Get all facilities
router.get('/', auth, async (req, res) => {
  try {
    const { sport, location } = req.query;
    const filter = { isActive: true };

    if (sport) filter.sports = sport;
    if (location) filter.location = new RegExp(location, 'i');

    const facilities = await Facility.find(filter).sort({ rating: -1 });
    res.json({ facilities });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/:id
// @desc    Get facility by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id)
      .populate('reviews.user', 'name userName avatar');

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    res.json({ facility });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/facilities/book
// @desc    Book a facility
router.post('/book', auth, async (req, res) => {
  try {
    const { facilityId, date, slots, totalAmount } = req.body;

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Check for existing bookings
    const existingBooking = await Booking.findOne({
      facility: facilityId,
      date: new Date(date),
      slots: { $in: slots },
      status: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Some slots are already booked' });
    }

    const booking = new Booking({
      user: req.user._id,
      facility: facilityId,
      date: new Date(date),
      slots,
      totalAmount,
      status: 'confirmed',
    });

    await booking.save();

    // Create notification
    await Notification.create({
      recipient: req.user._id,
      type: 'booking',
      message: `Your booking at ${facility.name} is confirmed`,
    });

    res.status(201).json({ booking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/bookings/my
// @desc    Get user's bookings
router.get('/bookings/my', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ date: -1 })
      .populate('facility', 'name location image');

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
