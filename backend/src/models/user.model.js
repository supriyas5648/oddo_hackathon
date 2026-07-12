const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

const { Schema } = mongoose;

const ROLES = ['Admin', 'Asset Manager', 'Department Head', 'Employee'];
const STATUS = ['Active', 'Inactive'];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      // Never return the hash by default; explicitly .select('+password') when needed.
      select: false,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    role: {
      type: String,
      enum: { values: ROLES, message: '{VALUE} is not a supported role' },
      default: 'Employee',
      index: true,
    },
    status: {
      type: String,
      enum: { values: STATUS, message: 'Status must be either Active or Inactive' },
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // Defensive: strip the hash even if it was explicitly selected.
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Hash the password whenever it is set/changed.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(env.bcryptSaltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Instance helper for later auth work (not used yet, but ready).
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.statics.ROLES = ROLES;
userSchema.statics.STATUS = STATUS;

module.exports = mongoose.model('User', userSchema);
