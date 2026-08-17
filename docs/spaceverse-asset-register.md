# TRYAMM SpaceVerse asset register

## Scientific geometry layer

NASA/JPL NAIF SPICE is the planned source for ephemerides, body orientation, reference frames, mission time conversion, instrument geometry and geometric events. SPICE data must retain kernel pedigree, version, coverage intervals and source metadata. SPICE-derived values are for the digital simulation unless independently validated for another authorized use.

Planned kernel classes:

- SPK: spacecraft and planetary ephemerides
- PCK: body size, shape and orientation constants
- FK: reference frames and alignments
- CK: time-tagged spacecraft or instrument orientation
- IK: instrument field-of-view geometry
- SCLK and LSK: spacecraft clock and leap-second conversion
- DSK: detailed body shape models
- EK: optional mission events

## Project-provided visual assets

| Asset | Source size | Web status | Simulation role |
| --- | ---: | --- | --- |
| Space Shuttle (D).glb | 2.4 MB | Optimized to 353 KB | Orbital vehicle viewer |
| Space Launch System (SLS) Block 1.stl | 13.7 MB / 274,432 triangles | Converted and optimized to 772 KB | Launch vehicle viewer |
| Space Exploration Vehicle.glb | 22.4 MB / 605,140 uploaded vertices | Optimized to 1.1 MB | Surface exploration viewer |
| External tank.glb | 829 KB | Optimized to 95 KB | Shuttle external tank viewer |\n| Tycho Supernova Remnant — left inner | 18.9 MB / 396,361 triangles | Assembly incomplete | Scientific visualization component |\n| Tycho Supernova Remnant — left outer | 19.4 MB / 407,209 triangles | Assembly incomplete | Scientific visualization component |\n| Tycho Supernova Remnant — right outer | 19.4 MB / 406,826 triangles | Assembly incomplete | Scientific visualization component |\n| Tycho Supernova Remnant — right inner | Not provided | Required before assembly | Missing scientific visualization component |\n| Saturn V Rocket.zip | 12 printable STL components | Assembly calibration pending | Future staged launch vehicle |
| top.stl | 10,252 triangles | Preserved as assembly component | Saturn V/source kit component |
| bottom.stl | 27,604 triangles | Preserved as assembly component | Saturn V/source kit component |
| joining cube.stl | 12 triangles | Preserved as assembly component | Saturn V/source kit connector |

## Tycho assembly gate\n\nThe three supplied Tycho STL sections must not be labeled as a complete remnant. The corresponding right-inner section, shared coordinate frame, scale and source attribution are required before optimization and interactive publication.\n\n## Release requirements

1. Confirm license and attribution for every visual asset before commercial redistribution.
2. Preserve original source files separately from lossy web-optimized derivatives.
3. Validate scale, origin, orientation and assembly transforms before using a model in physics.
4. Use lower levels of detail on phones and Chromebooks.
5. Never describe the browser simulation as flight-certified or the Time Machine as literal physical time travel.


## Venus and mission archive additions

| Asset | Source size | Web status | Simulation role |
| --- | ---: | --- | --- |
| Venus.tif | 3.0 MB / 1440×720 | Converted to 145 KB WebP | Global Venus mission atlas |
| THEMIS.glb | 667 KB | Optimized to 96 KB | Magnetospheric mission spacecraft |
| Ulysses.glb | 2.4 MB | Optimized to 183 KB | Solar polar mission spacecraft |
| Vehicle Assembly Building.glb | 6.3 MB | Optimized to 52 KB | Launch-site infrastructure |
| Voyager.zip | 15 printable STL pieces | Assembly calibration pending | Future Voyager spacecraft viewer |

The Venus map requires confirmed projection, coordinate convention, source mission and license metadata before scientific measurements or landing coordinates are enabled.

## Numbered rover fabrication kit

| Part | Source size | Triangles | Status |
| --- | ---: | ---: | --- |
| 1-body.stl | 896 KB | 18,338 | Print-layout component |
| 2-components.stl | 12 MB | 243,140 | Print-layout component |
| 3-pins-and-hubs.stl | 6.7 MB | 139,724 | Print-layout component |
| 4-wheels.stl | 17 MB | 348,144 | Print-layout component |

The four rover files share a print-bed origin but are not preassembled. Wheel, hub, pin and body transforms, scale and connection constraints must be calibrated before the kit is shown as a drivable simulation vehicle.


## Vesta and science fleet additions

