# CLAUDE.md — Isaiah AI Starverse

This file tells Claude how to work with this codebase.

## Project
Isaiah AI Starverse — faith-centered talent discovery platform
Built with Next.js 14 App Router + TypeScript

## Architecture
- `app/lib/data.ts` — all data types and mock data (stars, judges, shows, movies, auditions)
- `app/components/Nav.tsx` — shared navigation
- `app/globals.css` — all CSS variables and utility classes
- `app/page.tsx` — homepage
- `app/api/*/route.ts` — API endpoints
- All pages use `"use client"` for interactive pages, server component for static

## Key Types (in app/lib/data.ts)
- Star — talent profiles with scoring, votes, parent enrollment
- Judge — 5 judges with AI personalities and scoring styles
- DanceProduction — Higfield Dance 2.0 productions
- TVShow — Isaiah AI TV programming
- Movie — films 30min to 2hr feature length
- Showcase — online and in-person talent events
- ProductPlacement — brand integrations
- HoloAd — holographic advertisement specs
- Audition — submitted auditions with judge scores
- ParentChildTeam — enrolled family units

## Design System (in globals.css)
- Colors: --gold (#facc15), --purple (#7c3aed), --holo (#00ffcc), --family (#f472b6)
- Cards: .card, .card-gold, .card-holo, .card-family, .card-star
- Buttons: .btn, .btn-gold, .btn-holo, .btn-outline, .btn-family
- Badges: .badge, .badge-gold, .badge-purple, .badge-holo, .badge-family, .badge-live
- Heroes: .hero, .hero-family, .hero-gold, .hero-holo

## Important Rules
- All youth features MUST include parent consent mechanism
- All content must be family-safe and faith-appropriate
- No external APIs required — coaching logic is built-in
- Judges have distinct personalities — use them in coaching responses
- Parent-child theme runs through every feature

## When adding features
1. Add types to app/lib/data.ts first
2. Add mock data to the data file
3. Create/update API route if needed
4. Build the page component
5. Add to Nav.tsx links if it's a main page
