# Project Deadline Tracker

A small full-stack app for tracking client projects, deadlines, budgets and statuses.

## 1. How to Run Locally

Requirements: Node.js 18+ and npm, plus a MongoDB instance — either local MongoDB, Docker (`docker run -d -p 27017:27017 --name mongo mongo:7`), or a free MongoDB Atlas cluster.

```bash
# Terminal 1 — API on http://localhost:4000
cd server
npm install
cp .env.example .env       # then set MONGODB_URI if yours differs
npm start

# Terminal 2 — UI on http://localhost:5173/projects
cd client
npm install
npm run dev
```

The API seeds the five supplied projects automatically on first start (only when the collection is empty).

Environment variables:

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `MONGODB_URI` | server | `mongodb://127.0.0.1:27017/deadline_tracker` | MongoDB connection string (local or Atlas) |
| `PORT` | server | `4000` | API port |
| `VITE_API_TARGET` | client | `http://localhost:4000` | Where the dev server proxies `/api` |

Tests: `cd server && npm test` (validation rules, Mongoose schema, seed data) and `cd client && npm test` (overdue and over-budget logic).
To reset the data, drop the `deadline_tracker` database.

API: `GET /api/projects[?status=active]`, `POST /api/projects`, `PATCH /api/projects/:id/status`.
Validation failures return HTTP 400 with `{ "error": "<readable message>", "errors": [{ "field", "message" }] }`.

## 2. Stack Choice

**React (Vite) + Tailwind CSS + Node.js/Express + MongoDB (Mongoose).** React with Vite gives a fast, small SPA, Tailwind keeps styling next to the markup without a separate stylesheet to maintain, and Express with Mongoose gives a thin API where the schema enforces types, enums and minimums as a second validation layer behind the request checks; I chose MongoDB over Firebase because it needs no cloud account to run locally and the Mongoose schema keeps validation on the server.

Behaviour decisions for the edge cases:

- **No deadline:** shown as "No deadline" in muted text, never flagged overdue, and sorted last.
- **Spent equals budget:** treated as **within budget** — a project is over budget only when `spentAmount > budget`, since spending exactly the allocation has not exceeded it.
- **Overdue rule:** the deadline day is strictly before today (local date), so a project due today is not overdue. Completed projects are never flagged overdue, because there is nothing left to be late on.
- **Deadline storage:** kept as a `YYYY-MM-DD` string rather than a JavaScript `Date`, so a calendar day can never shift with the timezone.
- **Empty filter result:** shows "No <status> projects" with a button to clear the filter.
- **Server validation errors:** the message returned in the 400 response is displayed at the top of the form, which stays open with the user's input intact.

## 3. Decision 1 — Tasks Model

**Option B (separate Task collection with a `projectId` reference),** because tasks will be queried, updated and paginated on their own, and embedding them would make every task edit rewrite the whole project and let the document grow without limit.

## 4. Decision 2 — Sort Order

**Nearest deadline first (projects with no deadline last),** because a deadline tracker exists to surface what needs attention soonest, and creation order says nothing about urgency.

## 5. AI Usage

- **Tool:** Claude (Anthropic), used as a pair-programmer for this assignment.
- **What I reviewed and verified:**
  I read every file, ran both test suites, started both servers and checked in the browser that the five seed projects load, the overdue and over-budget badges appear on the right rows, the filter and empty state work, and a bad submission (negative budget, empty title) shows the server's message. 
