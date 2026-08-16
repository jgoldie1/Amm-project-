# TryAMM Omniverse Asset Completion Matrix

Status: ACTIVE RECOVERY / COMPLETION

## Already recovered and verified in Library archives
- GLB creatures: hunter.glb, shard.glb, falcon.glb
- Rigged GLBs: athlete.glb, raptor.glb
- Props GLBs: BoomBox, Corset, Lantern, WaterBottle, Avocado
- Sports audio: buzzer, crowd, swish, bounce, whistle, rim
- Court imagery and music loops: neon-court, iron-ring, vault-run
- Holo Creator Kit Phase 1: web app, reflector SVG template, HoloClip OpenSCAD CAD file, integration/assembly/test docs
- Court Kings playable basketball prototype
- Quantum Sports Universe / Game Lab references and playable athlete system
- Living Worlds manifests: portals, NPCs, dialogue, quests, items, factions, buildings, asset-manifest
- Existing generated TryAMM brand/video/audio assets in the ChatGPT Library

## Asset classes required for completion
### Characters / players
- base male/female/mixed player bodies
- youth/teen/adult-safe presets
- athlete body types
- fighters, racers, drivers, pilots, riders
- NPC civilians, workers, creators, performers, officials, coaches, referees
- anime/Black Anime character bases
- creatures, monsters, companions and wildlife
- Dolo AI player: front/side/back turnaround, game rig, facial rig, Holo/AR/VR/MR/cinematic/mobile variants

### Animation / mocap
- idle, walk, jog, sprint, crouch, jump, climb, swim
- sports: dribble, pass, shoot, dunk, block, tackle, pitch, bat, skate, punch, kick, grapple, vault, sprint/jump/throw events
- racing/horse: mount, dismount, riding, steering, pit/garage
- creator/media: sing, dance, instrument, host, podcast, acting, mocap facial sets
- combat/shooter/fantasy locomotion and reactions
- accessibility-friendly one-hand/slow locomotion variants

### Environments
- urban city modular kit, roads, sidewalks, intersections, traffic props
- suburbs, homes, apartments, interiors, stores, clubs, studios, schools, hospitals, churches
- stadiums/arenas/fields/courts/tracks/rinks
- racetracks, horse tracks, garages, pit lanes
- nature, forests, desert, mountains, water, beaches, weather
- sci-fi/Holo/future-city interiors and exteriors
- historical/fantasy/anime environments
- Space/planet/spacecraft environments

### Vehicles / mobility
- cars, trucks, vans, buses, motorcycles, bicycles
- race cars and open-wheel vehicles
- horses and tack
- boats/watercraft
- aircraft and drones
- futuristic/electric/flying vehicle placeholders and original production models
- transit/train/public mobility props

### Sports / game-specific equipment
- basketball, football, baseball/softball, soccer, hockey, boxing, MMA, track/field, Olympic, street sports
- nets, goals, hoops, bases, clocks, scoreboards, benches, officiating props
- uniforms with original/non-infringing branding
- controllers/HUD/icon sets

### Combat / fantasy / shooter
- original weapons and gear only
- shields, melee props, ranged gear, sci-fi gear
- VFX for hits, portals, magic, Holo powers, environmental effects
- destructible props and cover

### Holo Deck / cards
- card meshes, boards, tables, tokens, portals, spell VFX
- original card backs/icons/frames
- holographic projection materials

### Media / Anime / Creator assets
- movie/TV/HoloDrama sets
- podcast and music studios
- microphones, instruments, cameras, lights, green-screen/virtual-production props
- anime/Black Anime environments, characters and FX
- posters, covers, thumbnails, lower thirds, captions and accessibility graphics

### Holo / AR / VR / MR
- hologram materials/shaders
- spatial UI panels and gesture cursors
- AR anchors/reticles
- VR hands/controllers and teleport markers
- MR interaction props
- HoloTV/HoloCube/Volcano presentation shells

### Textures / materials / lighting
- concrete, brick, asphalt, metal, fabric, leather, wood, glass, plastic, grass, dirt, stone, water
- HDRI skies/interior lighting
- PBR basecolor/normal/roughness/metallic/emissive maps
- mobile/desktop/console LOD variants

### Audio
- UI SFX, footsteps, vehicle/engine, crowd, ambience, weather, impacts
- sports officiating and arena sounds
- creature/environmental audio
- original music beds and stingers
- spatial/Holo/Quantum Beat variants
- dialogue/voice placeholders and localization-safe stems

### UI / accessibility
- icons, buttons, controller glyphs, keyboard/touch prompts
- high-contrast variants
- screen-reader labels and caption-safe layouts
- reduced-motion and photosensitivity-safe alternatives
- subtitle/caption/audio-description icons

## Preferred free/commercial-safe sources
1. Quaternius — CC0 models/characters/vehicles/buildings/animations/game kits.
2. Poly Haven — CC0 HDRIs, textures, and 3D models.
3. ambientCG — CC0 PBR materials/textures.
4. Kenney individual free/name-your-price CC0 packs where needed; verify each pack/license at acquisition time.
5. Mixamo only for compatible rigging/animation workflow after current Adobe terms are reviewed; do not redistribute raw Mixamo source assets.

## License policy
- GREEN: CC0/public-domain or TryAMM-owned original assets.
- YELLOW: free with attribution or source-specific restrictions; keep source/license/credits metadata.
- RED: copyrighted franchise/celebrity/brand assets or unclear provenance; do not ship.
- Never use assets copied from protected games, films, TV, anime, logos or Google Images.

## Completion rule
An asset class is only COMPLETE when the actual files exist in the Asset Vault, the license/source is recorded, the file loads successfully in at least one target engine, scale/origin are normalized, LOD/performance is acceptable, and a fallback is defined.

## Engine targets
GLB/glTF -> Three.js/web/Holo
FBX -> Unreal/Unity/Godot import pipeline
USD/USDZ -> AR/spatial workflows
PNG/WebP/KTX2 -> texture/UI pipeline
WAV/OGG -> audio pipeline

## Immediate priority
1. Recover all existing Library ZIP/GLB/audio/image assets.
2. Deduplicate and classify licenses.
3. Fill base characters + universal animation gap.
4. Fill modular city + stadium + vehicle + nature gap.
5. Fill Holo/AR/VR/MR interaction assets.
6. Run import/load tests and update the manifest.
