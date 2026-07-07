# AMM Omniverse Workspace Overview

This workspace coordinates the source code for the **All American Marketplace (AMM)** digital ecosystem. The codebase is divided into three distinct folders, each serving as a specialized component of the overall platform.

---

## Workspace Directory Structure

* **`amm-omniverse/`** — Main Full-Stack Application (Creator Platform, 3D Sports Games, Backend API, and Mobile wrappers)
* **`isaiah-starverse/`** — Next.js Faith-Centered Talent Discovery and AI Audition Platform
* **`amm-card-arena/`** — Holographic 3D Card Battle Game Engine & Lore Bible

---

## 1. AMM Omniverse (`amm-omniverse/`)
* **Purpose:** The core social marketplace and creator economy platform (**tryamm.online**). It manages user logins, live streaming data, the digital store, payroll, and includes 15+ interactive Three.js 3D sports games.
* **Summary:** The flagship full-stack system that powers the primary creator economy at **tryamm.online**. It operates as a responsive web app, Progressive Web App (PWA), and compiles to iOS and Android builds.

* **Tech Stack:**
  * **Frontend:** React 18, Vite, Zustand (state management), Three.js (procedural graphics and lighting), Capacitor 6 (iOS/Android wrappers).
  * **Backend (`amm-backend/`):** Node.js, Express, Stripe API, LiveKit Server SDK.
  * **Database:** Supabase (PostgreSQL with Row-Level Security).
* **Core Systems:**
  * **Games Hub (15+):** 3D sports games (Basketball 5v5, Football, WNBA, MMA, Baseball, and WebXR VR Arenas) running on custom Cannon-es rigid-body physics.
  * **Recording Studio DAW:** A 64-track digital audio workstation supporting vocal coaching, AI script writing, and digital music distribution.
  * **Creator Hub & Live Hub:** High-performance live streaming (WebRTC via LiveKit Cloud) with tap-to-tip token mechanics, melanin-tuned video filters, and AI script writing.
  * **Business Directory:** A localized registry for discovering and booking verified Black-owned businesses.
  * **Regional Teams & Payouts (BIGO Model):** Integrated multi-role payroll supporting Stripe (US), Paystack & Flutterwave (Africa), and M-Pesa payouts.
  * **KITT AI Assistant:** SVG/CSS-animated holographic helper orb utilizing Gemini 1.5 Flash for audio mixing feedback, chat support, and stream co-hosting.

---

## 2. Isaiah AI Starverse (`isaiah-starverse/`)
* **Purpose:** A Next.js 14 companion application focused on faith-centered talent discovery (**"Anyone Can Be A Star"**). Performers submit video auditions scored by an AI judge ("Messiah AI MD") and compete in public showcase tournaments.
* **Summary:** A Next.js talent showcase companion platform designed around the philosophy that **"Anyone Can Be A Star."** It is focused on family-safe, faith-centered talent discovery.

* **Tech Stack:**
  * **Framework:** Next.js 14 (App Router), TypeScript, Tailwind CSS.
  * **Database/Logic:** Modular local JSON structures for zero-API cost deployments, interfacing with the main Supabase storage.
* **Core Systems:**
  * **Messiah AI MD Judge:** A specialized AI coaching system providing 30-day custom talent roadmaps and automatic scoring for auditions.
  * **Starverse Audition Feed:** A community dashboard featuring live user voting, AI score ranking, and category-filtered star profiles.
  * **Higfield Dance 2.0:** Audition pipelines and registration management for contemporary, praise, hip-hop, and parent-child step productions.
  * **Audition Form Consent:** A built-in security check validating parent/guardian consent for youth performers.

---

## 3. AMM Card Arena (`amm-card-arena/`)
* **Purpose:** The dedicated gameplay engine for the **Holographic Card Battle Arena**. It features advanced 3D shaders representing different cosmic/biblical realms and integrates with the Hebrew Calendar to award in-game bonuses during Appointed Feasts.
* **Summary:** The dedicated visual and logical engine for the **Holographic Card Battle Arena**, which operates as a collectible card game (similar to a trading card game) built into the Fantasy Card League.

* **Tech Stack:**
  * **Rendering Engine:** Three.js (r168) physical iridescence material shaders, simulated camera sway, and Rim-Lighting.
  * **Audio Synthesis:** Web Audio API (synthesizes 10 different battle SFX offline, no media assets required).
* **Core Systems:**
  * **Ten Realms Shaders:** Unique battle rules and card visual themes representing Judah, Saturn, Light, Fire, Sky, and more.
  * **Hebrew Appointed Feast Integrations:** Syncs with the Hebrew Calendar to award in-game combat bonuses during feasts (e.g., *Yom Teruah* Shofar stun, *Hanukkah* Menorah draws, *Pesach* Exodus shields).
  * **Battle FX System:** Full visual feedback screen-shaking, damage-number floaters, and colored flash overlays responding to attacks.
  * **DTC Print Bridge:** QR-code print layouts matching print-on-demand specifications (MakePlayingCards) for physical deck unlocking.

---

## Local Development Start Instructions

### Run AMM Omniverse (Main Frontend & Backend)
1. **Start the Backend API:**
   ```bash
   cd amm-omniverse/amm-backend
   npm install
   npm start
   ```
2. **Start the Frontend App:**
   ```bash
   cd amm-omniverse
   npm install
   npm run dev
   ```

### Run Isaiah AI Starverse
```bash
cd isaiah-starverse
npm install
npm run dev
```

### Run AMM Card Arena
```bash
cd amm-card-arena
npm install
npm run dev
```

---

## Staging & Deployment Configs (Milestone 1)

The platform is configured with continuous deployment hooks to automatically compile new pushes to the `developer-vic` branch:

* **Staging Frontend:** [https://amm-omniverse.vercel.app](https://amm-omniverse.vercel.app) (Serves React files via Vercel CDN edge caches).
* **Staging Backend:** [https://amm-backend-vic.onrender.com](https://amm-backend-vic.onrender.com) (Host API endpoint running in free Node runtime on Render).
* **Database System:** Supabase PostgreSQL instance (direct interface for tables query/upserts).
* **Streaming Engine:** LiveKit Cloud sandbox.

