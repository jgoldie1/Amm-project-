# GameVerse Production-Playable Certification

A title may be labeled `production-playable` only when every required gate below is evidenced and passed. A working browser demo is `prototype-playable`, not production-certified.

## 1. Identity and progression
- TryAMM Passport authentication is required for persistent progression.
- Server-side profile, XP, level, achievements, inventory and settings persistence.
- Guest mode may exist but must not impersonate authenticated ownership.
- Recovery and migration path for corrupted or upgraded save data.

## 2. Runtime and gameplay
- Deterministic core rules documented.
- No blocking gameplay defects in release candidate.
- Pause/resume and interruption handling.
- Controller, keyboard/mouse and touch paths where supported.
- Original or properly licensed art, audio and fonts.

## 3. Multiplayer and matchmaking
- Server-authoritative validation for competitive state where practical.
- Matchmaking queues with timeout/cancel/retry behavior.
- Disconnect/reconnect handling.
- Abuse controls and rate limits.
- Latency, packet loss and regional tests.
- Party/private-match path if enabled.

## 4. Anti-cheat and integrity
- Server validates progression and rewards.
- Impossible score/state detection.
- Velocity/rate anomaly detection.
- Replay/event evidence for disputed competitive outcomes where feasible.
- Ban/suspension/appeal workflow tied to Trust & Safety.
- Do not trust client-submitted currency, inventory or reward balances.

## 5. AI and GameOps
- Runtime telemetry reports crashes, severe errors and suspicious states.
- AI may diagnose and propose bounded fixes.
- High-risk production changes require human approval.
- Every incident has audit history, validation result and rollback path.
- AI NPC/coach/mission generation must have content, privacy and cost guardrails.
- OpenAI/HoloGPT keys remain server-side only.

## 6. Accessibility QA
- Keyboard-only operation for menus where applicable.
- Screen-reader labels for non-canvas controls.
- Reduced-motion option.
- High-contrast/readability option.
- Captions/subtitles for essential spoken content.
- Remappable controls target for full titles.
- One-hand interaction review where applicable.
- Color is never the only critical signal.

## 7. Device/browser QA
Test supported targets explicitly, including release versions of:
- Chrome desktop
- Edge desktop
- Safari macOS
- Firefox desktop
- Safari iOS
- Chrome Android
- representative low/mid/high performance devices

Record FPS, memory, load time, input latency, crashes and major rendering differences.

## 8. Performance targets
Targets vary by title but must be declared before certification.
- Stable frame-rate target by device class.
- Bounded memory growth over long sessions.
- Asset-size budgets.
- Network bandwidth budget.
- Load/startup target.
- Graceful quality degradation on weaker devices.

## 9. Security and privacy
- Auth/RBAC reviewed.
- No secrets in client bundles.
- Rate limiting on sensitive endpoints.
- Input validation and output encoding.
- Child/teen protections where applicable.
- Privacy disclosures match collected telemetry.
- Dependency scanning and security review completed.

## 10. Persistence and recovery
Production should migrate runtime JSON persistence to Supabase/Postgres or another durable production datastore.
- Backups configured.
- Restore tested.
- Idempotent writes for rewards/transactions.
- Migration/versioning strategy.

## 11. Deployment validation
- Staging deployment tested end to end.
- Environment variables verified.
- Health checks pass.
- Error monitoring/alerts configured.
- Rollback procedure tested.
- Production smoke test completed after deploy.

## 12. Certification evidence
For each title store:
- build/version
- commit SHA
- test report
- supported devices
- known limitations
- accessibility report
- security review
- performance report
- multiplayer/load report if applicable
- approval owner and date

## Current status
- GameVerse/Living Game World registry: foundation-established.
- Browser vertical slice: prototype-playable.
- Profile/progression runtime: server-side foundation added; production auth and database migration still required.
- Matchmaking/multiplayer: prototype transport foundation added; authoritative production networking/load testing still required.
- Anti-cheat: basic server validation foundation added; full competitive integrity system still required.
- Production-certified titles: 0 until all applicable gates above pass.
