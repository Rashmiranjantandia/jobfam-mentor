const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  approveBooking,
  declineBooking,
} = require('../controllers/bookingController');

// IMPORTANT: /mine must be registered before /:id so Express doesn't
// treat the literal string "mine" as a booking ID param.
router.get('/mine', verifyToken, getMyBookings);

router.post('/', verifyToken, requireRole('candidate'), createBooking);
router.patch('/:id/approve', verifyToken, requireRole('mentor'), approveBooking);
router.patch('/:id/decline', verifyToken, requireRole('mentor'), declineBooking);

module.exports = router;
