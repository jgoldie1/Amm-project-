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
