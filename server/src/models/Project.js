import mongoose from 'mongoose';
import { STATUSES } from '../constants.js';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: [1, 'title cannot be empty.'] },
    status: { type: String, required: true, enum: { values: STATUSES, message: 'status must be one of: ' + STATUSES.join(', ') + '.' } },
    // Stored as a plain "YYYY-MM-DD" string (not a JS Date) so a calendar day never shifts with timezones.
    deadline: { type: String, default: null, match: [/^\d{4}-\d{2}-\d{2}$/, 'deadline must be in YYYY-MM-DD format.'] },
    budget: { type: Number, required: true, min: [0, 'budget cannot be negative.'] },
    spentAmount: { type: Number, required: true, min: [0, 'spentAmount cannot be negative.'] },
  },
  { timestamps: true }
);

// Shape sent to the client: _id → id, no __v.
export function serialize(doc) {
  const o = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(o._id),
    title: o.title,
    status: o.status,
    deadline: o.deadline ?? null,
    budget: o.budget,
    spentAmount: o.spentAmount,
    createdAt: o.createdAt,
  };
}

export const Project = mongoose.model('Project', projectSchema);
