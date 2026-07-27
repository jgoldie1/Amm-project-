# AMM Omniverse Two-Week Launch Plan

Target: launch a stable, demonstrable public MVP in 14 days.

## Launch rule

The launch includes only features that can be tested end to end. Larger products stay visible as branded modules with clear "coming next" status until their real backends are complete.

## Launch MVP

Must work before launch:

- AMM Omniverse splash screen
- Email registration and login
- Google sign-in
- Creator profile and dashboard
- Livestream room creation and joining
- Chat and gift demo flow
- HoloGPT text assistant through a protected server route
- PWA install prompt, manifest, icons, service worker, offline fallback and update notice
- Mobile and Chromebook accessibility
- Product hub with working routes for:
  - TryAMM Creator Live
  - Holoverse
  - Living Worlds
  - Jacobie Vision
  - Isaiah Anyone Can Be a Star / StarVerse
  - Aniyah Cross-Border
  - 64-Track Vocal Studio
  - Real Estate and House Flipping

For launch, the product hub may use functional preview pages for modules whose full business logic is not complete. A preview page must explain the product, collect interest or waitlist signups, and never claim an unavailable service is live.

## Phase-two systems

These should not block the public MVP:

- Full cybersecurity monitoring platform
- Real estate transaction and property-analysis engine
- Automated house-flipping workflow
- Cross-border customs, freight and payment integrations
- Browser-based 64-track recording engine
- Production-grade pitch correction and Auto-Tune licensing
- Full StarVerse virtual world runtime
- All 13 Living Worlds as persistent multiplayer worlds
- Complete holographic device runtime

## Daily plan

### Day 1 — Repository and deployment lock
- Confirm the correct GitHub repository, default branch and Vercel project.
- Merge only reviewed code.
- Remove duplicate or obsolete deployments.
- Add environment-variable inventory without committing secrets.

### Day 2 — Navigation and product hub
- Build one accessible product dashboard.
- Add working routes for every named AMM product.
- Add honest status labels: Live, Beta, Preview or Planned.

### Day 3 — Authentication
- Complete email signup, login, logout and password reset.
- Connect Google OAuth.
- Test session persistence and error handling.

### Day 4 — Splash and brand system
- Complete the AMM Omniverse splash.
- Add skip, replay, mute and reduced-motion support.
- Apply consistent branding across the product hub.

### Day 5 — HoloGPT
- Build a protected server-side AI route.
- Add rate limits and safe error handling.
- Connect the HoloGPT interface and test real responses.

### Day 6 — Creator Live
- Test creator activation, room creation, joining, chat and gifts.
- Fix every visible inactive button.
- Add clear empty, loading and error states.

### Day 7 — PWA
- Add final icons and screenshots.
- Test installation on Chromebook and mobile.
- Test offline fallback and service-worker updates.

### Day 8 — Product preview modules
- Add useful preview pages for Jacobie Vision, real estate/house flipping, Isaiah/StarVerse, Aniyah Cross-Border and the 64-Track Vocal Studio.
- Add waitlist or interest forms.
- Connect all cards and calls to action.

### Day 9 — Holoverse and Living Worlds
- Integrate the safe experimental holographic renderer as a demo.
- Display the 13-world registry.
- Clearly separate playable demo features from planned worlds.

### Day 10 — Accessibility
- Verify one-handed operation.
- Use large touch targets and visible focus states.
- Test keyboard, screen reader labels, captions and reduced motion.

### Day 11 — Security and privacy
- Confirm secrets are stored only in deployment settings.
- Add input validation, rate limits and secure headers.
- Review authentication, uploads and AI routes.
- Add privacy policy and terms links.

### Day 12 — End-to-end testing
- Test account creation through logout.
- Test creator and viewer journeys.
- Test every route, button and form.
- Record failures in a launch-blocker checklist.

### Day 13 — Deployment rehearsal
- Deploy the release candidate to staging.
- Test on Chromebook and at least one phone.
- Confirm rollback procedure and backups.
- Record a complete demonstration video.

### Day 14 — Launch
- Deploy the approved commit to production.
- Verify domain, HTTPS, analytics, error tracking and support contact.
- Publish the launch announcement only after production smoke tests pass.

## Launch acceptance checklist

The launch is approved only when all are true:

- [ ] The production URL shows the correct AMM Omniverse build.
- [ ] Every visible primary button has a working action.
- [ ] Email registration and login work.
- [ ] Google login works.
- [ ] HoloGPT returns a real protected backend response.
- [ ] A creator can create a room.
- [ ] A viewer can join and chat.
- [ ] PWA installation works on Chromebook and mobile.
- [ ] Offline fallback displays correctly.
- [ ] Product preview pages open for all named products.
- [ ] No page falsely presents a planned feature as fully operational.
- [ ] No secret or private credential exists in the repository.
- [ ] Accessibility tests pass for one-handed use.
- [ ] A rollback path is documented.

## Product ownership map

- Jacobie Vision: cybersecurity, digital protection, cyber education, real estate intelligence and house-flipping tools.
- Isaiah Anyone Can Be a Star / StarVerse: creator discovery, talent showcases, music, sports, performance and fan communities.
- Aniyah Cross-Border: international commerce, logistics, multilingual trade and future payment integrations.
- 64-Track Vocal Studio: multitrack recording, vocal teaching, harmony support, pitch guidance and future licensed pitch correction.
- Holoverse: holographic interface, spatial experiences, devices and immersive presentation layer.
- TryAMM: the shared creator, livestream, marketplace and community platform connecting the ecosystem.

## Honest launch statement

The two-week target is a public MVP launch, not completion of every full platform. The product hub, authentication, creator experience, HoloGPT, PWA and working previews can launch in two weeks if the acceptance checklist is followed without adding new launch-blocking scope.
