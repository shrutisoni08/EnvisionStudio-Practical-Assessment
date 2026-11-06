import mongoose from 'mongoose';
import { Project } from './models/Project.js';
import { seedProjects } from './seed-data.js';

export const DEFAULT_URI = 'mongodb://127.0.0.1:27017/deadline_tracker';

export async function connectDb(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
}

/** Inserts the five supplied projects, only when the collection is empty. */
export async function seedIfEmpty() {
  if ((await Project.estimatedDocumentCount()) === 0) {
    await Project.insertMany(seedProjects);
    console.log(`Seeded ${seedProjects.length} projects.`);
  }
}

// Serverless platforms reuse a warm function instance, so connect once and share the promise.
let ready = null;
export function ensureDb(uri = process.env.MONGODB_URI || DEFAULT_URI) {
  if (!ready) {
    ready = connectDb(uri).then(seedIfEmpty).catch((err) => {
      ready = null; // allow a retry on the next request
      throw err;
    });
  }
  return ready;
}
