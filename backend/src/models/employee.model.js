const mongoose = require('mongoose');

const { Schema } = mongoose;

const STATUS = ['Active', 'Inactive'];

/**
 * Employee = a person an asset can be allocated to / transferred between.
 * Employees are NOT application users — they cannot log in and have no
 * password. Authentication is handled exclusively by the Manager model.
 */
const employeeSchema = new Schema(
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
    // Free-text job title (e.g. "Software Engineer"). Replaces the old app "role".
    designation: {
      type: String,
      trim: true,
      maxlength: [120, 'Designation cannot exceed 120 characters'],
      default: '',
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

employeeSchema.index({ name: 'text', email: 'text' });

employeeSchema.statics.STATUS = STATUS;

module.exports = mongoose.model('Employee', employeeSchema);
