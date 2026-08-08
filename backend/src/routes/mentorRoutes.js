const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getMentors,
  getMentorById,
  createSlot,
  deleteSlot,
  getMentorSlots,
} = require('../controllers/mentorController');

// ── Public routes ────────────────────────────────────────────────────────────
router.get('/', getMentors);               // GET /api/mentors?skill=xyz
router.get('/:id', getMentorById);         // GET /api/mentors/:id
router.get('/:id/slots', getMentorSlots);  // GET /api/mentors/:id/slots

// ── Mentor-only routes ───────────────────────────────────────────────────────
// IMPORTANT: /slots must come BEFORE /:id so Express matches it correctly.
// Express matches routes in registration order; if /:id were first it would
// capture "slots" as the :id param and never reach the dedicated handler.
router.post('/slots', verifyToken, requireRole('mentor'), createSlot);
router.delete('/slots/:id', verifyToken, requireRole('mentor'), deleteSlot);

module.exports = router;
