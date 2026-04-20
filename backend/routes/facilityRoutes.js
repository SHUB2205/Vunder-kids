const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Facility = require('../models/Facility');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// @route   GET /api/facilities
// @desc    Get all facilities (optional: sport, city, state, location — location is legacy single substring)
router.get('/', auth, async (req, res) => {
  try {
    const { sport, location, city, state, name, limit } = req.query;
    const conditions = [{ isActive: true }];

    if (name) {
      conditions.push({ name: new RegExp(escapeRegex(name), 'i') });
    }
    if (sport) {
      conditions.push({
        sports: new RegExp(`^${escapeRegex(sport)}$`, 'i'),
      });
    }
    if (city) {
      conditions.push({ location: new RegExp(escapeRegex(city), 'i') });
    }
    if (state) {
      conditions.push({ location: new RegExp(escapeRegex(state), 'i') });
    }
    if (location && !city && !state) {
      conditions.push({ location: new RegExp(escapeRegex(location), 'i') });
    }

    const mongoFilter = conditions.length === 1 ? conditions[0] : { $and: conditions };
    let query = Facility.find(mongoFilter).sort({ rating: -1 });
    if (limit) query = query.limit(parseInt(limit, 10));
    const facilities = await query;
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

// @route   POST /api/facilities
// @desc    Create a custom facility
router.post('/', auth, async (req, res) => {
  try {
    const { name, location, description, sports, pricePerHour, amenities, openingHours, image } = req.body;

    if (!name || !location || pricePerHour == null) {
      return res.status(400).json({ message: 'Name, location and price per hour are required' });
    }

    const facility = new Facility({
      name: name.trim(),
      location: location.trim(),
      description: description?.trim() || '',
      sports: Array.isArray(sports) ? sports : [],
      pricePerHour: Number(pricePerHour),
      amenities: Array.isArray(amenities) ? amenities : [],
      openingHours: openingHours || { open: '06:00', close: '22:00' },
      image: image || '',
      owner: req.user._id,
      isActive: true,
    });

    await facility.save();
    res.status(201).json({ facility });
  } catch (error) {
    console.error('Create facility error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
