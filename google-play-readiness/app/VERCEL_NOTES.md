# Vercel integration notes

The current reference server is Express-first and can run on Render/Docker immediately. For the production TryAMM Next.js deployment, port API handlers into `app/api/*/route.ts` or proxy `/api` to the backend service.

Do not deploy this reference shell over `tryamm.online`. Use it as a staging service or transplant the policy/middleware/routes into the existing production app.
