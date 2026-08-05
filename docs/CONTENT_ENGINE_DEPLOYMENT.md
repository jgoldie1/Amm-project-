# TRYAMM Content Engine Deployment

## What this branch adds

- Authenticated development-project intake API
- Automatic social, newsletter, LinkedIn, and Discord content drafts
- Founder dashboard at `/founder-dashboard.html`
- Supabase REST service and version-controlled schema
- Render blueprint and Replit development configuration
- Local JSON fallback when Supabase is not configured

## Required setup

1. Create or select a Supabase project.
2. Run `supabase/migrations/202608050001_content_engine.sql` in the Supabase SQL editor.
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only in the server environment.
4. Never put the service-role key in browser JavaScript, screenshots, commits, or public documentation.
5. Set `APP_URL`, `ADMIN_EMAIL`, and Stripe variables in Render.
6. Deploy this branch to a staging Render service first.
7. Register or sign in through the existing TRYAMM UI and copy the returned session token into `/founder-dashboard.html`.

## API routes

- `GET /api/content/projects`
- `POST /api/content/projects`
- `GET /api/content/projects/:projectId/outputs`
- `GET /api/founder/dashboard`

All routes require the existing TRYAMM bearer token.

## Contractor delivery rule

Every development item must include a title, plain-language summary, problem solved, truthful product stage, known limitation, next milestone, contributor name, screenshot, and 15–30 second screen recording. The API converts the text portion into reusable draft content. Asset upload to Supabase Storage is the next implementation unit.

## Production notes

- GitHub remains the source of truth.
- Render runs the Node/Express/Socket.IO application.
- Replit is for development and demonstrations, not the only production source.
- The current preload module is transitional wiring that avoids destabilizing the large existing `server.js`. A later refactor should register each route module directly from a small application bootstrap.
- Do not merge until syntax checks, smoke tests, Supabase migration testing, authentication tests, and a staging deployment pass.
