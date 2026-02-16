# Frontend (Vite + React)

This folder contains the CertifyChain UI.

## Tech

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui components (Radix)
- TanStack Router + TanStack Query
- Internet Computer integration via `@dfinity/agent`
- Internet Identity for sign-in

## Prerequisites

- Node.js (repo expects `>=16`, Node 18/20 LTS recommended)
- pnpm

Optional (only if you want to deploy/generate IC canister bindings locally):

- DFINITY SDK (`dfx`) on PATH

## Install

From the repo root:

```bash
pnpm install
```

## Run (development)

Start the backend API first (see `server/README.md`), then:

```bash
pnpm -C frontend dev
```

- Dev server runs on `http://localhost:3000`.
- Requests to `/api/*` are proxied to `http://127.0.0.1:5000` (see `vite.config.js`).

## Build

```bash
pnpm -C frontend build
```

## Typecheck / Lint

```bash
pnpm -C frontend typescript-check
pnpm -C frontend lint
```

## Configuration (env vars)

The frontend reads configuration from environment variables (during `pnpm -C frontend dev` / `build`).

- `CANISTER_ID_BACKEND` — required for Internet Computer certificate features (issue/query/verify)
- `DFX_NETWORK` — `local` or `ic` (affects default Internet Identity URL)
- `II_URL` — optional override for the Internet Identity provider URL
- `STORAGE_GATEWAY_URL` — optional (defaults to `https://blob.caffeine.ai`)

### Example (PowerShell)

```powershell
$env:CANISTER_ID_BACKEND="aaaaa-aa"
$env:DFX_NETWORK="ic"
pnpm -C frontend dev
```

## Internet Computer (IC) notes

- The UI expects a backend canister and uses a generated/declared interface under `src/declarations/backend`.
- If you are developing against a local canister, the package includes a helper script:

```bash
pnpm -C frontend setup
```

This script runs `dfx canister create`, `dfx generate`, and `dfx deploy` (requires `dfx`).

If `CANISTER_ID_BACKEND` is not set, the app can still run, but canister-backed actions will show as unavailable.
