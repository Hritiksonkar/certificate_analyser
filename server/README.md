# Server (Express + MongoDB)

This folder contains the REST API used by the upload/approval flow.

## Tech

- Express
- MongoDB via Mongoose
- Multer for file uploads

## Prerequisites

- Node.js (repo expects `>=16`, Node 18/20 LTS recommended)
- pnpm
- MongoDB (local or hosted)

## Install

From the repo root:

```bash
pnpm install
```

## Configure environment

Create `server/.env` (not committed):

```env
MONGO_URI=mongodb://127.0.0.1:27017/certifychain
PORT=5000
```

- `MONGO_URI` is required.
- `PORT` defaults to `5000` if omitted.

## Run

Development (nodemon):

```bash
pnpm -C server dev
```

Production:

```bash
pnpm -C server start
```

Server starts on `http://localhost:5000` (or your `PORT`).

## Endpoints

- `GET /api/health` — health check
- `POST /api/student/upload` — upload a certificate file
- `GET /api/admin/pending` — list pending uploads
- `PUT /api/admin/approve/:id` — approve an upload
- `POST /api/admin/login` — demo admin login

Uploaded files are served from:

- `GET /uploads/<filename>`

## Security notes

- `POST /api/admin/login` uses a hardcoded/demo credential check and returns a mock token. Treat this as dev-only.
- Uploaded files are served directly from disk; for production you typically want auth, validation/scanning, and safer storage.
