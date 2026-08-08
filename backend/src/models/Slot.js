const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    // Tracks the slot through its lifecycle:
    // open -> pending (candidate books) -> booked (mentor approves) | open (mentor declines)
    status: {
      type: String,
      enum: ['open', 'pending', 'booked'],
      default: 'open',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slot', slotSchema);
