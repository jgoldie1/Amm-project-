# TRYAMM Figma Product Workflow

Figma is the visual source of truth for TRYAMM product surfaces while GitHub remains the implementation source of truth.

## Purpose

Use Figma to standardize the experience across Holo Music, Aniyah Virtual 64-Track Studio, Isaiah AI TV, StarVerse, StreetVerse, Creator Passport, ledgers and future TRYAMM surfaces.

## Workflow

1. DESIGN — create or revise the screen in Figma using the shared TRYAMM design tokens.
2. REVIEW — verify mobile, tablet, desktop, accessibility, empty, loading, error and signed-out states.
3. SPEC — document component names, spacing, typography, states and responsive behavior.
4. IMPLEMENT — map the approved Figma components to production HTML/CSS/JS or app components.
5. VERIFY — compare the implemented UI against the approved Figma frame.
6. RELEASE — only mark the UI production-ready after runtime and deployment checks pass.

## Required Holo Music frames

- Holo Music Home / Discover
- Now Playing
- OAS Creator Pipeline
- Aniyah Virtual Studio entry
- Create Release
- Release Status / OAS stage tracker
- Artist Profile
- Album / Track Detail
- Global Creator Chart
- Set Apart Music
- Spatial / AR / VR / MR launch state
- Creator Earnings / Ledger handoff
- Isaiah AI TV handoff
- StarVerse handoff
- StreetVerse performance handoff

## Responsive variants

Every critical screen should have at least:

- Mobile narrow
- Mobile large
- Tablet
- Desktop

Important interactions must support a minimum 44px touch target.

## Accessibility states

Design components should account for:

- keyboard focus
- screen-reader labels
- high-contrast text
- captions/lyrics
- reduced-motion mode
- non-headset immersive fallback
- large tap targets
- error states that do not rely on color alone

## Component library

Start with reusable components rather than one-off screens:

- App Shell
- Top Navigation
- Bottom Navigation
- Primary / Secondary / Ghost Button
- Input / Select / Checkbox
- Music Track Card
- Album Card
- Creator Card
- OAS Stage Pill
- Release Badge
- Now Playing Player
- Creator Ledger Summary
- Immersive Experience Button
- Status / Error / Empty State
- Modal / Sheet

## Design token source

Repository source: `data/figma-design-tokens.json`

The Figma library should mirror those tokens for color, radius, spacing, typography and component dimensions. When the design system changes, Figma and GitHub should be updated together rather than drifting independently.

## Holo Music design principle

One musical master should visually read as one connected object with multiple destinations: audio, video, spatial, AR, VR, MR, StreetVerse, Isaiah AI TV and StarVerse. The interface should show the creator's current OAS stage and which release forms are ready, building or unavailable.

## Product boundary

A Figma frame is a design specification, not proof that the feature exists in production. GitHub implementation, runtime tests and deployment checks remain the evidence for production status.
