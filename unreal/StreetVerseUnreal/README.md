# TRYAMM StreetVerse Unreal 5.8 MCP Bridge

This folder makes the TRYAMM repository ready for Unreal Engine 5.8's official Experimental Unreal MCP workflow.

## What this is

The browser/mobile production client remains the current Three.js + React Three Fiber + Rapier stack.

This Unreal project is the higher-end editor/client path for:
- photoreal city reconstruction
- PC/console-quality rendering
- cinematics and Holo Drama
- PCG city/world generation
- Blueprint/actor/material automation
- higher-fidelity physics, vehicles, crowds, lighting, and interiors
- importing shared TRYAMM player/world/mission manifests

It is deliberately not a replacement for the web/iPhone client.

## Enable Unreal MCP

Use Unreal Engine 5.8.

1. Open `StreetVerseUnreal.uproject`.
2. Edit > Plugins:
   - enable **Unreal MCP**
   - enable **All Toolsets**
   - Toolset Registry is enabled as a dependency
3. Restart the editor.
4. Editor Preferences > General > Model Context Protocol:
   - enable **Auto Start Server**
   - default endpoint: `http://127.0.0.1:8000/mcp`
5. From the Unreal console generate client configuration:
   - `ModelContextProtocol.GenerateClientConfig All`
6. Start the MCP-compatible agent from this project root.

The file `.mcp.json.example` documents the expected local endpoint. Prefer Unreal's generated client config when possible so existing MCP entries are merged safely.

## Security boundary

Unreal MCP is editor-only tooling. Keep the server bound to localhost. Do not expose port 8000 publicly. The production TRYAMM website must never depend on the Unreal editor server.

## Shared TRYAMM bridge

Run from `amm-omniverse/`:

```bash
npm run unreal:manifest
```

That generates:

`../unreal/StreetVerseUnreal/Import/tryamm-streetverse-manifest.json`

The manifest gives Unreal a stable interchange contract for:
- StreetVerse
- Kingdom city
- CampusVerse
- CrossVerse
- BJ/player identity and Passport references
- missions and waypoints
- Reels and OmniBox
- LIVE/creator-commerce handoff
- server-authoritative ledger rules

Unreal should consume those identifiers and events, but it must not mint spendable TRYAMM money locally.

## Recommended Unreal production workflow

1. Import optimized GLB/FBX/USD assets.
2. Use PCG to place city blocks, props, vegetation, and traffic-support geometry.
3. Use Unreal MCP to inspect the level, spawn/configure actors, materials, lights, Blueprints and tests.
4. Keep mission/content identifiers aligned with the generated TRYAMM manifest.
5. Export validated asset metadata back to the shared pipeline rather than duplicating economic state.
6. Run browser/mobile and Unreal clients against the same backend identity/economy contracts.

## Status

Repository side: MCP-ready scaffolding.
Actual MCP connection: becomes live only while Unreal Engine 5.8 is running locally with the Unreal MCP server enabled.
