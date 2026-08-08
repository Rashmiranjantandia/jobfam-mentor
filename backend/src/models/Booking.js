const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // pending -> approved (slot becomes "booked") | declined (slot returns to "open")
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending',
    },
    // Populated on approval — placeholder link using the booking's own _id
    meetingLink: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
