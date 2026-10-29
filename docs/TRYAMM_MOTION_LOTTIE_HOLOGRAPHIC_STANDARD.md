# TRYAMM Motion & Holographic UI Standard
Status: optional frontend enhancement; **not a 3D engine, live service, or guaranteed sales lift**.

## Decision
Use Lottie/dotLottie for small, informative, 2D vector animations (confirmation, progress, subtle icons). Use CSS for simple glows and low-cost holographic-style buttons. Use the existing Three.js renderer for actual 3D/WebXR scenes. Do not stack simultaneous animation renderers on the StreetVerse game canvas.

## Where it helps
- Website OS: subtle hero accent and contact-request feedback, not a blocking splash.
- Beauty, logistics, education, studio, and services starter sites: industry-specific small illustrations, icons, optional booking progress.
- FaithVerse: chapter transition, reading progress, optional glow, never obscure Scripture.
- NuMerica and Isaiah AI TV: branded opening/title cards in media when rights-cleared.
- StreetVerse: loading feedback during actual work; no fake progress percentages or deceptive peer counts.
- Holo LIVE: broadcast connection, mic state, and authentic viewer statuses only.

## Safety, accessibility and performance gates
1. Load no new animation runtime by default on the first-purchase/order screen.
2. Show core content immediately; never use a timed full-screen splash or delay the first CTA.
3. Respect prefers-reduced-motion and provide pause/skip controls for nonessential motion.
4. Prefer a still SVG or CSS fallback if the library fails or assets are blocked.
5. Lazy load optional animation after the main content, and pause off-screen and background animations.
6. Optimize animation size and test 3G/low-memory devices; avoid broad GPU claims.
7. License-check each animation asset separately; library license is not an asset-wide reuse license.
8. User interaction and site behavior must work with JavaScript animations disabled.
9. Do not use animations as social proof, simulated transactions, or fabricated live metrics.
10. Preserve rollback and test focus, one-handed navigation, button contrast, and WebGL compatibility.

## Implementation plan
- Phase A: add standalone CSS-based, reduced-motion-aware animation demo (no new dependency).
- Phase B: integrate one verified .lottie or JSON asset after choosing an owned/licensed asset.
- Phase C: A/B test lead completion, speed, bounce and customer feedback on the first two real site pilots.
- Phase D: only promote an animation to additional templates if its measured benefit exceeds load and maintenance costs.

## Revenue strategy
Keep the $499/$1,250/$2,500 website packages intact. Include lightweight motion styling in higher-value designs; price custom motion design as a clearly scoped optional service only after estimating labor and licensed asset costs. An animation library alone does not justify higher prices.

Official references:
https://docs.lottiefiles.com/en/runtimes/distributions/web-component
https://github.com/LottieFiles/dotlottie-web
