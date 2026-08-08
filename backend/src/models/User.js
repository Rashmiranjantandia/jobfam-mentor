const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['candidate', 'mentor'],
      required: [true, 'Role must be candidate or mentor'],
    },
    bio: {
      type: String,
      default: '',
    },
    // Only meaningful for candidates — expertise tags live on mentors
    skills: {
      type: [String],
      default: [],
    },
    // Only meaningful for mentors — used for browse/filter
    expertiseTags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Hash the password before saving if it has been modified.
// We store the plain password temporarily on a virtual so the hook can read it.
userSchema.pre('save', async function (next) {
  // Only hash if the passwordHash field was explicitly set as a plain password
  // (We use a naming convention: call .setPassword(plain) before save)
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Convenience method to compare a plain password against the stored hash
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
