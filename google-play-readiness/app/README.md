# TryAMM Google Play Safety Layer — Runnable Reference

This folder is a self-contained Node/Express reference implementation that Victor can run immediately and then merge into the real TryAMM production stack.

## Run

```bash
cd google-play-readiness/app
npm install
cp .env.example .env
npm test
npm start
```

Open `http://localhost:8787`.

## Wired capabilities

- date-of-birth onboarding with server-derived CHILD / TEEN / ADULT age bands
- JWT session claims carrying immutable server-issued age band for authorization
- feature-level permission middleware
- adult/minor interaction guard
- report, block, mute endpoints
- moderator action endpoint
- livestream creation guard
- marketplace and virtual gift guards
- account-deletion request endpoint
- basic age-aware frontend shell
- health endpoint
- Helmet/CORS/JSON body limits
- automated policy tests

## Production adapters still required

The reference app intentionally uses an in-memory store so it can run without secrets. For production, replace `lib/store.js` with the existing Supabase data layer while keeping the same method contract. Wire LiveKit room creation, Stripe/Google Play billing classification, production moderation queues, and the existing TryAMM UI components into the guarded routes.

Do not put production secrets in this repository. Use deployment environment variables.
