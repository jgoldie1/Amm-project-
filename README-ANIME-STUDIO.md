# TryAMM Universal Anime Studio

## Current pipeline

1. Create a project from the era, style, genre, format and quality catalog.
2. Build a production plan containing a logline, character bible, scene beats, shot list, camera directions, continuity rules and deliverables.
3. Select a configured rendering provider.
4. Queue and monitor the generation job by stage.
5. Generate local key art and a playable animatic.
6. Return the production plan and provider metadata with the output package.

## API

- `GET /api/anime-studio/catalog`
- `GET /api/anime-studio/providers`
- `POST /api/anime-studio/projects`
- `GET /api/anime-studio/projects/:id`
- `POST /api/anime-studio/projects/:id/plan`
- `GET /api/anime-studio/plans/:id`
- `POST /api/anime-studio/projects/:id/generate`
- `GET /api/anime-studio/jobs/:id`

## Optional provider environment

- `ANIME_IMAGE_API_URL`
- `ANIME_IMAGE_API_KEY`
- `ANIME_VIDEO_API_URL`
- `ANIME_VIDEO_API_KEY`

The provider registry exposes configuration status without returning secret values. Remote execution adapters are intentionally isolated from the local renderer and should be implemented with provider-specific request signing, timeouts, retries, webhook verification and output ingestion.

## Production hardening still required

- Durable PostgreSQL/Supabase repositories instead of in-memory Maps
- Redis/BullMQ or a managed durable queue
- Authenticated ownership checks
- Credit reservation and settlement
- Rate limits and abuse prevention
- Moderation and likeness consent checks
- Object storage with signed URLs
- Webhook-based remote job completion
- MP4 encoding and packaging
- Automated tests and CI
