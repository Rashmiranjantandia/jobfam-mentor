const User = require('../models/User');
const Slot = require('../models/Slot');

/**
 * GET /api/mentors
 * Public. Returns all mentors with name, bio, expertiseTags.
 * Optional ?skill= query does a case-insensitive match against expertiseTags.
 */
const getMentors = async (req, res, next) => {
  try {
    const filter = { role: 'mentor' };

    if (req.query.skill) {
      // Case-insensitive partial match on any tag in the array
      filter.expertiseTags = {
        $elemMatch: { $regex: req.query.skill, $options: 'i' },
      };
    }

    const mentors = await User.find(filter).select('name bio expertiseTags createdAt');
    res.json(mentors);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/mentors/:id
 * Public. Returns a single mentor's full public profile.
 */
const getMentorById = async (req, res, next) => {
  try {
    const mentor = await User.findOne({ _id: req.params.id, role: 'mentor' }).select(
      'name bio expertiseTags createdAt'
    );

    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

    res.json(mentor);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/mentors/slots
 * Mentor-only. Creates a new open time slot.
 * Body: { startTime, endTime }
 */
const createSlot = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'startTime and endTime are required' });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: 'startTime must be before endTime' });
    }

    const slot = await Slot.create({
      mentorId: req.user.id,
      startTime,
      endTime,
      status: 'open',
    });

    res.status(201).json(slot);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/mentors/slots/:id
 * Mentor-only. Deletes a slot only if it belongs to this mentor and is still "open".
 * Pending/booked slots cannot be deleted — the booking flow owns those.
 */
const deleteSlot = async (req, res, next) => {
  try {
    const slot = await Slot.findById(req.params.id);

    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    if (slot.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your slot' });
    }

    if (slot.status !== 'open') {
      return res
        .status(400)
        .json({ message: 'Only open slots can be deleted' });
    }

    await slot.deleteOne();
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/mentors/:id/slots
 * Public. Returns only "open" slots for the given mentor so candidates can book.
 */
const getMentorSlots = async (req, res, next) => {
  try {
    const slots = await Slot.find({
      mentorId: req.params.id,
      status: 'open',
    }).sort({ startTime: 1 }); // ascending so earliest shows first

    res.json(slots);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMentors, getMentorById, createSlot, deleteSlot, getMentorSlots };
