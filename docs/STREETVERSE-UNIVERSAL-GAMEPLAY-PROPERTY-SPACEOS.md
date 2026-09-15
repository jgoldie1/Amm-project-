# StreetVerse Universal Gameplay + PropertyVerse + SpaceOS

Status: IMPLEMENTATION SPEC
Owner: TRYAMM / StreetVerse

## Goal
Create one reusable interaction and simulation layer across StreetVerse, PropertyVerse, Living Story missions, and SpaceOS/SpaceVerse so players can move from a city building to a vehicle to a spacecraft without switching to separate gameplay architectures.

## Universal interaction contract
Every interactive world object exposes one or more standard verbs:

- OPEN / CLOSE
- LOCK / UNLOCK
- ENTER / EXIT
- USE / ACTIVATE
- PICK UP / DROP
- EQUIP / UNEQUIP
- BUY / SELL
- RENT / LEASE
- OWN / TRANSFER
- TALK
- REPAIR
- BUILD / DEMOLISH
- DRIVE / RIDE
- PILOT / DOCK / LAND
- STORE / WITHDRAW

The interaction resolver determines valid actions from player state, permissions, proximity, mission state, accessibility mode, and multiplayer authority.

## Building mechanics
- Doors open, close, lock, unlock, auto-close, and support keyed/access-card/permission access.
- Windows open/close where appropriate.
- Elevators include call buttons, floor selection, access control, occupancy state, and emergency fallback behavior.
- Stairs, ramps, ladders, escalators, entrances, hallways, rooms, garages, rooftops, basements, and service areas are navigable.
- Switches, lights, furniture, seating, beds, appliances, storage, vending, kiosks, security panels, and usable world objects are interactive.
- Navigation meshes and collision update correctly for doors, elevators, construction stages, and completed buildings.

## PropertyVerse / city planning pipeline
StreetVerse parcel -> site scan/import -> CAD/BIM source -> SpaceOS planning -> structural/frame model -> stairs/elevators/accessibility -> utilities/interiors -> construction stages -> optimized game asset -> persistent building -> rentable/ownable units.

### Construction simulation stages
1. Site preparation
2. Foundation
3. Structural frame
4. Floors and roof
5. Exterior envelope
6. Electrical/plumbing/HVAC representation
7. Vertical circulation: stairs/elevators
8. Interior walls and finishes
9. Accessibility audit
10. Inspection milestones
11. Final game-world optimization
12. Persistent occupancy activation

### Persistent property model
A completed building can contain:
- apartments
- condos
- houses
- offices
- stores
- studios
- creator spaces
- event venues
- garages
- warehouses
- advertising surfaces

Players can rent, lease, or own virtual StreetVerse property. Digital-world ownership must remain clearly separated from real-world legal deeds, leases, securities, and regulated property interests unless those systems are separately implemented and legally supported.

## Accessibility-first city design
SpaceOS should validate usable routes such as:
entrance -> lobby -> elevator/ramp -> unit -> bathroom -> common areas -> exit.

Support configurable accessibility overlays for mobility, vision, hearing, speech, cognitive, and controller/input needs.

## Inventory and equipment
- item stacks and unique items
- pickup/drop/store/transfer
- backpack/storage capacity
- equipment slots
- clothing and accessories
- tools
- consumables
- mission items
- keys/access cards
- vehicle and property keys
- repair kits
- crafting/material resources where enabled
- quick-select / equipment wheel
- persistent inventory saving

## Combat and action systems
Build an original open-world action framework without copying protected game assets, code, characters, maps, dialogue, or branding from other franchises.

Core mechanics:
- health, armor, stamina
- fictional melee and ranged equipment
- aiming and targeting
- blocking, dodging, cover
- damage and recovery states
- NPC combat AI
- faction/security response
- configurable nonviolent mode
- training/tutorial arenas
- mission-scoped vehicle/space combat where appropriate

Game items should remain fictional entertainment assets, not instructions for constructing real-world weapons.

## NPC simulation
- citizens, workers, visitors, merchants, responders, mission actors
- schedules and destinations
- building entry/exit
- elevator/stair usage
- traffic interaction
- shop/property interaction
- dialogue hooks
- mission state hooks
- reputation/faction responses
- multiplayer authority rules

## Vehicles
- enter/exit seats
- driver/passenger roles
- steering, braking, reverse
- traffic rules and AI
- garages and parking
- ownership/access permissions
- fuel/charging abstraction where desired
- damage/repair
- mission hooks
- controller/touch/keyboard support

## SpaceOS / SpaceVerse vehicle extension
Player loop:
city -> spaceport -> spacecraft entry -> cockpit -> startup -> launch -> atmospheric/space flight -> navigation -> docking/landing -> mission -> return.

Spacecraft mechanics:
- pilot/copilot/crew seats
- startup/shutdown
- launch and landing
- navigation
- docking
- ship health
- shields
- fictional energy/projectile systems
- targeting
- countermeasures
- repair
- cargo
- EVA hooks
- multiplayer crew roles
- planetary mission integration

## Living Story mission integration
All systems register mission events such as:
- door_opened
- property_entered
- elevator_used
- item_equipped
- vehicle_entered
- destination_reached
- property_repaired
- building_completed
- unit_rented
- unit_owned
- spacecraft_launched
- target_docked
- mission_boss_completed

This allows the same mechanics to power Chicago screen-history missions, Property Boss missions, races, creator missions, and SpaceVerse missions.

## Chicago Screen Legacy / Mission Boss connection
Use Chicago film/television history as discovery context while keeping core TRYAMM missions original unless licenses are obtained.

Mission pattern:
real location or original Chicago-inspired district -> discovery -> Living Story objective -> gameplay challenge -> Mission Boss -> XP/reward -> Reel/movie capture -> persistent world change.

Property Boss example:
REBUILD CHICAGO: inspect a distressed virtual property, decide rehabilitation vs demolition, redesign it, satisfy accessibility/circulation requirements, manage construction stages, activate occupancy, and maintain the property.

## Persistence
Persist authoritative state for:
- player position/checkpoints
- inventory/equipment
- mission progress
- XP/reputation
- vehicle ownership/state
- property ownership/rental state
- building construction stage
- interactable state where appropriate
- spacecraft state
- world-change events

## Multiplayer rules
- server-authoritative ownership and reward state
- synchronized door/elevator/vehicle/spacecraft state
- anti-duplication inventory transactions
- permission checks before entering restricted property/vehicles
- mission instance and shared-world separation where needed
- deterministic settlement for rewards and commerce

## Vertical playable acceptance test
A release candidate should pass this complete loop on phone and desktop:

1. Spawn authenticated player.
2. Walk to a building.
3. Open and close the exterior door.
4. Enter lobby.
5. Call and ride elevator.
6. Enter owned/rented unit.
7. Open inventory and equip an item.
8. Exit the building.
9. Enter and drive a vehicle.
10. Accept a Living Story Mission Boss objective.
11. Complete the objective.
12. Receive authoritative XP/reward.
13. Capture a Reel/movie clip.
14. Save state.
15. Reload and verify persistence.
16. Enter a spaceport and board a spacecraft.
17. Launch, navigate, dock or land, and return.

## Release gates
Do not mark LIVE until tests prove:
- interaction contract works
- mobile controls work
- doors/elevators are synchronized
- persistence works
- inventory cannot duplicate
- ownership permissions are enforced
- rewards are server-authoritative
- accessibility path works
- vehicle loop works
- spacecraft loop works
- Reel capture still works after mission completion

Use the repository status vocabulary consistently: LIVE / READY / BUILDING / LOCKED / COMING SOON.
