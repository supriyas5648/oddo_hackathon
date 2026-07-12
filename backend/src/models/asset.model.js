const mongoose = require('mongoose');

const { Schema } = mongoose;

const CONDITION = ['Excellent', 'Good', 'Fair', 'Damaged'];
const STATUS = [
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Lost',
  'Retired',
  'Disposed',
];

// Sub-document for attached documents (invoices, warranty cards, etc.).
const documentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const assetSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
      maxlength: [150, 'Asset name cannot exceed 150 characters'],
    },
    // Auto-generated in the service layer (format: AF-0001). Unique + indexed.
    assetTag: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    purchaseDate: {
      type: Date,
    },
    purchaseCost: {
      type: Number,
      min: [0, 'Purchase cost cannot be negative'],
      default: 0,
    },
    warrantyExpiry: {
      type: Date,
    },
    condition: {
      type: String,
      enum: { values: CONDITION, message: '{VALUE} is not a valid condition' },
      default: 'Good',
    },
    status: {
      type: String,
      enum: { values: STATUS, message: '{VALUE} is not a valid status' },
      default: 'Available',
      index: true,
    },
    isBookable: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    documents: {
      type: [documentSchema],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index powers keyword search across the most-searched fields.
assetSchema.index({ name: 'text', assetTag: 'text', serialNumber: 'text' });

// Convenience virtual: is the warranty still valid today?
assetSchema.virtual('warrantyActive').get(function warrantyActive() {
  if (!this.warrantyExpiry) return null;
  return this.warrantyExpiry.getTime() >= Date.now();
});

assetSchema.statics.CONDITION = CONDITION;
assetSchema.statics.STATUS = STATUS;

module.exports = mongoose.model('Asset', assetSchema);
