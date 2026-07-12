const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Sequence counter used to generate human-readable, gapless-ish IDs
 * (e.g. asset tags AF-0001, AF-0002). Kept in its own collection so the
 * increment is atomic and race-safe under concurrent inserts — far safer
 * than counting documents, which double-issues under load.
 */
const counterSchema = new Schema({
  _id: { type: String, required: true }, // sequence name, e.g. "assetTag"
  seq: { type: Number, default: 0 },
});

/**
 * Atomically increment and return the next value for a named sequence.
 * @param {string} name
 * @param {mongoose.ClientSession} [session]
 * @returns {Promise<number>}
 */
counterSchema.statics.next = async function next(name, session) {
  const doc = await this.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true, session }
  );
  return doc.seq;
};

module.exports = mongoose.model('Counter', counterSchema);
