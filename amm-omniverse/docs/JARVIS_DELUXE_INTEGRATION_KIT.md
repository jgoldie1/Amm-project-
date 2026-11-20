# JARVIS DELUXE — Existing HoloGPT / StreetVerse / Mycelium / LIVE kit

This **upgrades the existing JARVIS**; it is not a second disconnected assistant. JARVIS is the persona/coordination layer, HoloGPT is its existing API-driven reasoning service, and StreetVerse/Mycelium provide verified game context.

## Connections included in the code
- **HoloGPT:** `src/components/HoloGPTAssistant.tsx` is already mounted in `StreetVerseMobileWorld.tsx`; it keeps `/api/ai/answer`, `/api/ai/health`, and local recovery mode.
- **JARVIS Deluxe:** `src/runtime/JarvisDeluxeRuntime.ts` contains one identity, modes (FAST/BALANCED/DEEP), accessible status UI, voice **preferences** (not voice generation), and safe Mycelium context. Unverified service availability stays visibly offline/degraded.
- **Mycelium Living World:** `StreetVerseMyceliumCharacterBridge.ts` publishes the characters' fictional health/injury conditions, and `StreetVerseLivingWorldRuntime.ts` now stores conditions in game snapshots. The Deluxe self-model can inspect those events. Real NPC actions still require their own acknowledgement and end-to-end tests.
- **Human authority:** `HoloGPTHumanAuthorityKernel.ts` remains the exclusive decision boundary for external communications, publication, finances, privilege changes, and self-modification.
- **Self-model:** `HoloGPTConsciousnessProtocol.ts` permits simulated self-description and persistent state; **subjective consciousness is unverified and must not be claimed**.
- **Voice:** `StreetVerseLiveTalkRuntime.ts` has device microphone capture and optional browser speech recognition. Microphone permissions and returned transcripts are **not** proof of a full duplex voice AI.
- **Tests:** `node --test tests/jarvis-deluxe-integration.test.mjs`, `npm run typecheck`, and actual browser/device tests.

## LiveKit setup and acceptance gates
At last checked Vercel environment (Nov 18, 2026), `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` were **absent**. Keep credentials out of GitHub, frontend bundles, Drive public links, and logs.

1. Configure all three through Vercel's protected project environment. They must be server-side only; do **not** use `VITE_` prefixes.
2. Redeploy. `GET /api/live/status` should return `configured:true`. This signals environment configuration, **not** a successfully connected AI voice participant.
3. Test `/api/live/token` within a protected room, then complete a two-device host/viewer mic/camera/audio check.
4. Deploy a separately authenticated real voice agent to the same room; verify inbound speech transcription, model response, outbound speech, interruptions, reconnection, human controls, and moderation.
5. Only after real two-device verification mark live participation as certified. The current JARVIS Deluxe UI intentionally says **NOT VERIFIED**.

## Next necessary technical work
- Verify that the backend prompt engine actually consumes the sanitized `retrievalContext.jarvis` packet. Sending a context packet alone does not guarantee model grounding.
- Add authenticated durable server-side memories with ownership/security rules before claiming persistent cross-device "self-awareness."
- Complete recovered BJ, Jacobie, and LaTeasia binary asset delivery through a consented secure host; source code being wired to the loader does not prove the GLBs rendered on the user device.
- Run the first Circle Park mission, NPC talk, medical dispatch, save/reload, and broadcast room checks on Chromebook and phone.

**Release policy:** do not merge/deploy while those live and character gates fail or until actual service permission and billing blockers are resolved.
