const mongoose = require('mongoose');

const { Schema } = mongoose;

const STATUS = ['Active', 'Returned', 'Cancelled'];
// Mirrors Asset condition enum; kept local to avoid a circular model import.
const CONDITION = ['Excellent', 'Good', 'Fair', 'Damaged'];

const allocationSchema = new Schema(
  {
    asset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
      // No field-level index here: the partial unique index below on { asset: 1 }
      // already covers asset lookups (and enforces one active allocation).
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
      index: true,
    },
    // The logged-in manager who performed the allocation (set server-side).
    allocatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Manager',
      required: [true, 'allocatedBy (manager) is required'],
    },
    allocationDate: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
    },
    purpose: {
      type: String,
      trim: true,
      maxlength: [300, 'Purpose cannot exceed 300 characters'],
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: { values: STATUS, message: '{VALUE} is not a valid allocation status' },
      default: 'Active',
      index: true,
    },
    // --- Return details (populated when the asset is checked back in) ---
    actualReturnDate: {
      type: Date,
      default: null,
    },
    returnCondition: {
      type: String,
      enum: { values: CONDITION, message: '{VALUE} is not a valid condition' },
      default: null,
    },
    returnRemarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Return remarks cannot exceed 500 characters'],
      default: '',
    },
    // The manager who processed the return (set server-side from the session).
    returnedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Manager',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hard guarantee at the DB level: at most ONE active allocation per asset.
// A partial unique index only applies to documents where status === 'Active',
// so Returned/Cancelled rows are free to accumulate as history.
allocationSchema.index(
  { asset: 1 },
  { unique: true, partialFilterExpression: { status: 'Active' } }
);

allocationSchema.statics.STATUS = STATUS;
allocationSchema.statics.CONDITION = CONDITION;

module.exports = mongoose.model('Allocation', allocationSchema);
