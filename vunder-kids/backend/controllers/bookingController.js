const Booking = require('../models/Booking');
const Facility = require('../models/Facility');


exports.createBooking = async (req, res) => {
    try {
      const { placeId, startTime, endTime } = req.body;
      
      // Check if the place exists
      const facility = await Facility.findById(placeId);
      if (!facility) {
        return res.status(404).json({ message: 'Facility not found' });
      }
  
      // Check for booking conflicts
      const hasConflicts = await Booking.checkForConflicts(placeId, new Date(startTime), new Date(endTime));
      if (hasConflicts) {
        return res.status(400).json({ message: 'This time slot is already booked' });
      }
  
      const booking = new Booking({
        facility: placeId,
        user: req.user._id,  // Assuming you have user authentication middleware
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      });
  
      const newBooking = await booking.save();
      res.status(201).json(newBooking);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('facility').populate('user', '-password');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if the user is authorized to view this booking
    if (booking.user._id.toString() !== req.user.id.toString() && booking.place.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('facility');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the user is authorized to update this booking
    if (booking.place.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the user is authorized to cancel this booking
    if (booking.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('facility');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPlaceBookings = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.placeId);
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Check if the user is authorized to view these bookings
    if (facility.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these bookings' });
    }

    const bookings = await Booking.find({ facility: req.params.placeId }).populate('user', '-password');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};