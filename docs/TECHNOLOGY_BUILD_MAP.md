# AMM Omniverse Technology Build Map

This document separates launch-critical technology from later platform expansion.

## Two-week launch-critical technology

1. Identity and access
   - Email registration, login, logout, password reset
   - Google OAuth
   - Session security, rate limits, audit logging

2. Product hub and lead capture
   - Routes/cards for all family platforms
   - Early-access and partner intake forms
   - Database storage and admin export

3. TryAMM creator live
   - Creator activation
   - Start/join room
   - Camera/microphone permissions
   - Realtime chat and viewer count
   - Gifts demo with test payments only

4. HoloGPT
   - Protected backend route
   - Server-side provider key
   - Input/output moderation
   - Usage limits and error fallback

5. PWA and accessibility
   - Manifest, icons, service worker, offline fallback, update notice
   - Large controls, keyboard navigation, reduced motion, one-hand use
   - Mobile and Chromebook testing

6. Deployment and operations
   - Correct Vercel project and branch
   - Environment variables outside GitHub
   - Health checks, logging, rollback notes
   - Staging and production smoke tests

## Product-specific MVP previews

### Jacobie Vision Cybersecurity
- Security assessment intake
- Learning/certification roadmap
- Incident-report form
- No claim of active SOC monitoring at launch

### AMM Real Estate and House Flipping
- Property intake form
- Rehab budget calculator
- Deal-stage tracker preview
- No closings, escrow, or lending at launch

### Isaiah — Anyone Can Be a Star
- Creator profile
- Audition/upload interest form
- Talent categories and discovery preview

### StarVerse
- Creator/fan world profile preview
- Event and membership interest list
- No persistent multiplayer universe at launch

### Aniyah Cross-Border
- Buyer/seller/shipping intake
- Country, currency, language, and shipment preferences
- No customs brokerage or money transmission at launch

### 64-Track Vocal Studio
- Track-session planner
- Vocal coach workflow
- Pitch-correction demo labeling
- No licensed Auto-Tune branding or 64-channel real-time DAW claim until implemented

### Holoverse and 13 Living Worlds
- World registry, holographic visual demo, mission preview
- No claim of full persistent worlds or hardware holography at launch

## Phase-two technology

- Supabase/Postgres production data model and row-level security
- Stripe Connect marketplace and creator payouts
- LiveKit/Agora/WebRTC SFU for scalable live video
- Object storage and media transcoding
- Search and recommendation system
- Moderation queue and trust/safety console
- Cross-border payments, tax, customs, and compliance integrations
- Real estate property-data providers and document workflows
- Web Audio/AudioWorklet recording engine, waveform editing, effects, collaboration
- Three.js/WebGPU Holoverse runtime, saved avatars, inventory, missions, multiplayer
- Cybersecurity lab sandboxes and authorized monitoring integrations

## AI development rule

Gemini, Claude, Codex, or other AI tools may generate code only on a feature branch. They must not overwrite `main`, commit secrets, remove working routes, claim tests passed without running them, or merge without a human review and deployed acceptance test.
