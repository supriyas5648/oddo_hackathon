const mongoose = require('mongoose');

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [120, 'Category name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    // Icon identifier or URL used by the frontend (e.g. "laptop", "fa-car").
    icon: {
      type: String,
      trim: true,
      default: '',
    },
    // Whether assets in this category can be shared across departments.
    isSharedResource: {
      type: Boolean,
      default: false,
    },
    // Whether assets in this category require warranty tracking.
    requiresWarranty: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.index({ name: 'text' });

module.exports = mongoose.model('Category', categorySchema);
