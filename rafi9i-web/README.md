# Rafi9i — Student web app

Front-end product for **Rafi9i**: academic orientation, soft-skills development and career tracking for Moroccan high-school students. The UI is in French.

A student signs up, takes a short (12-question) basic assessment to get a free orientation preview, activates a 7-day Premium trial, then takes the deeper (10-question) advanced assessment which unlocks the full result: field matches, soft-skill priorities, learning resources and a personalized roadmap — all followed up from a personal dashboard.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + TypeScript
- **Tailwind CSS 4** + shadcn/ui + Framer Motion (custom "terre cuite de Marrakech" design language — see `src/app/globals.css`)
- **React Hook Form + Zod** for form validation
- **Zustand** for client state (assessment drafts, saved items)
- **Recharts** for progress trends

## Getting started

```bash
bun install        # or: npm install
cp .env.example .env
bun run dev        # http://localhost:3000
```

The app boots in **demo mode** when no API URL is configured or when the backend is unreachable — every screen works with realistic seeded mock data (demo account: `yassine@demo.ma` / `demo1234`), and a "Mode démo" badge is shown so nobody mistakes it for live data.

## Environment

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | no | Base URL of the Laravel API, e.g. `https://api.rafi9i.co.uk/api/v1`. Leave empty for demo mode. |

## Architecture

```
src/
├── app/                    # Routes (App Router)
│   ├── auth/               #   login / register
│   ├── onboarding/         #   profile setup (city, bac stream, language)
│   ├── assessment/         #   basic (free) & advanced (trial-gated) flows
│   ├── results/            #   free preview & premium result (4 tabs, gated)
│   ├── trial/              #   7-day Premium preview states
│   └── dashboard/          #   home + orientation, soft-skills, roadmap,
│                           #   progress, saved, settings
├── components/             # Feature components + shadcn/ui kit
└── lib/
    ├── api.ts              # ⚠️ SINGLE integration point with the backend
    ├── types.ts            # Shared contract types (mirrors the Laravel API)
    ├── mocks.ts            # Demo backend (same interface as the live API)
    ├── auth-client.ts      # Session hooks: useSession, useRequireAuth, …
    ├── access.ts           # Access-level rules (free / trial / premium)
    └── assessment-store.ts # Zustand store (drafts, saved items)
```

**Pages never call `fetch` directly.** Everything goes through `src/lib/api.ts`, which handles the Sanctum bearer token, the Laravel response envelope and automatic demo fallback on network failure.

## Backend contract (for the API team)

The frontend expects the final contract implemented in `src/lib/api.ts`:

- **Auth**: Laravel Sanctum personal access tokens — `POST /auth/register`, `POST /auth/login`, bearer token on every authenticated call, `Accept: application/json`. No refresh endpoint (a 401 clears the session and redirects to login).
- **Response envelope**: success → `{ "success": true, "message": "...", "data": {} }`, validation failure → `{ "success": false, "message": "...", "errors": { "field": ["..."] } }`.
- **Assessments**: a session must be opened before submitting — `POST /assessments/basic/start` / `POST /assessments/advanced/start` return a `sessionId` that must be echoed back in the submit payload (`{ sessionId, answers }`).
- **Roles**: the student app targets role `user`; access control is enforced server-side.

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Dev server on `:3000` |
| `bun run build` / `bun run start` | Production build & serve (standalone output) |
| `bun run lint` | ESLint |

End-to-end smoke drives (walk the whole journey in a real browser) live in `scripts/e2e-basic.mjs` and `scripts/e2e-advanced.mjs`.

## Team notes

- `src/app/page.tsx` (landing) and the final `FoxGuide` mascot implementation are owned by **Developer 1** — a temporary placeholder keeps the journey coherent until then.
- The Laravel + MySQL backend is a separate repository owned by **Developer 3**; the exact expectations are documented in `src/lib/api.ts`.
