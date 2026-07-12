const mongoose = require('mongoose');

const { Schema } = mongoose;

// A fixed _id makes this a true singleton — there is exactly one system state.
const SINGLETON_ID = 'SYSTEM';

/**
 * SystemState enforces the "single active manager session" rule. The whole
 * application shares ONE row: while it's occupied, no other manager may log in.
 */
const systemStateSchema = new Schema(
  {
    _id: { type: String, default: SINGLETON_ID },
    currentManager: {
      type: Schema.Types.ObjectId,
      ref: 'Manager',
      default: null,
    },
    // Random per-login id embedded in the JWT; lets logout invalidate the token
    // and lets a fresh login supersede a stale one.
    sessionId: {
      type: String,
      default: null,
    },
    loginTime: {
      type: Date,
      default: null,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, _id: false }
);

/** Fetch (creating if needed) the one and only system-state document. */
systemStateSchema.statics.getSingleton = async function getSingleton() {
  let state = await this.findById(SINGLETON_ID);
  if (!state) state = await this.create({ _id: SINGLETON_ID });
  return state;
};

systemStateSchema.statics.SINGLETON_ID = SINGLETON_ID;

module.exports = mongoose.model('SystemState', systemStateSchema);
