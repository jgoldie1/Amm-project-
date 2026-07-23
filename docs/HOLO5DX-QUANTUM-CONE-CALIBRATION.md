# Holo5DX Quantum Cone Calibration Workflow

The Quantum Cone Lens is treated as a calibrated multi-view optical display adapter. The software does not assume the cone itself creates a hologram. Holo5DX renders multiple views, packs them for the display, applies measured calibration transforms, and outputs them to compatible optics.

## Inputs
- display physical width/height (mm)
- display resolution (px)
- cone height (mm)
- cone angle (degrees)
- viewer distance (mm)
- number of views
- total viewing cone (degrees)
- optical center offset (x/y/z)
- packing layout

## Calibration pipeline
1. Measure hardware geometry.
2. Generate camera sectors and nominal camera rig.
3. Generate multi-view packing plan.
4. Display checkerboard and optical-center targets.
5. Photograph/measure the apparent view positions from known angles.
6. Solve per-view homography/distortion transforms.
7. Measure crosstalk/ghosting, brightness and gamma.
8. Save a hardware calibration profile.
9. Render validation scenes and compare expected vs observed view sectors.
10. Only after physical validation mark the profile hardware-certified.

## Runtime profile
A certified profile should include:
- hardwareModelId
- calibrationVersion
- camera rig
- packing rectangles
- per-view warp matrices
- brightness/gamma compensation
- supported viewing range
- validated display resolution
- measured crosstalk and sweet-spot limits

## Fallbacks
If no certified optical profile is detected, Holo5DX must fall back to standard 3D/spatial output instead of claiming holographic output.

## What this enables
The same GameVerse/HoloVerse scene can target normal screens, cone/reflector prototypes, lenticular displays, light-field displays and XR adapters using different output profiles while preserving the same scene/game logic.
