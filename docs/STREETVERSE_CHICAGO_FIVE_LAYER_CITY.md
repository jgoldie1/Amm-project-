# StreetVerse Chicago Five-Layer Vertical City

Status: EXPERIMENTAL / DESIGN ARCHITECTURE
Pilot: The Loop, then Hyde Park where applicable

StreetVerse uses a five-layer gameplay abstraction based on real Chicago infrastructure. This is not an official City of Chicago statement that the city has exactly five layers.

## The five gameplay layers

### 5 — Elevated / 'L' / Rooftop

Use CTA-inspired elevated structures, stations, public bridges and permitted rooftop/terrace experiences.

Gameplay:
- L operator missions;
- station transfers;
- skyline creator events;
- rooftop social/venue spaces;
- cinematic elevated sequences.

### 4 — Street / Sidewalk / Storefront

The primary living-city layer:
- residents;
- cars and buses;
- storefronts;
- player businesses;
- deliveries/rideshare;
- community events;
- sports;
- creator missions;
- social RP.

### 3 — Lower Road / Service

Inspired by Lower Wacker and Chicago's stacked road/service circulation.

Gameplay:
- logistics and delivery;
- rideshare/vehicle routing;
- service-business missions;
- parking/loading;
- fictional emergency-routing simulations.

Do not turn the game into a guide for entering restricted real-world service spaces.

### 2 — Pedway / Subway

Use the public Pedway and CTA subway concept as a connected indoor/underground mobility layer.

Gameplay:
- commuter routes;
- Red/Blue-style subway missions;
- station transfers;
- indoor retail;
- weather-safe routes;
- creator popups;
- fictional investigation/puzzle missions.

### 1 — River / Riverwalk / Deep Infrastructure

Use the Chicago River and Riverwalk as a public gameplay layer, with any deeper utility/infrastructure spaces fictionalized.

Gameplay:
- riverwalk events;
- river commerce;
- water mobility concepts;
- bridge events;
- environmental missions;
- fictional deep-infrastructure story spaces.

## Vertical connectors are gameplay

Every layer transition should be represented by a connector node:
- stairs;
- elevators;
- escalators;
- ramps;
- station entrances;
- building connectors;
- parking/service ramps;
- riverwalk access.

A connector is not just scenery. It can carry:
- accessibility state;
- crowd flow;
- mission transitions;
- loading/streaming boundaries;
- audio transitions;
- weather transitions;
- transit schedules;
- emergency/service routing.

## Shared world state

All five layers read the same:
- time of day;
- weather;
- district event;
- transit state;
- traffic/crowd density;
- mission state;
- venue state.

Example:
A thunderstorm can reduce surface pedestrians, increase Pedway traffic, change road grip on the street layer, make Lower Wacker louder/wetter-looking, change train demand, and create Riverwalk closure or alternate fictional mission routing.

## The Loop vertical pilot

The Loop should be the first full five-layer test because it naturally combines elevated rail, street-level activity, lower roadway systems, Pedway/subway connections and the river.

Certification target:
1. spawn at street level;
2. enter an elevated station;
3. ride/operate an L mission segment;
4. return to street;
5. transition to Pedway/subway;
6. emerge at another surface node;
7. descend to a Lower Wacker-inspired service route;
8. reach Riverwalk;
9. complete a cross-layer mission;
10. create a Reel/highlight from the trip.

## Streaming and performance

Do not render all five layers at full fidelity simultaneously.

Use:
- active layer = full simulation;
- adjacent layer = low-cost simulation;
- distant layers = event/state summaries;
- transition preloading at connector nodes;
- instancing/LOD;
- bounded NPC and vehicle counts;
- HTML/mobile-safe representation for low-power devices.

The user should experience one continuous Chicago even though the engine streams it as multiple bounded world cells.

## AI resident behavior across layers

Residents need destinations rather than random wandering.

Examples:
- home -> bus/L station -> work -> Pedway lunch -> train -> home;
- creator -> studio -> L -> event venue -> Riverwalk Reel;
- delivery worker -> merchant -> Lower Road/service entrance -> customer;
- attendee -> train -> street event -> restaurant -> return transit.

This gives the population a believable reason to move vertically.

## Safety and authenticity rules

- public infrastructure can be geographically inspired;
- restricted/non-public infrastructure must be fictionalized;
- do not publish real access-control bypasses or restricted-entry routes;
- do not use live surveillance feeds to drive player tracking;
- distinguish real public transit information from game simulation;
- accessibility routes should be represented wherever the gameplay requires a vertical transition.

## Why this matters

Most city games flatten the world into roads plus buildings. StreetVerse can make Chicago's vertical structure part of the core simulation.

The strategic result is not merely a larger map. It is a denser city where a single downtown block can contain several different playable worlds stacked vertically and connected by transportation, businesses, missions and people.
