# TryAMM approved open-source stack

TryAMM should consume upstream projects as versioned dependencies, not copy entire repositories into the application. This preserves update paths, keeps license notices traceable, and prevents unrelated example code from entering production.

## Added official upstreams

| Capability | Package | Official source repository | Intended use |
|---|---|---|---|
| Authentication, database, storage and realtime | `@supabase/supabase-js` | `supabase/supabase-js` | Replace JSON persistence with authenticated PostgreSQL records, storage and realtime updates. |
| Browser WebRTC | `livekit-client` | `livekit/client-sdk-js` | Join LiveKit rooms, publish camera/microphone, subscribe to participants and receive data messages. |
| Holographic animation | `lottie-web` | `airbnb/lottie-web` | Approved stream overlays, gifts, loading states, Holo menus and reduced-motion-safe animation. |
| 3D and WebXR rendering | `three` | `mrdoob/three.js` | Yogihoo AR boards, Meshy GLB models, Holo products, VR/MR scenes and spatial UI. |
| Shopify integration | `@shopify/shopify-api` | `Shopify/shopify-api-js` | OAuth, Admin API calls, webhook verification, products, inventory and order synchronization. |
| Runtime validation | `zod` | `colinhacks/zod` | Validate every public API payload and environment configuration. |
| Structured logs | `pino`, `pino-http` | `pinojs/pino`, `pinojs/pino-http` | Request IDs, redacted structured logging and production observability. |
| Browser bundling | `esbuild` | `evanw/esbuild` | Bundle browser dependencies without relying on public CDNs. |

Existing approved upstreams include Anthropic SDK, Stripe, LiveKit Server SDK, Express, Socket.IO, Helmet, CORS and express-rate-limit.

## Repository intake rules

Before adding another upstream repository:

1. Confirm it is the official project or an established maintained fork.
2. Verify the license permits commercial use.
3. Add it through npm or a documented adapter rather than copying the repository.
4. Pin the version and let Dependabot propose upgrades.
5. Record what user data it receives and what permissions it needs.
6. Add tests for the TryAMM adapter.
7. Never expose provider keys in browser code.
8. Do not add abandoned, unlicensed or example-only repositories.

## Beta implementation order

### 1. Persistence and identity

- Create Supabase migrations.
- Add profiles, organizations, roles and permissions.
- Migrate JSON files into PostgreSQL.
- Add row-level security and audit logs.
- Use signed storage uploads.

### 2. Real livestream rooms

- Bundle LiveKit Client.
- Add camera, microphone, screen share, chat and moderation controls.
- Add recording, replay, captions and Lottie overlay synchronization.

### 3. 3D, AR, VR and MR

- Load Meshy GLB assets through Three.js.
- Implement WebXR hit testing and anchors for Yogihoo.
- Add flat-screen fallback, controller mappings and performance budgets.

### 4. Shopify commerce

- Add OAuth installation.
- Verify Shopify webhooks.
- Sync variants, inventory, orders, fulfillment, refunds and taxes.
- Map imported products to livestream, Reel, drama and Holo Ad placements.

### 5. Production safety

- Validate API payloads with Zod.
- Add Pino request logging with secret and personal-data redaction.
- Add rate limits by route and authenticated account.
- Add error monitoring, backups and recovery tests.

## Completion estimate

The current branch is an Advanced Alpha demonstration, not a production Beta.

- Advanced Alpha feature proof: approximately **75% complete**.
- Production Beta foundation: approximately **35% complete**.
- Public production launch across streaming, commerce, games, call center and mobility: approximately **20% complete**.

These percentages measure tested implementation, not the number of ideas documented. The largest remaining work is persistence, authentication, real provider activation, media infrastructure, multiplayer, legal operations, automated testing and production deployment.
