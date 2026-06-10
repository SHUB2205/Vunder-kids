const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Facility = require('../models/Facility');
const Booking = require('../models/Booking');
const Match = require('../models/Match');
const User = require('../models/User');
const Notification = require('../models/Notification');

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==================== PUBLIC/USER ROUTES ====================

// @route   GET /api/facilities
// @desc    Get all facilities with filters (main booking page)
router.get('/', auth, async (req, res) => {
  try {
    const { sport, city, state, location, name, limit, lat, lng, radius, minPrice, maxPrice, amenities, sortBy } = req.query;
    const conditions = [{ isActive: true }];

    if (name) {
      conditions.push({ name: new RegExp(escapeRegex(name), 'i') });
    }
    if (sport) {
      conditions.push({ sports: new RegExp(`^${escapeRegex(sport)}$`, 'i') });
    }
    if (city) {
      conditions.push({ city: new RegExp(escapeRegex(city), 'i') });
    }
    if (state) {
      conditions.push({ state: new RegExp(escapeRegex(state), 'i') });
    }
    if (location && !city && !state) {
      conditions.push({
        $or: [
          { location: new RegExp(escapeRegex(location), 'i') },
          { address: new RegExp(escapeRegex(location), 'i') },
          { city: new RegExp(escapeRegex(location), 'i') }
        ]
      });
    }
    if (minPrice) {
      conditions.push({ pricePerHour: { $gte: Number(minPrice) } });
    }
    if (maxPrice) {
      conditions.push({ pricePerHour: { $lte: Number(maxPrice) } });
    }
    if (amenities) {
      const amenityList = amenities.split(',');
      conditions.push({ amenities: { $all: amenityList } });
    }

    const mongoFilter = conditions.length === 1 ? conditions[0] : { $and: conditions };
    
    let sortOption = { isFeatured: -1, rating: -1 };
    if (sortBy === 'price_low') sortOption = { pricePerHour: 1 };
    if (sortBy === 'price_high') sortOption = { pricePerHour: -1 };
    if (sortBy === 'rating') sortOption = { rating: -1 };
    if (sortBy === 'popular') sortOption = { totalBookings: -1 };

    let query = Facility.find(mongoFilter)
      .select('-reviews')
      .sort(sortOption);
    
    if (limit) query = query.limit(parseInt(limit, 10));
    
    const facilities = await query;
    res.json({ facilities });
  } catch (error) {
    console.error('Get facilities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/featured
// @desc    Get featured facilities for home page
router.get('/featured', auth, async (req, res) => {
  try {
    const facilities = await Facility.find({ isActive: true, isFeatured: true })
      .select('-reviews')
      .sort({ rating: -1 })
      .limit(10);
    res.json({ facilities });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/nearby
// @desc    Get nearby facilities based on coordinates
router.get('/nearby', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 10, sport } = req.query; // radius in km
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Coordinates required' });
    }

    const conditions = [{ isActive: true }];
    if (sport) {
      conditions.push({ sports: new RegExp(`^${escapeRegex(sport)}$`, 'i') });
    }

    // Simple distance filter (approximate)
    const latRange = Number(radius) / 111; // ~111km per degree
    const lngRange = Number(radius) / (111 * Math.cos(Number(lat) * Math.PI / 180));
    
    conditions.push({
      'coordinates.lat': { $gte: Number(lat) - latRange, $lte: Number(lat) + latRange },
      'coordinates.lng': { $gte: Number(lng) - lngRange, $lte: Number(lng) + lngRange }
    });

    const facilities = await Facility.find({ $and: conditions })
      .select('-reviews')
      .limit(20);

    res.json({ facilities });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/:id
// @desc    Get facility by ID with full details
router.get('/:id', auth, async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id)
      .populate('owner', 'name userName avatar')
      .populate('reviews.user', 'name userName avatar');

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Increment view count
    facility.viewCount = (facility.viewCount || 0) + 1;
    await facility.save();

    res.json({ facility });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/:id/availability
// @desc    Get available slots for a facility on a specific date
router.get('/:id/availability', auth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    const queryDate = new Date(date);
    const dayOfWeek = queryDate.getDay();

    // Get schedule for this day
    let daySchedule = facility.schedule?.find(s => s.day === dayOfWeek);
    if (!daySchedule) {
      daySchedule = { open: facility.openingHours?.open || '06:00', close: facility.openingHours?.close || '22:00', isOpen: true };
    }

    if (!daySchedule.isOpen) {
      return res.json({ available: false, slots: [], message: 'Facility closed on this day' });
    }

    // Check if date is blocked
    const isBlocked = facility.blockedDates?.some(d => 
      new Date(d).toDateString() === queryDate.toDateString()
    );
    if (isBlocked) {
      return res.json({ available: false, slots: [], message: 'Facility not available on this date' });
    }

    // Generate all slots
    const slotDuration = facility.slotDuration || 60;
    const [openHour, openMin] = daySchedule.open.split(':').map(Number);
    const [closeHour, closeMin] = daySchedule.close.split(':').map(Number);
    
    const allSlots = [];
    let currentTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    while (currentTime + slotDuration <= closeTime) {
      const hours = Math.floor(currentTime / 60);
      const mins = currentTime % 60;
      allSlots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
      currentTime += slotDuration;
    }

    // Get booked slots for this date
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      facility: req.params.id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] }
    });

    const bookedSlots = bookings.flatMap(b => b.slots || []);

    const slots = allSlots.map(slot => ({
      time: slot,
      available: !bookedSlots.includes(slot),
      price: facility.pricePerSlot || facility.pricePerHour
    }));

    res.json({ 
      available: true, 
      slots,
      schedule: daySchedule,
      pricePerSlot: facility.pricePerSlot || facility.pricePerHour
    });
  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/facilities/book
// @desc    Book a facility and auto-create match
router.post('/book', auth, async (req, res) => {
  try {
    const { facilityId, date, startTime, endTime, slots, sport, totalAmount, notes, opponentId } = req.body;

    if (!facilityId || !date || !startTime || !endTime || !sport) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Check slot availability
    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      facility: facilityId,
      date: { $gte: startOfDay, $lte: endOfDay },
      slots: { $in: slots || [startTime] },
      status: { $nin: ['cancelled'] }
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({ message: 'Some slots are already booked' });
    }

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      facility: facilityId,
      date: queryDate,
      startTime,
      endTime,
      slots: slots || [startTime],
      sport,
      totalAmount: totalAmount || facility.pricePerHour,
      status: 'confirmed',
      confirmedAt: new Date(),
      notes
    });

    await booking.save();

    // Auto-create match
    const matchDate = new Date(date);
    const [hours, mins] = startTime.split(':').map(Number);
    matchDate.setHours(hours, mins, 0, 0);

    const match = new Match({
      name: `${sport} at ${facility.name}`,
      sportName: sport,
      date: matchDate,
      startTime,
      endTime,
      facility: facilityId,
      location: facility.address || facility.location,
      coordinates: facility.coordinates,
      booking: booking._id,
      creator: req.user._id,
      players: [req.user._id],
      status: opponentId ? 'pending-approval' : 'scheduled',
      opponent: opponentId || null,
      opponentApproved: false
    });

    await match.save();

    // Link match to booking
    booking.match = match._id;
    await booking.save();

    // Update facility stats
    facility.totalBookings = (facility.totalBookings || 0) + 1;
    await facility.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalBookings': 1 }
    });

    // Create notification for user
    await Notification.create({
      recipient: req.user._id,
      type: 'booking',
      message: `Your booking at ${facility.name} is confirmed for ${new Date(date).toLocaleDateString()}`,
      data: { bookingId: booking._id, matchId: match._id }
    });

    // Notify opponent if specified
    if (opponentId) {
      await Notification.create({
        recipient: opponentId,
        type: 'match_invite',
        message: `${req.user.name} has invited you to a ${sport} match at ${facility.name}`,
        data: { matchId: match._id, bookingId: booking._id },
        sender: req.user._id
      });
    }

    // Notify facility owner
    if (facility.owner && facility.owner.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: facility.owner,
        type: 'new_booking',
        message: `New booking at ${facility.name} for ${new Date(date).toLocaleDateString()}`,
        data: { bookingId: booking._id }
      });
    }

    // Populate and return
    const populatedBooking = await Booking.findById(booking._id)
      .populate('facility', 'name address image')
      .populate('match');

    res.status(201).json({ 
      booking: populatedBooking,
      match
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/bookings/my
// @desc    Get user's bookings
router.get('/bookings/my', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ date: -1 })
      .populate('facility', 'name address image sports pricePerHour')
      .populate('match', 'status scores opponent opponentApproved');

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/facilities/:id/review
// @desc    Add review to facility
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Check if user has booked this facility
    const hasBooked = await Booking.findOne({
      user: req.user._id,
      facility: req.params.id,
      status: 'completed'
    });

    if (!hasBooked) {
      return res.status(400).json({ message: 'You can only review facilities you have booked' });
    }

    // Check if already reviewed
    const existingReview = facility.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this facility' });
    }

    facility.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    facility.updateRating();
    await facility.save();

    res.json({ message: 'Review added', facility });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/facilities/bookings/:id/cancel
