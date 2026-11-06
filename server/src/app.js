import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { STATUSES } from './constants.js';
import { Project, serialize } from './models/Project.js';
import { isValidStatus, validateNewProject } from './validation.js';
import { ensureDb } from './db.js';

// Nearest deadline first. Mongo sorts null *first* ascending, so a helper flag pushes
// projects without a deadline to the end; _id keeps the order stable.
const sortStage = [
  { $addFields: { noDeadline: { $cond: [{ $eq: [{ $ifNull: ['$deadline', null] }, null] }, 1, 0] } } },
  { $sort: { noDeadline: 1, deadline: 1, _id: 1 } },
];

export function createApp() {
  const app = express();
  // Ensure MongoDB is connected before processing API requests.
app.use(async (_req, _res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    next(err);
  }
});
  app.use(cors());
  app.use(express.json());

  app.get('/api/projects', async (req, res, next) => {
    try {
      const { status } = req.query;
      if (status !== undefined && !isValidStatus(status)) {
        return res.status(400).json({ error: `Invalid status filter. Must be one of: ${STATUSES.join(', ')}.` });
      }
      const rows = await Project.aggregate([...(status ? [{ $match: { status } }] : []), ...sortStage]);
      res.json(rows.map(serialize));
    } catch (e) { next(e); }
  });

  app.post('/api/projects', async (req, res, next) => {
    try {
      // Strict type checks first (Mongoose would silently coerce "10" to 10)...
      const { errors, value } = validateNewProject(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors.map((e) => e.message).join(' '), errors });
      }
      // ...then the schema validates again on save.
      const created = await Project.create(value);
      res.status(201).json(serialize(created));
    } catch (e) { next(e); }
  });

  app.patch('/api/projects/:id/status', async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Project id is not valid.' });
      const status = req.body?.status;
      if (!isValidStatus(status)) {
        return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}.` });
      }
      const updated = await Project.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ error: `Project ${id} not found.` });
      res.json(serialize(updated));
    } catch (e) { next(e); }
  });

  // Always answer with JSON, never an HTML stack trace.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body is not valid JSON.' });
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
      return res.status(400).json({ error: errors.map((e) => e.message).join(' '), errors });
    }
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  });

  return app;

}
const app = createApp();

export default app;
