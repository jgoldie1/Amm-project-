# SKILL.md — Isaiah AI Starverse Development Guide

## What This Platform Does
Talent discovery for faith-centered families. Youth performers (with parent consent) 
and adult creators compete through online showcases, get AI coaching, and build 
their Starverse profile.

## Core Skills Needed to Build This

### Next.js 14 App Router
- Server components for static pages (homepage, admin, movies)
- Client components ("use client") for interactive pages (starverse, showcase, profile)
- API routes in app/api/*/route.ts following Next.js 14 conventions

### TypeScript
- All data types defined in app/lib/data.ts
- Strict mode enabled — no implicit any
- All API routes properly typed

### CSS Without Frameworks
- All styling in globals.css using CSS custom properties
- No Tailwind, no CSS modules — just vanilla CSS classes
- Mobile responsive with @media queries

### AI Coaching Pattern
- No external AI API required
- Rule-based coaching in /api/coach/route.ts
- Judge personalities produce varied responses
- Score calculated from profile completeness + data quality

## Adding a New Talent Category
1. Add to TalentCategory union type in data.ts
2. Add to the select dropdown in audition/page.tsx and profile/page.tsx
3. Add sample stars with that talent to STARS array
4. Update admin stats if needed

## Adding a New Show or Movie
1. Add to TV_SHOWS or MOVIES array in data.ts
2. It automatically appears on /tv and /movies pages
3. Add product placements to PRODUCT_PLACEMENTS if sponsored

## Adding a New Showcase
1. Add to SHOWCASES array in data.ts
2. It automatically appears on /showcase page
3. Add to homepage "Next Showcase" section if it's the most upcoming

## Safety Checklist for New Features
- [ ] Does it involve youth? → Add parent consent
- [ ] Does it display content? → Ensure family-safe filtering
- [ ] Does it accept votes or scores? → Add anti-manipulation notes
- [ ] Does it show performers? → Include safety rules section
- [ ] Does it collect data? → Parent data for youth accounts

## File Structure
```
app/
  lib/data.ts           ← ALL data and types here
  globals.css           ← ALL styles here
  components/
    Nav.tsx             ← shared nav
  api/
    coach/route.ts      ← AI coaching
    auditions/route.ts  ← audition processing
    vote/route.ts       ← fan voting
    showcase/route.ts   ← showcase management
    productions/route.ts ← movies/shows
  page.tsx              ← homepage
  starverse/page.tsx    ← voting feed
  higfield-dance/page.tsx
  showcase/page.tsx
  tv/page.tsx
  movies/page.tsx
  profile/page.tsx
  audition/page.tsx
  admin/page.tsx
README.md
CLAUDE.md
SKILL.md
```
