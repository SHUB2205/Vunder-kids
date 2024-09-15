const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, bookingController.createBooking);
router.get('/:id', authMiddleware, bookingController.getBooking);
router.put('/:id/status', authMiddleware, bookingController.updateBookingStatus);
router.put('/:id/cancel', authMiddleware, bookingController.cancelBooking);
router.put('/:id/extend', authMiddleware, bookingController.extendBookingExpiration);
router.get('/user/bookings', authMiddleware, bookingController.getUserBookings);
router.get('/place/:placeId/bookings', authMiddleware, bookingController.getPlaceBookings);

module.exports = router;