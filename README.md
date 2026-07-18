# MediCore HMS

React + Vite + Tailwind frontend with a JavaScript Node.js + Express + MongoDB backend scaffold.

The frontend currently uses localStorage-backed dummy data so the HMS pages can be developed without waiting on backend resource APIs. The backend is set up with MongoDB connectivity, security middleware, logging, and a health endpoint.

## Requirements

- Node.js 20+
- pnpm 9+
- MongoDB running locally or a MongoDB connection string

## Install

```bash
pnpm install
```

## Environment

Create local env files from the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend defaults:

- `PORT=8080`
- `MONGODB_URI=mongodb://127.0.0.1:27017/medicore_hms`
- `CORS_ORIGIN=http://localhost:5173`

Frontend defaults:

- `PORT=5173`
- `BASE_PATH=/`

## Run

Run frontend and backend together:

```bash
pnpm dev
```

Run only the frontend:

```bash
pnpm client:dev
```

Run only the backend:

```bash
pnpm api:dev
```

## Quality

```bash
pnpm lint
pnpm format
pnpm client:build
```

## Current Architecture

- Frontend: `frontend`
- Backend: `backend`
- Frontend data source for now: `localStorage` key `medicore_hms_local_store`
- Backend API currently includes: `GET /api/healthz`

When the frontend pages are stable, the next step is to add MongoDB models and API routes for patients, inventory, suppliers, purchase orders, billing, and clinical workflows.
