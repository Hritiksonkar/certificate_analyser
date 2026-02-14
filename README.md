<!--
	Note: This README is written to match the current repository contents.
	The Internet Computer backend canister is referenced by config, but Motoko source files are not present in this repo.
-->

# CertifyChain (certificate_analyser)

CertifyChain is a certificate issuance + verification app with a React/Tailwind UI. It has:

- **Blockchain-style verification flow** via an Internet Computer canister actor interface (issue certificates, look up by ID, verify by hash).
- **A simple Express + MongoDB API** for uploading certificate files and approving them (used by the “Upload Certificate” and “Approve” screens).

This repository is a **pnpm workspace** with two packages: `frontend/` and `server/`.

## Repository layout

- `frontend/` — Vite + React + TypeScript UI (shadcn/ui components, TanStack Router, TanStack Query)
	- Uses Internet Identity for student login
	- Talks to the IC canister through `@dfinity/agent` (see `frontend/src/hooks/useActor.ts`)
	- Proxies `/api/*` requests to the Express server in development (see `frontend/vite.config.js`)
- `server/` — Express + MongoDB API
	- `POST /api/student/upload` uploads a file (multer) and stores a Mongo record
	- `GET /api/admin/pending` lists pending uploads
	- `PUT /api/admin/approve/:id` approves an upload
	- `POST /api/admin/login` is a demo/hardcoded admin login
- `dfx.json`, `icp.yaml`, `frontend/canister.yaml` — Internet Computer configuration for canisters

## Features (current UI)

- **Public verification**: `/verify?certId=...` looks up a certificate and can optionally recompute a SHA-256 hash from user-entered fields.
- **Student dashboard**: search certificates by student ID (Internet Identity sign-in).
- **Admin dashboard**: issue certificates, view issuance history, manage admins (requires canister/admin role).
- **Upload + approval flow**: student uploads a file to the Express API and admins can approve it.

## Prerequisites

- Node.js (the repo declares `node >= 16`, but a modern LTS (18/20) is recommended)
- pnpm (`pnpm >= 7`)

For the Express API:

- MongoDB (local or hosted)

For Internet Computer canister development (optional):

- DFINITY SDK (`dfx`) installed and available on PATH

## Quickstart (UI + Express API)

This is the quickest way to run what’s fully present in the repo (upload/approval + UI).

1) Install dependencies (workspace root)

```bash
pnpm install
```

2) Start MongoDB and set server environment

Create `server/.env` (not committed) with:

```env
MONGO_URI=mongodb://127.0.0.1:27017/certifychain
PORT=5000
```

3) Run the Express API

```bash
pnpm -C server dev
```

The API will start on `http://localhost:5000`.

4) Run the frontend

```bash
pnpm -C frontend dev
```

Open `http://localhost:3000`.

Notes:

- In dev, the frontend proxies `/api/*` to `http://127.0.0.1:5000`.
- The **admin email/password login is demo-only** (see “Security notes” below).

## Enabling Internet Computer (IC) certificate issuance/verification

The UI contains IC canister integration (issue, query, verify), but **this repo does not include Motoko source files** (there is no `backend/main.mo`). The frontend uses a manual IDL in `frontend/src/declarations/backend/index.ts`.

You have two options:

### Option A — Point the frontend at an already deployed canister

Provide the backend canister ID and network to the frontend process:

- `CANISTER_ID_BACKEND` — the backend canister id (string)
- `DFX_NETWORK` — `local` or `ic`

Example (PowerShell):

```powershell
$env:CANISTER_ID_BACKEND="aaaaa-aa"; $env:DFX_NETWORK="ic"; pnpm -C frontend dev
```

If `CANISTER_ID_BACKEND` is not set, the app will still run, but canister-backed pages will show “actor not available”.

### Option B — Add the Motoko canister source and deploy locally

To deploy locally, you’ll need to add the Motoko source file referenced by `dfx.json`:

- Create `backend/main.mo` and implement the service interface expected by the frontend.

Then you can do something like:

```bash
dfx start --clean --background
dfx deploy
```

After deploy, export the canister id to the frontend as `CANISTER_ID_BACKEND`.

## Useful commands

At repo root:

- `pnpm build` — runs `build` in all workspace packages (if present)
- `pnpm start` — runs `start` in all workspace packages (if present)

Frontend (`frontend/`):

- `pnpm -C frontend dev` — Vite dev server on port 3000
- `pnpm -C frontend build` — production build
- `pnpm -C frontend lint` — eslint
- `pnpm -C frontend typescript-check` — `tsc --noEmit`

Server (`server/`):

- `pnpm -C server dev` — runs with nodemon
- `pnpm -C server start` — runs `node server.js`

## Configuration

### Server

Environment variables (via `server/.env`):

- `MONGO_URI` (required)
- `PORT` (optional, default `5000`)

### Frontend

- `CANISTER_ID_BACKEND` (required for IC canister features)
- `DFX_NETWORK` (`local` or `ic`)
- `VITE_II_URL` (optional) or `II_URL` (optional) to override the Internet Identity provider

The default Internet Identity provider is:

- Local: `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8081/`
- IC: `https://identity.ic0.app/`

## Security notes

- `POST /api/admin/login` uses a **hardcoded credential check** (`admin@certify.com` / `admin123`) and returns a **mock token**. This is for demo/dev only.
- Uploaded files are served from `server/uploads` via `/uploads/*`. Treat this as untrusted content; for production you’d want validation, scanning, auth, and stricter storage.

## Troubleshooting

- **`/api/*` calls fail in the frontend**: make sure the Express server is running on port `5000` (or update `frontend/vite.config.js`).
- **“Backend canister ID not found”**: set `CANISTER_ID_BACKEND` before starting the frontend.
- **MongoDB connection error**: verify `MONGO_URI` in `server/.env` and that MongoDB is reachable.

## Spec / product intent

The higher-level product spec is in `spec.md`.