// @desc    Cancel a booking
router.put('/bookings/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user._id;
    booking.cancellationReason = reason;
    await booking.save();

    // Cancel associated match
    if (booking.match) {
      await Match.findByIdAndUpdate(booking.match, { status: 'cancelled' });
    }

    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== FACILITY OWNER ROUTES ====================

// @route   POST /api/facilities
// @desc    Create a new facility (facility owner)
router.post('/', auth, async (req, res) => {
  try {
    const { 
      name, address, city, state, pincode, description, sports, 
      pricePerHour, amenities, openingHours, schedule, image, images,
      contactPhone, contactEmail, surfaceType, capacity, coordinates
    } = req.body;

    if (!name || !address || !city || pricePerHour == null) {
      return res.status(400).json({ message: 'Name, address, city and price per hour are required' });
    }

    const facility = new Facility({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state?.trim(),
      pincode,
      location: `${address}, ${city}${state ? ', ' + state : ''}`,
      description: description?.trim() || '',
      sports: Array.isArray(sports) ? sports : [],
      pricePerHour: Number(pricePerHour),
      amenities: Array.isArray(amenities) ? amenities : [],
      openingHours: openingHours || { open: '06:00', close: '22:00' },
      schedule: schedule || [],
      image: image || '',
      images: images || [],
      contactPhone,
      contactEmail,
      surfaceType,
      capacity,
      coordinates,
      owner: req.user._id,
      isActive: true,
    });

    await facility.save();

    // Update user role and owned facilities
    await User.findByIdAndUpdate(req.user._id, {
      $set: { role: 'facility_owner' },
      $push: { ownedFacilities: facility._id }
    });

    res.status(201).json({ facility });
  } catch (error) {
    console.error('Create facility error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/owner/my
// @desc    Get facilities owned by current user
router.get('/owner/my', auth, async (req, res) => {
  try {
    const facilities = await Facility.find({ owner: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ facilities });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facilities/owner/:facilityId/bookings
// @desc    Get bookings for a facility (owner only)
router.get('/owner/:facilityId/bookings', auth, async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.facilityId);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    if (facility.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { date, status } = req.query;
    const filter = { facility: req.params.facilityId };
    
    if (date) {
      const queryDate = new Date(date);
      const startOfDay = new Date(queryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(queryDate);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }
    
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ date: 1, startTime: 1 })
      .populate('user', 'name userName avatar phone');

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/facilities/:id
// @desc    Update facility (owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    if (facility.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedUpdates = [
      'name', 'address', 'city', 'state', 'pincode', 'description', 'sports',
      'pricePerHour', 'pricePerSlot', 'slotDuration', 'amenities', 'openingHours',
      'schedule', 'blockedDates', 'image', 'images', 'contactPhone', 'contactEmail',
      'surfaceType', 'capacity', 'coordinates', 'isActive'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        facility[field] = req.body[field];
      }
    });

    // Update location string
    if (req.body.address || req.body.city) {
      facility.location = `${facility.address}, ${facility.city}${facility.state ? ', ' + facility.state : ''}`;
    }

    await facility.save();
    res.json({ facility });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/facilities/:id/schedule
// @desc    Update facility schedule (owner only)
router.put('/:id/schedule', auth, async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    if (facility.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { schedule, blockedDates } = req.body;
    
    if (schedule) facility.schedule = schedule;
    if (blockedDates) facility.blockedDates = blockedDates;

    await facility.save();
    res.json({ facility });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/facilities/:id
// @desc    Delete/deactivate facility (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    if (facility.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Soft delete
    facility.isActive = false;
    await facility.save();

    res.json({ message: 'Facility deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
