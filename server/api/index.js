// Vercel serverless entry point: exports a request handler instead of calling app.listen().
import { createApp } from '../src/app.js';
import { ensureDb } from '../src/db.js';

const app = createApp();

export default async function handler(req, res) {
  try {
    await ensureDb();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    return res.status(500).json({ error: 'Database connection failed. Check MONGODB_URI and Atlas network access.' });
  }
  return app(req, res);
}
