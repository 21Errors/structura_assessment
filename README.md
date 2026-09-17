# Structura Action Tracker

A lightweight full-stack application for tracking Structura Advisory client action items. It includes a React/TypeScript board UI, an Express API, in-memory starter data, validation, status updates, filters, and automated tests.

## Setup

```bash
npm install
npm run dev
```

The API runs on `http://localhost:3000` and the React app runs on `http://localhost:5173`.

Useful commands:

```bash
npm test
npm run typecheck
npm run build
npm run start
```

`npm run start` serves the built application from `http://localhost:3000` after `npm run build` has been run.

## Features

- View all action items with client, title, owner, due date, priority, and status.
- Filter by status and priority, with a reset control.
- Create new actions with required field, title length, date format, priority, and status validation.
- Update action status to `Open`, `In Progress`, or `Completed`.
- Sort the board by earliest due date or highest priority.
- Clear all completed actions from the current in-memory session.
- See loading, empty, and error states in the interface.
- Highlight overdue non-completed actions.

## API

- `GET /api/actions` returns all action items.
- `POST /api/actions` validates and creates an action item.
- `PATCH /api/actions/:id` updates an action item's status.
- `DELETE /api/actions/completed` removes completed action items from memory.

Invalid input returns `400` with validation details. Unknown action IDs return `404`.

## Assumptions

- Data is stored in memory, so created and updated records reset when the server restarts.
- The supplied starter records are always loaded on first server start.
- No paid services, paid APIs, private credentials, or external databases are required..
- Overdue highlighting is based on the machine's current local date and excludes completed actions.

## Known Limitations

- There is no authentication or multi-user access control.
- Data is not persisted after a server restart.
- The app is optimized for local assessment review rather than production deployment.

## AI Use

Tools used: ChatGPT/Codex.

Tasks assisted:

- Interpreting the assessment requirements.
- Planning the full-stack structure.
- Drafting the Express API, React UI, validation, tests, and README.
- Checking the implementation against the assignment criteria.

Representative prompt summaries:

- "Create a plan for a full-stack Structura Advisory action-item tracker assessment."
- "Implement the plan using a Linear-inspired dark card-board UI with React, TypeScript, Express, tests, and README."

One suggestion corrected or improved:

- The plan kept storage in memory instead of adding a database. That avoided unnecessary setup and matched the assessment allowance for simple local data storage.

Verification:

- Automated API tests cover starter data, validation errors, status updates, unknown records, and clearing completed actions.
- The typecheck, build, and test commands were run locally.
- The code was reviewed against every core requirement in the brief.
