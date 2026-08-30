# SECS Construct Chamber — Prototype Engineering Package

Status: software + bench prototype specification. This document does **not** claim a free-standing solid-energy object has been achieved. Physical performance must be validated on real hardware.

## 1. Prototype goal
Build a 12–24 inch tabletop chamber that can render a virtual object, track a hand near it, and produce safe tactile cues through low-energy haptic hardware. The first supported construct shapes are cube, sphere, button, and steering wheel.

## 2. System architecture
StreetVerse / HoloGPT intent → SECS Construct Compiler → geometry + collision bounds → visual renderer → hand tracking → haptic cue planner → hardware gateway → low-voltage haptic actuators.

Every hardware command must pass two independent safety gates: software limits in `SECSConstructRuntime.ts` and hardware/firmware limits in the prototype controller. An emergency-stop input must be wired in series with actuator enable.

## 3. Recommended prototype components
- Host computer running TRYAMM/StreetVerse.
- USB microcontroller such as ESP32-S3 or similar development board.
- USB or supported hand-tracking camera/sensor.
- Existing monitor/projector/AR display for the visual layer. No claim of a true volumetric hologram is required for Phase 1.
- 4–8 low-voltage vibration/ERM or LRA haptic modules, each driven by a manufacturer-recommended low-voltage driver board.
- 5 V regulated bench supply sized to the selected modules; use an inline fuse per the supply/driver manufacturer guidance.
- Normally-closed emergency-stop switch controlling actuator-enable power.
- Enclosure, finger guards, cable strain relief, and nonconductive mounting plate.

Do not directly drive experimental ultrasonic phased arrays, exposed high-voltage transducers, lasers, plasma devices, or high-force actuators from this prototype. Those require a separate professionally reviewed hardware program.

## 4. Safe low-voltage wiring topology

```text
HOST COMPUTER
  USB
   |
   v
MICROCONTROLLER (USB powered)
  GPIO status ----------------------> indicator LED (through board-appropriate resistor)
  I2C/SPI/UART ---------------------> haptic driver modules
  GPIO ESTOP_SENSE <---------------- emergency-stop auxiliary contact

5 V REGULATED ACTUATOR SUPPLY
  +5V ---- fuse ---- NC E-STOP ---- ACTUATOR_ENABLE BUS ---- haptic driver VIN
  GND -----------------------------------------------+------ haptic driver GND
                                                     +------ controller GND (common reference only if required by driver)

HAPTIC DRIVER OUTPUTS -------------------------------> low-voltage haptic modules
```

Follow the exact voltage/current limits and reference schematic for whichever controller and haptic driver are selected. If a driver uses isolation, preserve that isolation rather than tying grounds together.

## 5. Hardware gateway packet
The browser emits `tryamm:secs:prototype-command` with:

- `version`
- `requestId`
- `geometry`
- `boundsMm`
- `positionMm`
- `visual`
- `haptics`
- `emergencyStopRequired`
- `hardwareValidationRequired`

A local gateway can serialize this object over WebSerial/WebUSB in a later phase. The firmware must reject malformed packets, disabled E-stop state, unsupported channels, or intensity outside the independently configured hardware envelope.

## 6. Bench test sequence
1. Assemble controller and one haptic module with actuator power disabled.
2. Verify emergency-stop sense changes correctly before connecting any actuator.
3. Run firmware with outputs forced disabled and confirm heartbeat/status messages.
4. Connect one low-voltage haptic module and test the lowest supported intensity.
5. Add channels one at a time.
6. Run `window.__runSECSConstructSelfTest()` in the browser console and verify all three software test constructs pass.
7. Trigger an oversized construct and verify software denies it.
8. Press E-stop and verify firmware disables all outputs immediately.
9. Reboot with E-stop active and verify outputs remain disabled.
10. Only after the above passes should the StreetVerse prototype bridge be enabled.

## 7. Acceptance criteria
- No actuator output when E-stop is active.
- No output before a valid command is received.
- Invalid or oversized commands are rejected.
- Haptic intensity is clamped independently in software and firmware.
- Cube, button, and steering-wheel software commands produce deterministic packets.
- Visual rendering continues if hardware is absent; StreetVerse must degrade to simulation rather than fail.

## 8. Phase ladder
Phase 1: visual + hand tracking + low-voltage tactile cues.
Phase 2: spatial/AR display integration and calibrated coordinate mapping.
Phase 3: commercial mid-air haptic hardware integration using the vendor SDK and certified operating limits.
Phase 4: larger chamber and multi-user safety testing.
Phase 5: experimental construct research only after independent electrical/mechanical safety review and measured validation.
