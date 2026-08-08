const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User');
const { sendMail } = require('../config/mailer');

/**
 * POST /api/bookings
 * Candidate-only. Books an open slot.
 *
 * Status transitions on this action:
 *   Slot:    "open"    -> "pending"   (locked so no one else can book it)
 *   Booking: (created) -> "pending"   (awaiting mentor decision)
 */
const createBooking = async (req, res, next) => {
  try {
    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ message: 'slotId is required' });

    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    if (slot.status !== 'open') {
      return res.status(400).json({ message: 'Slot is not available for booking' });
    }

    // Lock the slot immediately to prevent concurrent booking requests
    slot.status = 'pending';
    await slot.save();

    const booking = await Booking.create({
      slotId,
      mentorId: slot.mentorId,
      candidateId: req.user.id,
      status: 'pending',
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings/mine
 * Role-aware — candidates see their own bookings, mentors see requests on their slots.
 * Populates names and slot times so the frontend doesn't need extra calls.
 */
const getMyBookings = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'candidate') {
      query = Booking.find({ candidateId: req.user.id });
    } else {
      // Mentor: see all bookings where this mentor owns the slot
      query = Booking.find({ mentorId: req.user.id });
    }

    const bookings = await query
      .populate('slotId', 'startTime endTime status')
      .populate('mentorId', 'name email')
      .populate('candidateId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/bookings/:id/approve
 * Mentor-only. Must own the slot tied to this booking.
 *
 * Status transitions:
 *   Booking: "pending" -> "approved"
 *   Slot:    "pending" -> "booked"
 *
 * Generates a placeholder meeting link and emails BOTH parties.
 */
const approveBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('slotId')
      .populate('mentorId', 'name email')
      .populate('candidateId', 'name email');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only the mentor who owns the slot can approve
    if (booking.mentorId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your booking to approve' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be approved' });
    }

    // Generate a placeholder meeting link using the booking's own ID
    const meetingLink = `https://meet.jobfam.example/${booking._id}`;

    booking.status = 'approved';
    booking.meetingLink = meetingLink;
    await booking.save();

    // Mark slot as permanently booked
    await Slot.findByIdAndUpdate(booking.slotId._id, { status: 'booked' });

    // Build human-readable time strings for the email
    const startTime = new Date(booking.slotId.startTime).toUTCString();
    const endTime = new Date(booking.slotId.endTime).toUTCString();

    const emailHtml = `
      <h2>Your mentoring session is confirmed! 🎉</h2>
      <p><strong>Mentor:</strong> ${booking.mentorId.name}</p>
      <p><strong>Candidate:</strong> ${booking.candidateId.name}</p>
      <p><strong>Time:</strong> ${startTime} – ${endTime}</p>
      <p><strong>Meeting link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
      <p>See you there!</p>
      <hr>
      <small>Jobfam Mentor Booking Platform</small>
    `;

    // Send confirmation to both parties (non-blocking — failures are logged, not thrown)
    await Promise.all([
      sendMail(booking.candidateId.email, 'Your session is confirmed — Jobfam', emailHtml),
      sendMail(booking.mentorId.email, 'Session confirmed — Jobfam', emailHtml),
    ]);

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/bookings/:id/decline
 * Mentor-only. Must own the slot.
 *
 * Status transitions:
 *   Booking: "pending" -> "declined"
 *   Slot:    "pending" -> "open"    (slot becomes available again)
 */
const declineBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('slotId');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your booking to decline' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be declined' });
    }

    booking.status = 'declined';
    await booking.save();

    // Release the slot so another candidate can book it
    await Slot.findByIdAndUpdate(booking.slotId._id, { status: 'open' });

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getMyBookings, approveBooking, declineBooking };
