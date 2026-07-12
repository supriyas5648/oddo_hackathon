const mongoose = require('mongoose');

const { Schema } = mongoose;

const STATUS = ['Active', 'Inactive'];

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
      maxlength: [120, 'Department name cannot exceed 120 characters'],
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Department code cannot exceed 20 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    // Self-reference to build a department hierarchy/tree.
    parentDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    departmentHead: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

// Text-ish search support and common lookups.
departmentSchema.index({ name: 'text', code: 'text' });

// Virtual: direct children of this department (not persisted).
departmentSchema.virtual('subDepartments', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'parentDepartment',
});

departmentSchema.statics.STATUS = STATUS;

module.exports = mongoose.model('Department', departmentSchema);
