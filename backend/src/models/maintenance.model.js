const mongoose = require('mongoose');

const { Schema } = mongoose;

const STATUS = ['Pending', 'In Progress', 'Completed'];
// Condition an asset can be returned to service in (never "Damaged").
const COMPLETED_CONDITION = ['Excellent', 'Good', 'Fair'];

/**
 * A Maintenance request tracks the repair lifecycle of a damaged asset.
 * Auto-created when an asset is returned in "Damaged" condition, then moved
 * Pending -> In Progress (Start Repair) -> Completed (Complete Repair).
 */
const maintenanceSchema = new Schema(
  {
    asset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
      index: true,
    },
    // What's wrong — seeded from the return remarks.
    issue: {
      type: String,
      trim: true,
      maxlength: [1000, 'Issue cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: { values: STATUS, message: '{VALUE} is not a valid maintenance status' },
      default: 'Pending',
      index: true,
    },

    // --- Set on "Start Repair" ---
    technicianName: {
      type: String,
      trim: true,
      maxlength: [120, 'Technician name cannot exceed 120 characters'],
      default: '',
    },
    estimatedRepairCost: {
      type: Number,
      min: [0, 'Estimated repair cost cannot be negative'],
      default: 0,
    },
    repairNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Repair notes cannot exceed 1000 characters'],
      default: '',
    },
    maintenanceStartDate: {
      type: Date,
      default: null,
    },

    // --- Set on "Complete Repair" ---
    repairCost: {
      type: Number,
      min: [0, 'Repair cost cannot be negative'],
      default: 0,
    },
    resolution: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution cannot exceed 1000 characters'],
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks cannot exceed 1000 characters'],
      default: '',
    },
    // Condition the asset was returned to service in.
    completedCondition: {
      type: String,
      enum: { values: COMPLETED_CONDITION, message: '{VALUE} is not a valid condition' },
      default: null,
    },
    maintenanceCompletedDate: {
      type: Date,
      default: null,
    },

    // --- Actors (always the logged-in manager, set server-side) ---
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Manager',
      default: null,
    },
    completedBy: {
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

maintenanceSchema.index({ issue: 'text', technicianName: 'text' });

maintenanceSchema.statics.STATUS = STATUS;
maintenanceSchema.statics.COMPLETED_CONDITION = COMPLETED_CONDITION;

module.exports = mongoose.model('Maintenance', maintenanceSchema);
