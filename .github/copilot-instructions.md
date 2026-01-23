<!-- Short, actionable instructions for AI coding agents working on this repo -->
# Copilot instructions — AIGO Frontend

Purpose: help an AI agent become productive quickly in this Vite + React frontend that uses Supabase for auth/data, Stripe (via a Railway backend) for payments, and external AI services (OpenRouter / Runpod) for model work.

- **Big picture**
  - Frontend only: React + Vite app in `src/` that renders pages and calls backend services for payments and AI features.
  - Auth & DB: Supabase is used for authentication and Postgres data (`src/lib/supabase.js`, `src/config/supabaseClient.js`). See provider usage in [src/App.jsx](src/App.jsx#L1-L40).
  - Payments: Stripe integration is proxied by a Railway backend; frontend calls `src/services/stripeService.js` which posts to `RAILWAY_ENDPOINTS` configured in `src/config/api`.
  - AI/model calls: `src/services/openrouter.service.js` streams responses (OpenRouter API); Runpod hooks/services exist under `src/services` and `src/hooks`.

- **How routing & state are organized**
  - App entry: [src/main.jsx](src/main.jsx#L1-L20) → `App` in [src/App.jsx](src/App.jsx#L1-L40).
  - Global state via React Contexts: `AuthProvider`, `TokenProvider`, `PaymentProvider` from `src/context/*` (examples: [src/context/AuthContext.jsx](src/context/AuthContext.jsx#L1-L40)).
  - Protected pages use `ProtectedRoutes` and `DashboardLayout` (see routes in `src/App.jsx`).

- **Dev / build / lint**
  - Start dev server: `npm run dev` (uses Vite).
  - Build: `npm run build`.
  - Preview: `npm run preview`.
  - Lint: `npm run lint`.

- **Important environment variables**
  - Vite env is used (`import.meta.env`). Common keys:
    - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — required by `src/lib/supabase.js` and `src/config/supabaseClient.js`.
    - `VITE_OPENROUTER_KEY`, `VITE_API_URL` — used by `src/services/openrouter.service.js` and other services.
  - DO NOT change code to `process.env`; keep using `import.meta.env` for Vite compat.

- **Patterns and conventions you must follow**
  - Services are thin wrappers that return plain objects/errors and log to console. Mirror this style when adding new services (see `src/services/stripeService.js`).
  - Prefer `supabase.auth.getSession()` or `supabase.auth.getUser()` to obtain the current session inside services and contexts; many service methods expect an authenticated session and will throw if missing.
  - Token storage key: local storage uses `sb-cwhthtgynavwinpbjplt-auth-token` (see `src/lib/supabase.js` / `src/services/openrouter.service.js`). Use that key when reading tokens in client-side helpers.
  - Streaming responses: `openrouter.service.js` reads a streamed body with a reader; follow that approach for any new streaming AI integrations.

- **Integration touchpoints** (quick links to copy examples)
  - Supabase client: [src/lib/supabase.js](src/lib/supabase.js#L1-L60) and [src/config/supabaseClient.js](src/config/supabaseClient.js#L1-L40).
  - Auth flow + profile creation: [src/context/AuthContext.jsx](src/context/AuthContext.jsx#L1-L140) — `ensureUserProfile` shows how profiles and wallets are upserted.
  - Stripe / Railway call examples: [src/services/stripeService.js](src/services/stripeService.js#L1-L140) — `createFounderCheckout()` and `verifyFounderPayment()`.
  - OpenRouter streaming: [src/services/openrouter.service.js](src/services/openrouter.service.js#L1-L160) — example of streaming parse + `onProgress` callback.

- **When changing backend interaction**
  - If you add or modify endpoints, update `src/config/api` (Railway endpoints) and keep client `services/*` small and focused.
  - Preserve authentication flow: always propagate Supabase session tokens (most services add `Authorization: Bearer <access_token>`).

- **Debugging tips specific to this repo**
  - Console logging is the primary observability pattern across `services/*` and `context/*` — read logs for flow traces (e.g., `ensureUserProfile` logs creation steps).
  - To validate external backend connectivity, call `StripeService.testConnection()` (see `src/services/stripeService.js`).
  - For streaming AI features, reproduce locally with `npm run dev` and watch network + console for chunks.

- **What NOT to change lightly**
  - Do not migrate env usage away from `import.meta.env` or change the Supabase storage key unless you update all readers/writers.
  - Do not move auth/session handling out of `context/AuthContext.jsx` without coordinating `TokenContext` and file references.

If something here is unclear or you want more examples (e.g., how to add a new backend API or a new AI streaming integration), tell me which area and I will expand with concrete diffs.
