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
| Saturn V Rocket.zip | 12 printable STL components | Assembly calibration pending | Future staged launch vehicle |
| top.stl | 10,252 triangles | Preserved as assembly component | Saturn V/source kit component |
| bottom.stl | 27,604 triangles | Preserved as assembly component | Saturn V/source kit component |
| joining cube.stl | 12 triangles | Preserved as assembly component | Saturn V/source kit connector |

## Release requirements

1. Confirm license and attribution for every visual asset before commercial redistribution.
2. Preserve original source files separately from lossy web-optimized derivatives.
3. Validate scale, origin, orientation and assembly transforms before using a model in physics.
4. Use lower levels of detail on phones and Chromebooks.
5. Never describe the browser simulation as flight-certified or the Time Machine as literal physical time travel.
