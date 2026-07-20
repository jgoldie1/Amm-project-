# TryAMM Google Play Age & Safety Layer

Portable integration package for the TryAMM frontend/backend.

## Purpose

This package adds a server-enforced age-band model for CHILD, TEEN, and ADULT users, route/feature authorization, moderation primitives, reviewer-mode guidance, and database schema guidance without overwriting the existing production app.

## Integration order

1. Apply `schema.sql` to the production Supabase/Postgres database after review.
2. Copy `age-policy.js` into the production backend shared policy layer.
3. Mount `safety-api.js` behind the production authentication middleware.
4. Use `age-gate.html` as the reference UI/UX contract for onboarding and feature gating, or port its logic into React/Next.js.
5. Configure environment variables from `.env.example`; never commit secrets.
6. Test child, teen, adult, moderator, and reviewer accounts before Play Console submission.

## Core rules

- Date of birth is never trusted as a frontend-only field.
- The backend derives and stores an age band.
- Every protected API request is checked server-side.
- Child accounts cannot access unrestricted adult livestreams, adult DMs, mature content, unrestricted virtual gifting, or adult marketplace content.
- Teen accounts receive restricted discovery, communication, monetization, and mature-content controls.
- Adult accounts may use eligible full-platform features subject to moderation and platform policy.
- Report/block/mute records are persistent and auditable.
- Account deletion requests are supported through an API workflow and must be wired to the production data-deletion process.

## Important

This package is an implementation foundation, not a claim of automatic Google Play approval. The production app, SDK inventory, Data Safety form, content rating, Families declarations, billing implementation, privacy disclosures, Android AAB, and reviewer credentials must all match the final shipped behavior.
