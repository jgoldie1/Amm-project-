# StreetVerse Open-World Integration Sources

This document records external GTA-style/open-world repositories that may inform StreetVerse development without replacing the existing TRYAMM/StreetVerse architecture.

## Rules

- Public GitHub code is not automatically reusable.
- Reuse is allowed only when a compatible license is present and attribution/license obligations are preserved.
- Repositories with no detected license are reference-only. Do not copy source code or assets from them.
- Engine-specific code (Godot, Unity, Unreal) must be ported conceptually into the existing browser/Node/StreetVerse architecture rather than embedded wholesale.
- Rockstar proprietary or leaked GTA source/assets must not be used.

## Sources

### Faizankhan17623/Gta-Clone
- Stack: JavaScript / Three.js / WebGL
- License: no license detected
- Mode: reference-only
- Relevant ideas: traffic behavior, vehicles, helicopters, wanted-level logic, police chase AI, day/night, procedural audio.

### SERAP-KEREM/GTAVClone
- Stack: C# / Unity
- License: no license detected
- Mode: reference-only
- Relevant ideas: character/vehicle controllers, NPC AI, missions, inventory, persistence.

### openfw-game/defy
- Stack: Godot / GDScript
- License: MIT
- Mode: licensed reference + selective port
- Relevant ideas: modular open-world architecture, mission/world interaction patterns.

### Zero-One101/ZrnTheftAuto
- Stack: C++ / Unreal Engine
- License: MIT
- Mode: licensed reference + selective port
- Relevant ideas: online-world systems and multiplayer mission/gameplay patterns.

### Glavin001/open-world
- Stack: JavaScript
- License: no license detected
- Mode: reference-only
- Relevant ideas: OpenStreetMap/open-data city generation and multiplayer world concepts.

## StreetVerse target systems

1. Correct lane-aligned vehicle heading and lane following.
2. Pedestrian spawning, skins, locomotion, ambient routines, and population density controls.
3. Vehicle enter/exit and player driving loop.
4. Traffic lights, intersections, pathing, collision avoidance, and emergency/police response.
5. Mission graph: delivery, racing/drifting, creator/business missions, events and NPC interactions.
6. Wanted/heat system implemented as original StreetVerse code.
7. Day/night, weather-ready world state, ambient/procedural sound and synchronized world audio.
8. Multiplayer/network-ready entity state boundaries.
9. Open-data map ingestion experiments behind a feature flag.
10. Reel capture integration so playable moments can be recorded and sent through TRYAMM creator workflows.

## Integration approach

StreetVerse remains the canonical runtime. External projects are treated as research inputs and, where licenses permit, sources for selectively ported algorithms or patterns. Each port should be rewritten to fit the existing JavaScript/browser runtime, covered by tests, and attributed where required.
