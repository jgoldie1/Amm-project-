# StreetVerse: REA game mechanics evidence workflow

## Source and authority
The optional external project [REA: Reverse Engineer Anything](https://github.com/morluto/rea)
is a reverse-engineering investigation tool, **not a game engine**.
Use it only for software owned by TRYAMM or software you have explicit rights to inspect.
Do not copy proprietary GTA/Rockstar assets, code, missions or art. Do not bypass DRM,
anti-cheat, access controls or licenses. Review tool dependencies and version before
installing on a controlled development machine; this repository does not install REA
on CI runners.

## What we connected
Run **Actions → StreetVerse REA Evidence Audit → Run workflow**. This independent,
read-only scan inventories the StreetVerse frontend, world builder, generator,
character GLB loader, vehicle/mission references, AI Café agent runtime,
authenticated backend job handler, website builder and the pending Mycelium/
one-button integration modules. It uploads a JSON evidence artifact.

## What REA can do later, if authorized and installed separately
1. Capture a concrete StreetVerse gameplay bug on an approved test build.
2. Trace the UI action, application modules, rendering/collision path and state transitions.
3. Return original-source evidence with reproduction steps and screenshots/logs.
4. Implement a clean original fix on a feature branch.
5. Validate with unit tests, mobile interaction checks and a human-observed playable test.

## What this does not do
- It does not install or run the external REA tool.
- It does not inspect GTA binaries or download commercial game data.
- It does not generate city meshes or wire a live multiplayer backend.
- A passed source check is **not** evidence of BJ rig visibility, driving physics,
  actual mission completion, server-side purchase or production readiness.

## Production release criteria
Release remains blocked until the main regression workflows pass and one-hand
iPhone/Chromebook tests establish actual 3D loads, BJ GLB animation, road
collision, enter/drive/exit, NPC dialogue, mission rewards exactly once, backed-up
save/reload, authenticated API jobs and reliable deployment.
