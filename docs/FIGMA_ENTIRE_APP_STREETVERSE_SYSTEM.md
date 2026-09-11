# TRYAMM + StreetVerse Figma System

Figma is the visual product system for the entire TRYAMM ecosystem, not only Holo Music. GitHub remains the implementation source of truth and runtime/deployment checks remain the production truth.

## Shared design foundation

All surfaces inherit the shared tokens in `data/figma-design-tokens.json` for color, typography, spacing, radii, states, focus treatment and mobile tap targets.

The design library should include shared App Shell, navigation, buttons, forms, cards, sheets, modals, notifications, search, profile/avatar, wallet/ledger, accessibility controls, status badges, media player, creator controls and error/loading/empty states.

## Product families and required Figma maps

### TRYAMM Core App

Sign in, onboarding, Passport, home/feed, search/discovery, notifications, profile, settings, accessibility, creator dashboard, wallet/ledger and install/PWA experience.

### LIVE / PK / Reels

Vertical feed, camera/composer, LIVE room, PK battle, multi-guest panel, gifts/coins, chat, moderation, replay, creator analytics and publish/share flows.

### Holo Music + Aniyah Studio

Holo Music discovery, Now Playing, artist/album/track, Set Apart Music, Aniyah Virtual 64-Track Studio, OAS stage tracker, immersive release launcher, Digital Master Vault status and creator earnings handoff.

### StreetVerse Game OS

World entry, Chicago loading/landing, HUD, player Passport, movement/mobile controls, mission tracker, map/minimap, interaction prompt, inventory/equipment, vehicle HUD, property/business interaction, job/earnings screen, creator/reel capture, multiplayer/social, event/PK overlay, accessibility controls and pause/settings.

StreetVerse UI must distinguish the 3D world from the interface overlay: Figma defines HUD, menus, interaction flows, map, states and screen composition while the game engine implements geometry, lighting, animation, physics, NPCs, vehicles and world simulation.

### StreetVerse Mission Loop

ENTER WORLD → FIND MISSION → ACCEPT → PLAY → COMPLETE → XP/REWARD → LEDGER → CAPTURE REEL → SHARE → CREATOR/COMMERCE FOLLOW-UP.

Each mission design must include unavailable, available, active, objective-updated, failed, completed and reward-verified states.

### Business / Marketplace / Delivery

Business Passport, directory, business profile, products/services, cart, checkout, server verification, order status, delivery/rideshare state, QR onboarding, Scout/Agent flow, business earnings and business-server package.

### Isaiah AI TV / CTV / FAST

TV home, channels, program guide, show page, player, live state, creator submission, Anyone Can Be a Star, advertising/sponsor placements and handoff from Aniyah/Holo Music.

### StarVerse

Artist world, fan home, events, performances, challenges, fan achievements, commerce/merchandise and Creator Passport connection.

### Middleverse Jobs

Job discovery, AI call-center workspace, application, qualification/training, work queue, performance, earnings and accessibility variants.

### Holo FON / Communications

Dialer, contacts, call routing, messaging, live translation, accessibility communication, business routing and call status.

### Founder / Command Nexus

System status, LIVE/READY/BUILDING/LOCKED/COMING SOON labels, deployment health, product modules, creator/business economics, moderation/security alerts and ledger summaries.

## StreetVerse HUD design zones

Top-left: player/mission context.
Top-center: event or mission objective when needed.
Top-right: minimap/world status.
Bottom-left: movement/accessibility controls on touch devices.
Bottom-center: context actions / interaction prompt.
Bottom-right: inventory, phone, camera/reel, vehicle/action controls.

HUD must remain usable one-handed where possible and must support scalable controls, reduced motion, high contrast, captions, remappable actions and non-audio cues.

## Figma page structure

00 Foundations
01 Components
02 TRYAMM Core
03 LIVE-PK-Reels
04 Holo Music
05 Aniyah Studio
06 StreetVerse Core
07 StreetVerse Missions
08 StreetVerse Business
09 Marketplace-Delivery
10 Isaiah AI TV
11 StarVerse
12 Middleverse Jobs
13 Holo FON
14 Creator-Ledgers
15 Founder Command Nexus
16 Accessibility
17 Responsive States
18 Prototypes
19 Developer Handoff

## Design-to-code gate

FIGMA DRAFT → UX REVIEW → ACCESSIBILITY REVIEW → FOUNDER APPROVAL → COMPONENT SPEC → GITHUB IMPLEMENTATION → RUNTIME TEST → VISUAL QA → DEPLOYMENT CHECK → PRODUCTION.

A Figma frame is never labeled LIVE merely because it looks complete.

## Priority implementation order

1. Shared app shell/navigation/accessibility components.
2. StreetVerse mobile HUD and world-entry flow.
3. One complete StreetVerse mission loop.
4. Creator Passport + ledger/reward confirmation.
5. Reel capture/publish handoff.
6. Holo Music + Aniyah/OAS creator path.
7. Business Passport + marketplace/checkout.
8. Isaiah AI TV + StarVerse distribution handoffs.
9. Remaining ecosystem surfaces.
