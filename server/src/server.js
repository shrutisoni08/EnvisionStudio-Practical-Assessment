// Local development entry point (npm start). On Vercel, api/index.js is used instead.
import 'dotenv/config';
import { DEFAULT_URI, ensureDb } from './db.js';
import { createApp } from './app.js';

const port = process.env.PORT || 4000;

try {
  await ensureDb();
  createApp().listen(port, () => console.log(`API listening on http://localhost:${port}`));
} catch (e) {
  console.error(`Could not connect to MongoDB at ${process.env.MONGODB_URI ? '(MONGODB_URI)' : DEFAULT_URI}\n${e.message}`);
  process.exit(1);
}
