const User = require('../models/User');

/**
 * GET /api/users/me
 * Returns the authenticated user's full profile.
 */
const getMe = async (req, res, next) => {
  try {
    // Exclude passwordHash from the response
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/me
 * Updates bio and individual skill/tag management.
 *
 * Supported body fields:
 *   bio           — plain string, replaces existing bio
 *   addSkills     — array of skills to add (candidates)
 *   removeSkills  — array of skills to remove (candidates)
 *   addTags       — array of expertiseTags to add (mentors)
 *   removeTags    — array of expertiseTags to remove (mentors)
 *
 * We support add/remove rather than full overwrite so the frontend
 * can manage individual tag chips without sending the entire array.
 */
const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { bio, addSkills, removeSkills, addTags, removeTags } = req.body;

    if (bio !== undefined) user.bio = bio;

    if (user.role === 'candidate') {
      if (Array.isArray(addSkills)) {
        // Merge without duplicates
        user.skills = [...new Set([...user.skills, ...addSkills])];
      }
      if (Array.isArray(removeSkills)) {
        user.skills = user.skills.filter((s) => !removeSkills.includes(s));
      }
    }

    if (user.role === 'mentor') {
      if (Array.isArray(addTags)) {
        user.expertiseTags = [...new Set([...user.expertiseTags, ...addTags])];
      }
      if (Array.isArray(removeTags)) {
        user.expertiseTags = user.expertiseTags.filter((t) => !removeTags.includes(t));
      }
    }

    // isModified check won't re-hash because we're not touching passwordHash
    await user.save();

    const updated = await User.findById(user._id).select('-passwordHash');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe };
