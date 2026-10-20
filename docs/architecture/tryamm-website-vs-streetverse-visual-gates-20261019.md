# TRYAMM storefront vs. StreetVerse and visual quality plan (October 2026)

## Two distinct products sharing verified services

- **TRYAMM business application**: the public root `/` and `/app` lead to `business-app.html`, independent of any 3D/game initialization. Business onboarding, industry templates, demos, listings, creator commerce and owner tools belong here. No claim of live Stripe checkout until an end-to-end paid order succeeds.
- **StreetVerse game**: `/streetverse` launches the separately gated 3D game, characters, neighborhoods, territory systems and missions. Never make game initialization a dependency of business site access.
- **Shared, server-verified services**: eligible accounts, approved business/passport links, creator profiles, media and payment ledgers may be shared, but client screens do not decide payable balances or grant roles.
- **Private business clients**: the 54 generic sellable website starter templates are not publicly personalized with a friend's or heir's identity, photo, claims or contact information until authorized. Gifted sites stay free; optional AI services are separately agreed.

## Ten catalog sectors

Beauty & Personal Care; Care & Mobility; Creator & Entertainment; Faith & Community; Food & Retail; Professional & Finance; Property & Trades; Security & Legal; Technology & Workforce; Travel & Logistics.

## Immediate delivery gates (in order)

1. **Contain Supabase 402/egress**: capture the exact restriction code in the Supabase billing dashboard, check the Free plan usage cycle, stop repeated GETs for missing/blocked animated GLBs; prevent hot loops, use error backoff/circuit breaker, deploy fixed immutable public GLB assets behind cache or static CDN. Do not repeatedly retry an HTTP 402. Avoid a paid tier or spend-cap change without the owner's budget approval.
2. **No-regression preserved build**: reconcile the known richer production BJ/StreetVerse baseline and latest LIVE/PK/Reel fixes on a single reviewed candidate. Build, run automated regression checks and verify on the physical iPhone before changing public aliases. Maintain an explicit rollback target.
3. **One compelling Chicago vertical slice**: Circle Park and West Side with recognizable block outlines, Taylor Street guarded entrance, street signs, textured architecture, storefronts, trees, varied vehicles, ambient life, day/night weather and close-up BJ model. Verify lawful use/permissions for reference imagery and logos.
4. **Character quality**: authored and correctly rigged GLBs with facial likeness approval, walk/run/idle cycles, correct scale and foot placement; refuse to report production quality on capsule/sphere fallbacks alone. Confirm camera screenshot or short physical-device video.
5. **Territory design**: make Turf Wars' accessible 2D real-world capture-map idea a *distinct* optional control layer over StreetVerse's playable 3D. District colors, team ownership, clear capture objectives, influence, defenses, co-op/business missions, visible territory state and server-authoritative competition. No forced combat/real-world stalking, no location precision collection without explicit consent.
6. **Mobile performance**: adaptive render scale, compressed textures and models (e.g. KTX2/mesh compression when supported), instanced streetscape assets, object pooling, distance LOD and lazy-loading zones. Target stable interaction and test on low-end Safari; reduce draw calls and memory before adding citywide content. Support one-handed controls and large touch targets.
7. **Proof to launch**: record first launch, movement/joystick, one mission, territory overlay, save/rejoin, media playback and all commerce blockers. Confirm app works independently at `/app`; publish screenshots/video from the tested device, not render claims from the source tree.

## Review limits

The current 3D files include many plain BoxGeometry buildings, faceless primitive residents and box-based vehicles. This supports a geometric city prototype, **not** modern open-world visual fidelity. This plan does not assert that Turf Wars has been surpassed visually yet. Any claim of a quality leap requires a real device visual comparison and accepted gameplay benchmark.