| Asset | Source size | Web status | Simulation role |
| --- | ---: | --- | --- |
| Asteroid 4 Vesta (A).stl | 39 MB / 800,000 triangles | Reduced to 1.1 MB GLB | Interactive small-body terrain and Vesta destination |
| CubeSat - ICECube.glb | 303 KB | Optimized to 296 KB | CubeSat inspection and mission storytelling |
| CubeSat - 2 RU Generic.glb | 202 KB | Optimized to 177 KB | Configurable small-satellite reference |
| Cosmic Origins Spectrograph.glb | 431 KB | Optimized to 33 KB | Instrument inspection and observation planning |
| Cluster II.glb | 819 KB | Optimized to 111 KB | Multi-spacecraft science mission reference |
| Aura (A).glb | 466 KB | Optimized to 92 KB | Earth-observing spacecraft reference |
| Parts.zip | 4.2 MB / 20 STL components | Assembly calibration pending | Detailed rover fabrication kit |

The Vesta derivative is a performance-oriented visual model, not a measurement-grade digital shape kernel. Scientific geometry and coordinates must use documented SPICE kernels or a validated DSK with explicit coverage, reference frame, provenance and version.

## Detailed rover assembly gate

The supplied Parts.zip contains 20 separate STL components covering the body, ChemCam, science arm parts, steering, suspension, wheel and tire. It must remain labeled as a fabrication kit until scale, handedness, pivots, repeated-part counts, connection constraints and source license are validated. Do not present it as an assembled or operational rover.


## Apollo and asteroid exploration pack

| Asset | Source detail | Web status | Simulation role |
| --- | ---: | --- | --- |
| Apollo 11 - View of the Moon.tif | 11 MB / 1913×1911 | Converted to 252 KB WebP | Lunar archive image and Moon mission backdrop |
| Apollo 15 - Landing Site.stl | 6.8 MB / 141,296 triangles | Reduced to 308 KB GLB | Interactive landing-site terrain |
| Apollo 16 - Landing Site.stl | 6.7 MB / 138,810 triangles | Reduced to 298 KB GLB | Interactive landing-site terrain |
| Asteroid 6489 Golevka.stl | 200 KB / 4,092 triangles | Converted to 34 KB GLB | Small-body inspection |
| Vesta West Globe Hollow.stl | 20 MB / 400,000 triangles | Reduced to 652 KB GLB | Inspectable globe component |
| Vesta East Globe Hollow.stl | 20 MB / 400,000 triangles | Reduced to 651 KB GLB | Inspectable globe component |

The Apollo terrain models and image are educational visualization assets. Coordinate measurements, traverses and landing-site claims remain disabled until scale, projection, orientation, source product identifiers, mission provenance and licensing are confirmed.

The east and west Vesta hollow-globe files are exposed as separately labeled components. They must not be represented as a validated complete globe until seam alignment, shared origin, scale, orientation and topology are verified. Precision Vesta geometry must continue to use a documented, validated DSK or other approved scientific source.


## Space heritage and human exploration pack

| Asset | Source size | Web status | Simulation role |
| --- | ---: | --- | --- |
| Cassiopeia A Supernova (1).glb | 10 MB / 1.72M rendered vertices | Reduced to 4.1 MB GLB; load on demand | Deep-space remnant visualization |
| Ben Franklin.glb | 14 MB / 509,784 vertices | Reduced to 420 KB GLB | Historical Time Machine character reference |
| Astronaut.glb | 746 KB | Reduced to 55 KB GLB | Human exploration figure |
| Ares 1 (A).glb | 96 KB | Reduced to 15 KB GLB | Launch vehicle reference |
| Apollo Soyuz.glb | 931 KB | Reduced to 125 KB GLB | International docking mission reference |
| Agena Target Vehicle.glb | 1.2 MB | Reduced to 173 KB GLB | Rendezvous and docking target |
| Advanced Crew Escape Suit.glb | 839 KB | Reduced to 155 KB GLB | Crew safety equipment inspection |
| ACRIMSat (A).glb | 2.1 MB | Reduced to 575 KB GLB | Solar irradiance mission reference |

Cassiopeia A is a visual remnant model and must not be treated as a calibrated volumetric scientific data product without confirmed wavelength, observation date, coordinate system, scaling and source-product metadata.

The Benjamin Franklin model is labeled as a historical simulation figure. It does not claim a forensic reconstruction, authentic appearance, voice, conduct or endorsement. Educational scenarios should distinguish documented history from fictional branching narrative.

Spacecraft, suit and satellite models are visual references only. Operational procedures, dimensions, dynamics, safety decisions and mission geometry require authoritative technical documentation and validated SPICE data where applicable.
