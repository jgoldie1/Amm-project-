import type {HoloCADPreset} from './livingSystemsPresets'

/**
 * Original low-poly aerospace/robotics teaching diagrams.
 * Dimensions are arbitrary 3D scene units; NOT real CAD, airworthiness,
 * robotics control, launch engineering, medical exoskeleton or space hardware.
 */
export const HOLOCAD_AEROSPACE_ROBOTICS_KEYS=[
 'aircraft',
 'spacecraft',
 'satellite',
 'drone',
 'humanoid-robot',
 'robot-dog',
 'rover',
 'exoskeleton',
 'robotic-arm',
] as const
export type HoloCADEngineeringSubject=(typeof HOLOCAD_AEROSPACE_ROBOTICS_KEYS)[number]

export const HOLOCAD_AEROSPACE_ROBOTICS_PRESETS:Record<HoloCADEngineeringSubject,HoloCADPreset>={
 "aircraft":{
  "title": "AIRCRAFT ENGINEERING",
  "subtitle": "Illustrative fixed-wing aircraft: lift, propulsion, avionics and flight systems",
  "parts": [
    {
      "id": "fuselage",
      "label": "Fuselage shell",
      "layer": "shell",
      "shape": "capsule",
      "position": [
        0,
        1.3,
        0
      ],
      "size": [
        2.5,
        0.75,
        0.7
      ],
      "color": 8432085,
      "explode": [
        0,
        1.6,
        0
      ],
      "opacity": 1,
      "description": "Outer shell housing the cockpit, payload and subsystem layout; shape is schematic."
    },
    {
      "id": "nose-cone",
      "label": "Nose fairing",
      "layer": "shell",
      "shape": "sphere",
      "position": [
        1.65,
        1.3,
        0
      ],
      "size": [
        0.7,
        0.54,
        0.53
      ],
      "color": 11128033,
      "explode": [
        1.7,
        0.5,
        0
      ],
      "opacity": 1,
      "description": "Simplified nose fairing and exterior aerodynamic envelope."
    },
    {
      "id": "left-wing",
      "label": "Port wing",
      "layer": "structure",
      "shape": "box",
      "position": [
        0,
        1.24,
        -1.35
      ],
      "size": [
        1.1,
        0.1,
        2.3
      ],
      "color": 13687528,
      "explode": [
        0,
        0.6,
        -1.7
      ],
      "opacity": 1,
      "description": "Lift-producing wing surface; no aerodynamic coefficient is validated."
    },
    {
      "id": "right-wing",
      "label": "Starboard wing",
      "layer": "structure",
      "shape": "box",
      "position": [
        0,
        1.24,
        1.35
      ],
      "size": [
        1.1,
        0.1,
        2.3
      ],
      "color": 13687528,
      "explode": [
        0,
        0.6,
        1.7
      ],
      "opacity": 1,
      "description": "Lift-producing wing surface; no aerodynamic coefficient is validated."
    },
    {
      "id": "tailplane",
      "label": "Tail stabilizer",
      "layer": "structure",
      "shape": "box",
      "position": [
        -1.35,
        1.45,
        0
      ],
      "size": [
        0.55,
        0.09,
        1.15
      ],
      "color": 11124690,
      "explode": [
        -1.4,
        1,
        0
      ],
      "opacity": 1,
      "description": "Horizontal stability surface, illustrated only."
    },
    {
      "id": "vertical-tail",
      "label": "Vertical tail",
      "layer": "structure",
      "shape": "box",
      "position": [
        -1.37,
        1.87,
        0
      ],
      "size": [
        0.7,
        0.86,
        0.11
      ],
      "color": 8166846,
      "explode": [
        -1.6,
        1.3,
        0
      ],
      "opacity": 1,
      "description": "Vertical directional stability surface."
    },
    {
      "id": "engine-left",
      "label": "Engine / left",
      "layer": "propulsion",
      "shape": "cylinder",
      "position": [
        0.15,
        0.91,
        -0.68
      ],
      "size": [
        0.35,
        0.8,
        0.35
      ],
      "color": 5598332,
      "explode": [
        0.7,
        -0.8,
        -1.4
      ],
      "opacity": 1,
      "description": "Simplified engine module, not a certified propulsion design."
    },
    {
      "id": "engine-right",
      "label": "Engine / right",
      "layer": "propulsion",
      "shape": "cylinder",
      "position": [
        0.15,
        0.91,
        0.68
      ],
      "size": [
        0.35,
        0.8,
        0.35
      ],
      "color": 5598332,
      "explode": [
        0.7,
        -0.8,
        1.4
      ],
      "opacity": 1,
      "description": "Simplified paired propulsion module."
    },
    {
      "id": "fuel-storage",
      "label": "Fuel or energy storage",
      "layer": "power",
      "shape": "box",
      "position": [
        -0.15,
        1.23,
        0
      ],
      "size": [
        0.75,
        0.27,
        0.52
      ],
      "color": 14727523,
      "explode": [
        0,
        -1.1,
        0
      ],
      "opacity": 1,
      "description": "Illustrative stored-energy volume; no real fuel configuration is supplied."
    },
    {
      "id": "flight-control",
      "label": "Flight-control computer",
      "layer": "avionics",
      "shape": "box",
      "position": [
        1,
        1.54,
        0
      ],
      "size": [
        0.4,
        0.23,
        0.35
      ],
      "color": 5623746,
      "explode": [
        1.3,
        1.2,
        0
      ],
      "opacity": 1,
      "description": "Abstract flight-control processing unit. No flight code or live hardware interface."
    },
    {
      "id": "imu",
      "label": "Attitude and motion sensors",
      "layer": "sensors",
      "shape": "sphere",
      "position": [
        0.85,
        1.72,
        0
      ],
      "size": [
        0.2,
        0.18,
        0.2
      ],
      "color": 9429228,
      "explode": [
        1.2,
        1.4,
        0
      ],
      "opacity": 1,
      "description": "Orientation/acceleration sensor illustration; no calibrated measurements."
    },
    {
      "id": "radio",
      "label": "Communications module",
      "layer": "comms",
      "shape": "box",
      "position": [
        -0.7,
        1.6,
        0
      ],
      "size": [
        0.35,
        0.19,
        0.29
      ],
      "color": 9149672,
      "explode": [
        -0.9,
        1.4,
        0
      ],
      "opacity": 1,
      "description": "Communications subsystem placeholder."
    },
    {
      "id": "landing-gear-front",
      "label": "Nose landing gear",
      "layer": "landing-gear",
      "shape": "cylinder",
      "position": [
        1.03,
        0.47,
        0
      ],
      "size": [
        0.2,
        0.66,
        0.2
      ],
      "color": 3489096,
      "explode": [
        1,
        -1.1,
        0
      ],
      "opacity": 1,
      "description": "Landing support schematic. Not a structural-load calculation."
    },
    {
      "id": "landing-gear-left",
      "label": "Left main gear",
      "layer": "landing-gear",
      "shape": "cylinder",
      "position": [
        -0.64,
        0.44,
        -0.55
      ],
      "size": [
        0.22,
        0.66,
        0.22
      ],
      "color": 3489096,
      "explode": [
        -0.8,
        -1.1,
        -1.1
      ],
      "opacity": 1,
      "description": "Illustrative landing support."
    },
    {
      "id": "landing-gear-right",
      "label": "Right main gear",
      "layer": "landing-gear",
      "shape": "cylinder",
      "position": [
        -0.64,
        0.44,
        0.55
      ],
      "size": [
        0.22,
        0.66,
        0.22
      ],
      "color": 3489096,
      "explode": [
        -0.8,
        -1.1,
        1.1
      ],
      "opacity": 1,
      "description": "Illustrative landing support."
    },
    {
      "id": "cockpit",
      "label": "Cockpit interface",
      "layer": "interior",
      "shape": "box",
      "position": [
        1.05,
        1.64,
        0
      ],
      "size": [
        0.63,
        0.4,
        0.55
      ],
      "color": 3362414,
      "explode": [
        1.2,
        1.5,
        0
      ],
      "opacity": 1,
      "description": "Conceptual pilot controls/display without any flight authority."
    }
  ]
},
 "spacecraft":{
  "title": "SPACECRAFT SYSTEMS",
  "subtitle": "Conceptual orbital spacecraft, habitat and propulsion subsystems",
  "parts": [
    {
      "id": "crew-module",
      "label": "Crew/habitat module",
      "layer": "shell",
      "shape": "capsule",
      "position": [
        0,
        1.48,
        0
      ],
      "size": [
        1.45,
        0.86,
        0.95
      ],
      "color": 12769257,
      "explode": [
        0,
        1.65,
        0
      ],
      "opacity": 1,
      "description": "Schematic occupied module; no crew-rated structural or life-support validation."
    },
    {
      "id": "nose",
      "label": "Forward fairing",
      "layer": "shell",
      "shape": "sphere",
      "position": [
        1.07,
        1.48,
        0
      ],
      "size": [
        0.65,
        0.72,
        0.75
      ],
      "color": 14938103,
      "explode": [
        1.7,
        0.75,
        0
      ],
      "opacity": 1,
      "description": "Forward shell, illustrative profile."
    },
    {
      "id": "aft-frame",
      "label": "Aft support ring",
      "layer": "structure",
      "shape": "cylinder",
      "position": [
        -1.12,
        1.47,
        0
      ],
      "size": [
        0.83,
        0.17,
        0.83
      ],
      "color": 10333637,
      "explode": [
        -1.4,
        -0.6,
        0
      ],
      "opacity": 1,
      "description": "Generic spacecraft support structure."
    },
    {
      "id": "solar-left",
      "label": "Solar array port",
      "layer": "power",
      "shape": "box",
      "position": [
        -0.15,
        1.47,
        -1.72
      ],
      "size": [
        0.35,
        0.04,
        2.45
      ],
      "color": 2975171,
      "explode": [
        0,
        1.5,
        -2
      ],
      "opacity": 1,
      "description": "Illustrative solar harvesting array, no output or orbital power prediction."
    },
    {
      "id": "solar-right",
      "label": "Solar array starboard",
      "layer": "power",
      "shape": "box",
      "position": [
        -0.15,
        1.47,
        1.72
      ],
      "size": [
        0.35,
        0.04,
        2.45
      ],
      "color": 2975171,
      "explode": [
        0,
        1.5,
        2
      ],
      "opacity": 1,
      "description": "Illustrative solar harvesting array, no output or orbital power prediction."
    },
    {
      "id": "battery-bank",
      "label": "Battery bank",
      "layer": "power",
      "shape": "box",
      "position": [
        0,
        1.14,
        0.27
      ],
      "size": [
        0.68,
        0.36,
        0.45
      ],
      "color": 14728042,
      "explode": [
        0,
        -0.8,
        1.5
      ],
      "opacity": 1,
      "description": "Non-specific onboard energy storage; not a qualified flight battery."
    },
    {
      "id": "thruster-cluster",
      "label": "Maneuvering propulsion",
      "layer": "propulsion",
      "shape": "cylinder",
      "position": [
        -1.47,
        1.41,
        0
      ],
      "size": [
        0.53,
        0.55,
        0.55
      ],
      "color": 7045266,
      "explode": [
        -1.5,
        -0.7,
        0
      ],
      "opacity": 1,
      "description": "Cold-gas/electric/chemical systems are not selected or modeled."
    },
    {
      "id": "propulsion-tank",
      "label": "Propellant storage schematic",
      "layer": "propulsion",
      "shape": "sphere",
      "position": [
        -0.58,
        1.37,
        0
      ],
      "size": [
        0.64,
        0.65,
        0.56
      ],
      "color": 8561840,
      "explode": [
        -1,
        0.5,
        1.3
      ],
      "opacity": 1,
      "description": "Abstract propellant volume, no pressure/thermal specs."
    },
    {
      "id": "thermal-radiator",
      "label": "Thermal radiator",
      "layer": "thermal",
      "shape": "box",
      "position": [
        -0.6,
        2.12,
        0
      ],
      "size": [
        0.94,
        0.08,
        0.85
      ],
      "color": 12178916,
      "explode": [
        -1.4,
        1.6,
        0
      ],
      "opacity": 1,
      "description": "Passive heat-rejection surface illustration only."
    },
    {
      "id": "life-support",
      "label": "Environmental support subsystem",
      "layer": "life-support",
      "shape": "box",
      "position": [
        0.45,
        1.08,
        0
      ],
      "size": [
        0.42,
        0.38,
        0.44
      ],
      "color": 5944743,
      "explode": [
        1.1,
        -1,
        0
      ],
      "opacity": 1,
      "description": "Conceptual cabin air and environmental loops, not life-safety equipment."
    },
    {
      "id": "computer",
      "label": "Navigation/control computer",
      "layer": "avionics",
      "shape": "box",
      "position": [
        0.41,
        1.62,
        -0.24
      ],
      "size": [
        0.37,
        0.25,
        0.32
      ],
      "color": 4566752,
      "explode": [
        1.3,
        1.3,
        -1.5
      ],
      "opacity": 1,
      "description": "Onboard processing concept; no live spacecraft control."
    },
    {
      "id": "attitude-sensor",
      "label": "Star tracker / attitude sensor",
      "layer": "sensors",
      "shape": "sphere",
      "position": [
        0.55,
        2,
        0
      ],
      "size": [
        0.26,
        0.21,
        0.22
      ],
      "color": 10343924,
      "explode": [
        0.9,
        1.3,
        0
      ],
      "opacity": 1,
      "description": "Sensor envelope placeholder, not calibrated orientation data."
    },
    {
      "id": "communications-array",
      "label": "Communications antenna",
      "layer": "comms",
      "shape": "cylinder",
      "position": [
        0.05,
        2.23,
        0
      ],
      "size": [
        0.38,
        0.48,
        0.38
      ],
      "color": 13358565,
      "explode": [
        0,
        1.8,
        1.2
      ],
      "opacity": 1,
      "description": "Space link antenna graphic, no actual transmission."
    },
    {
      "id": "docking-interface",
      "label": "Docking interface",
      "layer": "structure",
      "shape": "cylinder",
      "position": [
        1.5,
        1.45,
        0
      ],
      "size": [
        0.56,
        0.17,
        0.56
      ],
      "color": 10205392,
      "explode": [
        1.7,
        0,
        0
      ],
      "opacity": 1,
      "description": "Symbolic docking connector; no dynamics or safety certification."
    }
  ]
},
 "satellite":{
  "title": "SATELLITE DIGITAL TWIN",
  "subtitle": "Conceptual spacecraft bus, solar arrays, sensors and communication links",
  "parts": [
    {
      "id": "satellite-bus",
      "label": "Satellite core bus",
      "layer": "structure",
      "shape": "box",
      "position": [
        0,
        1.2,
        0
      ],
      "size": [
        1,
        1.1,
        0.82
      ],
      "color": 12241886,
      "explode": [
        0,
        1.2,
        0
      ],
      "opacity": 1,
      "description": "Core structure holding satellite subsystems; not a real mission configuration."
    },
    {
      "id": "antenna-dish",
      "label": "Antenna dish",
      "layer": "comms",
      "shape": "sphere",
      "position": [
        0.55,
        1.23,
        0
      ],
      "size": [
        0.75,
        0.63,
        0.65
      ],
      "color": 13031137,
      "explode": [
        1.7,
        0.7,
        0
      ],
      "opacity": 1,
      "description": "Parabolic-looking shape for classroom demonstrations."
    },
    {
      "id": "solar-port",
      "label": "Port solar panel",
      "layer": "power",
      "shape": "box",
      "position": [
        0,
        1.28,
        -1.44
      ],
      "size": [
        0.68,
        0.06,
        1.95
      ],
      "color": 3566791,
      "explode": [
        0,
        1,
        -1.9
      ],
      "opacity": 1,
      "description": "Panel geometry for understanding deployment."
    },
    {
      "id": "solar-starboard",
      "label": "Starboard solar panel",
      "layer": "power",
      "shape": "box",
      "position": [
        0,
        1.28,
        1.44
      ],
      "size": [
        0.68,
        0.06,
        1.95
      ],
      "color": 3566791,
      "explode": [
        0,
        1,
        1.9
      ],
      "opacity": 1,
      "description": "Illustrative photovoltaic array."
    },
    {
      "id": "array-hinge-port",
      "label": "Port array hinge",
      "layer": "actuation",
      "shape": "cylinder",
      "position": [
        0,
        1.28,
        -0.51
      ],
      "size": [
        0.2,
        0.19,
        0.22
      ],
      "color": 10595000,
      "explode": [
        0,
        0.5,
        -1
      ],
      "opacity": 1,
      "description": "Generic deployment joint."
    },
    {
      "id": "array-hinge-starboard",
      "label": "Starboard array hinge",
      "layer": "actuation",
      "shape": "cylinder",
      "position": [
        0,
        1.28,
        0.51
      ],
      "size": [
        0.2,
        0.19,
        0.22
      ],
      "color": 10595000,
      "explode": [
        0,
        0.5,
        1
      ],
      "opacity": 1,
      "description": "Generic deployment joint."
    },
    {
      "id": "optical-instrument",
      "label": "Earth/space imaging payload",
      "layer": "payload",
      "shape": "cylinder",
      "position": [
        0,
        1.7,
        0.08
      ],
      "size": [
        0.44,
        0.53,
        0.44
      ],
      "color": 8100799,
      "explode": [
        0,
        1.6,
        1.3
      ],
      "opacity": 1,
      "description": "Research camera placeholder, not a real observation instrument."
    },
    {
      "id": "onboard-computer",
      "label": "Spacecraft avionics",
      "layer": "avionics",
      "shape": "box",
      "position": [
        -0.15,
        1.28,
        -0.18
      ],
      "size": [
        0.44,
        0.24,
        0.3
      ],
      "color": 4967362,
      "explode": [
        -1.3,
        0.7,
        -1.1
      ],
      "opacity": 1,
      "description": "Illustrative command/data-handling module."
    },
    {
      "id": "reaction-wheel",
      "label": "Attitude control wheel",
      "layer": "actuation",
      "shape": "cylinder",
      "position": [
        -0.13,
        0.98,
        0.13
      ],
      "size": [
        0.32,
        0.28,
        0.32
      ],
      "color": 10928586,
      "explode": [
        -1.1,
        -0.7,
        1.2
      ],
      "opacity": 1,
      "description": "Attitude actuator concept; no control-law implementation."
    },
    {
      "id": "battery",
      "label": "Power storage",
      "layer": "power",
      "shape": "box",
      "position": [
        0.12,
        0.91,
        -0.14
      ],
      "size": [
        0.5,
        0.22,
        0.36
      ],
      "color": 14660706,
      "explode": [
        1.1,
        -0.9,
        -0.8
      ],
      "opacity": 1,
      "description": "Battery graphic, not qualified energy or temperature ratings."
    },
    {
      "id": "radio-transceiver",
      "label": "Radio transceiver",
      "layer": "comms",
      "shape": "box",
      "position": [
        -0.26,
        1.66,
        0
      ],
      "size": [
        0.37,
        0.23,
        0.3
      ],
      "color": 7706075,
      "explode": [
        -1.2,
        1.3,
        0
      ],
      "opacity": 1,
      "description": "Transmitter/receiver concept without RF emission."
    },
    {
      "id": "thermal-panel",
      "label": "Thermal control surface",
      "layer": "thermal",
      "shape": "box",
      "position": [
        -0.49,
        1.31,
        0
      ],
      "size": [
        0.08,
        0.8,
        0.68
      ],
      "color": 6601695,
      "explode": [
        -1.2,
        0.6,
        -0.5
      ],
      "opacity": 1,
      "description": "Thermal radiator / insulation schematic."
    },
    {
      "id": "mounting-bracket",
      "label": "Payload mount",
      "layer": "structure",
      "shape": "box",
      "position": [
        0.08,
        0.56,
        0
      ],
      "size": [
        0.45,
        0.31,
        0.39
      ],
      "color": 8887983,
      "explode": [
        0,
        -1.1,
        0
      ],
      "opacity": 1,
      "description": "Mechanical attachment concept; no stress test."
    }
  ]
},
 "drone":{
  "title": "DRONE / UAS STUDY",
  "subtitle": "Four-rotor educational vehicle, sensors, power and propulsion",
  "parts": [
    {
      "id": "airframe",
      "label": "Center frame",
      "layer": "structure",
      "shape": "box",
      "position": [
        0,
        1.22,
        0
      ],
      "size": [
        0.85,
        0.24,
        0.75
      ],
      "color": 9421017,
      "explode": [
        0,
        0.9,
        0
      ],
      "opacity": 1,
      "description": "Generic quadrotor body frame. Not a flight-ready design."
    },
    {
      "id": "arm-nw",
      "label": "Front-left arm",
      "layer": "structure",
      "shape": "box",
      "position": [
        0.53,
        1.19,
        -0.53
      ],
      "size": [
        0.98,
        0.11,
        0.12
      ],
      "color": 13031138,
      "explode": [
        0.9,
        0.4,
        -1.2
      ],
      "opacity": 1,
      "description": "Schematic motor support arm."
    },
    {
      "id": "arm-ne",
      "label": "Front-right arm",
      "layer": "structure",
      "shape": "box",
      "position": [
        0.53,
        1.19,
        0.53
      ],
      "size": [
        0.98,
        0.11,
        0.12
      ],
      "color": 13031138,
      "explode": [
        0.9,
        0.4,
        1.2
      ],
      "opacity": 1,
      "description": "Schematic motor support arm."
    },
    {
      "id": "arm-sw",
      "label": "Rear-left arm",
      "layer": "structure",
      "shape": "box",
      "position": [
        -0.53,
        1.19,
        -0.53
      ],
      "size": [
        0.98,
        0.11,
        0.12
      ],
      "color": 13031138,
      "explode": [
        -0.9,
        0.4,
        -1.2
      ],
      "opacity": 1,
      "description": "Schematic motor support arm."
    },
    {
      "id": "arm-se",
      "label": "Rear-right arm",
      "layer": "structure",
      "shape": "box",
      "position": [
        -0.53,
        1.19,
        0.53
      ],
      "size": [
        0.98,
        0.11,
        0.12
      ],
      "color": 13031138,
      "explode": [
        -0.9,
        0.4,
        1.2
      ],
      "opacity": 1,
      "description": "Schematic motor support arm."
    },
    {
      "id": "rotor-nw",
      "label": "Rotor 1",
      "layer": "propulsion",
      "shape": "cylinder",
      "position": [
        0.95,
        1.24,
        -0.94
      ],
      "size": [
        0.64,
        0.04,
        0.64
      ],
      "color": 8101307,
      "explode": [
        1.6,
        0.9,
        -1.4
      ],
      "opacity": 1,
      "description": "Static rotor disc; this lab does not simulate real lift."
    },
    {
      "id": "rotor-ne",
      "label": "Rotor 2",
      "layer": "propulsion",
      "shape": "cylinder",
      "position": [
        0.95,
        1.24,
        0.94
      ],
      "size": [
        0.64,
        0.04,
        0.64
      ],
      "color": 8101307,
      "explode": [
        1.6,
        0.9,
        1.4
      ],
      "opacity": 1,
      "description": "Static rotor disc; this lab does not simulate real lift."
    },
    {
      "id": "rotor-sw",
      "label": "Rotor 3",
      "layer": "propulsion",
      "shape": "cylinder",
      "position": [
        -0.95,
        1.24,
        -0.94
      ],
      "size": [
        0.64,
        0.04,
        0.64
      ],
      "color": 8101307,
      "explode": [
        -1.6,
        0.9,
        -1.4
      ],
      "opacity": 1,
      "description": "Static rotor disc; this lab does not simulate real lift."
    },
    {
      "id": "rotor-se",
      "label": "Rotor 4",
      "layer": "propulsion",
      "shape": "cylinder",
      "position": [
        -0.95,
        1.24,
        0.94
      ],
      "size": [
        0.64,
        0.04,
        0.64
      ],
      "color": 8101307,
      "explode": [
        -1.6,
        0.9,
        1.4
      ],
      "opacity": 1,
      "description": "Static rotor disc; this lab does not simulate real lift."
    },
    {
      "id": "flight-processor",
      "label": "Autopilot study module",
      "layer": "avionics",
      "shape": "box",
      "position": [
        0,
        1.35,
        0
      ],
      "size": [
        0.3,
        0.17,
        0.28
      ],
      "color": 5296318,
      "explode": [
        0,
        1.3,
        0
      ],
      "opacity": 1,
      "description": "Educational avionics placeholder, not a real autopilot."
    },
    {
      "id": "imu",
      "label": "Motion sensor",
      "layer": "sensors",
      "shape": "sphere",
      "position": [
        0.24,
        1.38,
        0
      ],
      "size": [
        0.14,
        0.15,
        0.14
      ],
      "color": 6729443,
      "explode": [
        0.7,
        1.3,
        0
      ],
      "opacity": 1,
      "description": "Inertial sensor concept, no telemetry or calibration."
    },
    {
      "id": "battery",
      "label": "Rechargeable battery",
      "layer": "power",
      "shape": "box",
      "position": [
        -0.22,
        1.03,
        0
      ],
      "size": [
        0.39,
        0.18,
        0.33
      ],
      "color": 14201431,
      "explode": [
        -0.8,
        -0.8,
        0
      ],
      "opacity": 1,
      "description": "Onboard energy block, no charging or safety claims."
    },
    {
      "id": "camera",
      "label": "Inspection camera",
      "layer": "payload",
      "shape": "sphere",
      "position": [
        0.25,
        0.86,
        0
      ],
      "size": [
        0.23,
        0.24,
        0.22
      ],
      "color": 5531002,
      "explode": [
        0.7,
        -0.8,
        0
      ],
      "opacity": 1,
      "description": "Educational optical payload; no camera is activated."
    },
    {
      "id": "radio",
      "label": "Remote link",
      "layer": "comms",
      "shape": "box",
      "position": [
        -0.21,
        1.42,
        0.2
      ],
      "size": [
        0.29,
        0.14,
        0.22
      ],
      "color": 8626140,
      "explode": [
        -0.9,
        1.4,
        0.5
      ],
      "opacity": 1,
      "description": "Remote communications placeholder; no real command link."
    },
    {
      "id": "landing-skids",
      "label": "Landing skids",
      "layer": "landing-gear",
      "shape": "box",
      "position": [
        0,
        0.76,
        0
      ],
      "size": [
        1.1,
        0.1,
        0.62
      ],
      "color": 4019564,
      "explode": [
        0,
        -1.3,
        0
      ],
      "opacity": 1,
      "description": "Simplified ground support skids."
    }
  ]
},
 "humanoid-robot":{
  "title": "HUMANOID ROBOT",
  "subtitle": "Rigged humanoid study: sensors, compute, power, joints and end effectors",
  "parts": [
    {
      "id": "head-shell",
      "label": "Head casing",
      "layer": "shell",
      "shape": "sphere",
      "position": [
        0,
        2.32,
        0
      ],
      "size": [
        0.44,
        0.44,
        0.4
      ],
      "color": 12505820,
      "explode": [
        0,
        1.1,
        0
      ],
      "opacity": 1,
      "description": "Protective housing, not a physical human skull."
    },
    {
      "id": "vision",
      "label": "Vision sensors",
      "layer": "sensors",
      "shape": "box",
      "position": [
        0,
        2.34,
        0.32
      ],
      "size": [
        0.4,
        0.12,
        0.09
      ],
      "color": 3847119,
      "explode": [
        0,
        1.3,
        1.3
      ],
      "opacity": 1,
      "description": "Camera/depth sensor placeholder; no recording."
    },
    {
      "id": "torso-shell",
      "label": "Torso casing",
      "layer": "shell",
      "shape": "box",
      "position": [
        0,
        1.47,
        0
      ],
      "size": [
        0.86,
        0.95,
        0.51
      ],
      "color": 9418183,
      "explode": [
        0,
        1.5,
        0
      ],
      "opacity": 1,
      "description": "Illustrative torso casing protecting power, control and sensor modules."
    },
    {
      "id": "compute",
      "label": "Main computer",
      "layer": "compute",
      "shape": "box",
      "position": [
        0,
        1.71,
        0.1
      ],
      "size": [
        0.43,
        0.29,
        0.26
      ],
      "color": 4968885,
      "explode": [
        0,
        0.9,
        1.5
      ],
      "opacity": 1,
      "description": "Conceptual CPU/GPU compute; no autonomous execution."
    },
    {
      "id": "energy-pack",
      "label": "Battery pack",
      "layer": "power",
      "shape": "box",
      "position": [
        0,
        1.22,
        -0.18
      ],
      "size": [
        0.42,
        0.42,
        0.3
      ],
      "color": 14137707,
      "explode": [
        0,
        -0.8,
        -1.3
      ],
      "opacity": 1,
      "description": "Conceptual rechargeable pack, no thermal/charging model."
    },
    {
      "id": "torso-imu",
      "label": "IMU sensor",
      "layer": "sensors",
      "shape": "sphere",
      "position": [
        0,
        1.89,
        0.24
      ],
      "size": [
        0.17,
        0.18,
        0.17
      ],
      "color": 7132650,
      "explode": [
        0,
        1.4,
        1.1
      ],
      "opacity": 1,
      "description": "Balance sensor illustration only."
    },
    {
      "id": "left-shoulder",
      "label": "Left shoulder joint",
      "layer": "actuation",
      "shape": "sphere",
      "position": [
        -0.59,
        1.88,
        0
      ],
      "size": [
        0.26,
        0.26,
        0.26
      ],
      "color": 11715532,
      "explode": [
        -1.1,
        1.1,
        0
      ],
      "opacity": 1,
      "description": "Rotational joint schematic."
    },
    {
      "id": "right-shoulder",
      "label": "Right shoulder joint",
      "layer": "actuation",
      "shape": "sphere",
      "position": [
        0.59,
        1.88,
        0
      ],
      "size": [
        0.26,
        0.26,
        0.26
      ],
      "color": 11715532,
      "explode": [
        1.1,
        1.1,
        0
      ],
      "opacity": 1,
      "description": "Rotational joint schematic."
    },
    {
      "id": "left-arm",
      "label": "Left arm actuator",
      "layer": "actuation",
      "shape": "capsule",
      "position": [
        -0.69,
        1.43,
        0
      ],
      "size": [
        0.23,
        0.8,
        0.24
      ],
      "color": 10663110,
      "explode": [
        -1.2,
        0.3,
        0
      ],
      "opacity": 1,
      "description": "Simplified upper-limb motion assembly."
    },
    {
      "id": "right-arm",
      "label": "Right arm actuator",
      "layer": "actuation",
      "shape": "capsule",
      "position": [
        0.69,
        1.43,
        0
      ],
      "size": [
        0.23,
        0.8,
        0.24
      ],
      "color": 10663110,
      "explode": [
        1.2,
        0.3,
        0
      ],
      "opacity": 1,
      "description": "Simplified upper-limb motion assembly."
    },
    {
      "id": "left-gripper",
      "label": "Left hand gripper",
      "layer": "payload",
      "shape": "box",
      "position": [
        -0.7,
        0.96,
        0
      ],
      "size": [
        0.2,
        0.22,
        0.24
      ],
      "color": 6856118,
      "explode": [
        -1.5,
        -0.3,
        0
      ],
      "opacity": 1,
      "description": "Generic end-effector, not a force-rated gripper."
    },
    {
      "id": "right-gripper",
      "label": "Right hand gripper",
      "layer": "payload",
      "shape": "box",
      "position": [
        0.7,
        0.96,
        0
      ],
      "size": [
        0.2,
        0.22,
        0.24
      ],
      "color": 6856118,
      "explode": [
        1.5,
        -0.3,
        0
      ],
      "opacity": 1,
      "description": "Generic end-effector, not a force-rated gripper."
    },
    {
      "id": "pelvis",
      "label": "Pelvis joint frame",
      "layer": "structure",
      "shape": "box",
      "position": [
        0,
        0.92,
        0
      ],
      "size": [
        0.78,
        0.35,
        0.46
      ],
      "color": 9151415,
      "explode": [
        0,
        -0.7,
        0
      ],
      "opacity": 1,
      "description": "Base joint support geometry."
    },
    {
      "id": "left-leg",
      "label": "Left leg actuators",
      "layer": "actuation",
      "shape": "capsule",
      "position": [
        -0.25,
        0.46,
        0
      ],
      "size": [
        0.3,
        0.9,
        0.3
      ],
      "color": 10992839,
      "explode": [
        -0.6,
        -1.1,
        0
      ],
      "opacity": 1,
      "description": "Simplified leg motion assembly."
    },
    {
      "id": "right-leg",
      "label": "Right leg actuators",
      "layer": "actuation",
      "shape": "capsule",
      "position": [
        0.25,
        0.46,
        0
      ],
      "size": [
        0.3,
        0.9,
        0.3
      ],
      "color": 10992839,
      "explode": [
        0.6,
        -1.1,
        0
      ],
      "opacity": 1,
      "description": "Simplified leg motion assembly."
    },
    {
      "id": "network",
      "label": "Local interface and safe-stop channel",
      "layer": "comms",
      "shape": "box",
      "position": [
        0,
        1.45,
        -0.32
      ],
      "size": [
        0.33,
        0.23,
        0.17
      ],
      "color": 14982517,
      "explode": [
        0,
        0.6,
        -1.4
      ],
      "opacity": 1,
      "description": "Conceptual local comms and safe-stop; not a certified functional safety device."
    }
  ]
},
 "robot-dog":{
  "title": "QUADRUPED ROBOT",
  "subtitle": "Robotic dog: leg actuation, onboard compute, energy and sensors",
  "parts": [
    {
      "id": "body",
      "label": "Quadruped chassis",
      "layer": "structure",
      "shape": "box",
      "position": [
        0,
        1.28,
        0
      ],
      "size": [
        1.52,
        0.56,
        0.76
      ],
      "color": 10337996,
      "explode": [
        0,
        1.2,
        0
      ],
      "opacity": 1,
      "description": "Robotic quadruped chassis, not a tested mechanical design."
    },
    {
      "id": "head",
      "label": "Sensor head",
      "layer": "shell",
      "shape": "box",
      "position": [
        0.98,
        1.41,
        0
      ],
      "size": [
        0.48,
        0.38,
        0.43
      ],
      "color": 11324888,
      "explode": [
        1.3,
        0.9,
        0
      ],
      "opacity": 1,
      "description": "Illustrative robotic dog head."
    },
    {
      "id": "camera",
      "label": "Forward imaging sensors",
      "layer": "sensors",
      "shape": "box",
      "position": [
        1.24,
        1.44,
        0
      ],
      "size": [
        0.12,
        0.2,
        0.31
      ],
      "color": 5427937,
      "explode": [
        1.8,
        0.8,
        0
      ],
      "opacity": 1,
      "description": "Camera/depth placeholder; not recording."
    },
    {
      "id": "lidar",
      "label": "Scanning range sensor",
      "layer": "sensors",
      "shape": "cylinder",
      "position": [
        0.03,
        1.75,
        0
      ],
      "size": [
        0.32,
        0.19,
        0.31
      ],
      "color": 5090017,
      "explode": [
        0,
        1.6,
        0
      ],
      "opacity": 1,
      "description": "Range sensing concept, no real scans."
    },
    {
      "id": "computer",
      "label": "Controller processor",
      "layer": "compute",
      "shape": "box",
      "position": [
        0,
        1.31,
        0
      ],
      "size": [
        0.5,
        0.25,
        0.35
      ],
      "color": 4374707,
      "explode": [
        0,
        1,
        1.3
      ],
      "opacity": 1,
      "description": "Compute block, no trained autonomy or live control."
    },
    {
      "id": "battery",
      "label": "Energy storage module",
      "layer": "power",
      "shape": "box",
      "position": [
        -0.37,
        1.12,
        0
      ],
      "size": [
        0.53,
        0.23,
        0.44
      ],
      "color": 14336107,
      "explode": [
        -0.7,
        -0.8,
        0
      ],
      "opacity": 1,
      "description": "Battery enclosure schematic."
    },
    {
      "id": "front-left-leg",
      "label": "Front port leg",
      "layer": "actuation",
      "shape": "capsule",
      "position": [
        0.52,
        0.69,
        -0.36
      ],
      "size": [
        0.22,
        1.02,
        0.2
      ],
      "color": 8428467,
      "explode": [
        1.2,
        -1,
        -1
      ],
      "opacity": 1,
      "description": "Simplified jointed leg system."
    },
    {
      "id": "front-right-leg",
      "label": "Front starboard leg",
      "layer": "actuation",
      "shape": "capsule",
      "position": [
        0.52,
        0.69,
        0.36
      ],
      "size": [
        0.22,
        1.02,
        0.2
      ],
      "color": 8428467,
      "explode": [
        1.2,
        -1,
        1
      ],
      "opacity": 1,
      "description": "Simplified jointed leg system."
    },
    {
      "id": "rear-left-leg",
      "label": "Rear port leg",
      "layer": "actuation",
      "shape": "capsule",
      "position": [
        -0.54,
        0.69,
        -0.36
      ],
      "size": [
        0.22,
        1.02,
        0.2
      ],
      "color": 8428467,
      "explode": [
        -1.2,
        -1,
        -1
      ],
      "opacity": 1,
      "description": "Simplified jointed leg system."
    },
    {
      "id": "rear-right-leg",
      "label": "Rear starboard leg",
      "layer": "actuation",
      "shape": "capsule",
      "position": [
        -0.54,
        0.69,
        0.36
      ],
      "size": [
        0.22,
        1.02,
        0.2
      ],
      "color": 8428467,
      "explode": [
        -1.2,
        -1,
        1
      ],
      "opacity": 1,
      "description": "Simplified jointed leg system."
    },
    {
      "id": "hip-drive",
      "label": "Hip actuation group",
      "layer": "actuation",
      "shape": "box",
      "position": [
        -0.16,
        1.04,
        0
      ],
      "size": [
        0.54,
        0.25,
        0.45
      ],
      "color": 8369348,
      "explode": [
        -0.4,
        0.7,
        1.4
      ],
      "opacity": 1,
      "description": "Conceptual actuator support structure."
    },
    {
      "id": "radio",
      "label": "Network communications",
      "layer": "comms",
      "shape": "box",
      "position": [
        -0.68,
        1.5,
        0
      ],
      "size": [
        0.27,
        0.2,
        0.24
      ],
      "color": 8755153,
      "explode": [
        -1.2,
        1.2,
        0
      ],
      "opacity": 1,
      "description": "Wireless link graphic; no transmission."
    },
    {
      "id": "safe-stop",
      "label": "Illustrative safety switch",
      "layer": "controls",
      "shape": "box",
      "position": [
        0.43,
        1.53,
        0
      ],
      "size": [
        0.18,
        0.15,
        0.18
      ],
      "color": 15762819,
      "explode": [
        1.2,
        1.4,
        0
      ],
      "opacity": 1,
      "description": "Safety stop is visual only. Do not rely on it to operate a physical robot."
    }
  ]
},
 "rover":{
  "title": "PLANETARY ROVER",
  "subtitle": "Six-wheel exploration rover and surface science systems",
  "parts": [
    {
      "id": "rover-base",
      "label": "Rover chassis",
      "layer": "structure",
      "shape": "box",
      "position": [
        0,
        1.22,
        0
      ],
      "size": [
        1.85,
        0.47,
        1.12
      ],
      "color": 10401472,
      "explode": [
        0,
        1.3,
        0
      ],
      "opacity": 1,
      "description": "Conceptual planetary rover body, not space-qualified hardware."
    },
    {
      "id": "wheel-fl",
      "label": "Front left wheel",
      "layer": "mobility",
      "shape": "cylinder",
      "position": [
        0.82,
        0.55,
        -0.79
      ],
      "size": [
        0.63,
        0.3,
        0.63
      ],
      "color": 3949391,
      "explode": [
        1.3,
        -0.9,
        -1.4
      ],
      "opacity": 1,
      "description": "Wheel and traction schematic; no soil mechanics."
    },
    {
      "id": "wheel-fr",
      "label": "Front right wheel",
      "layer": "mobility",
      "shape": "cylinder",
      "position": [
        0.82,
        0.55,
        0.79
      ],
      "size": [
        0.63,
        0.3,
        0.63
      ],
      "color": 3949391,
      "explode": [
        1.3,
        -0.9,
        1.4
      ],
      "opacity": 1,
      "description": "Wheel and traction schematic."
    },
    {
      "id": "wheel-ml",
      "label": "Middle left wheel",
      "layer": "mobility",
      "shape": "cylinder",
      "position": [
        0,
        0.48,
        -0.8
      ],
      "size": [
        0.63,
        0.3,
        0.63
      ],
      "color": 3949391,
      "explode": [
        0,
        -1.1,
        -1.4
      ],
      "opacity": 1,
      "description": "Wheel and traction schematic."
    },
    {
      "id": "wheel-mr",
      "label": "Middle right wheel",
      "layer": "mobility",
      "shape": "cylinder",
      "position": [
        0,
        0.48,
        0.8
      ],
      "size": [
        0.63,
        0.3,
        0.63
      ],
      "color": 3949391,
      "explode": [
        0,
        -1.1,
        1.4
      ],
      "opacity": 1,
      "description": "Wheel and traction schematic."
    },
    {
      "id": "wheel-rl",
      "label": "Rear left wheel",
      "layer": "mobility",
      "shape": "cylinder",
      "position": [
        -0.82,
        0.55,
        -0.79
      ],
      "size": [
        0.63,
        0.3,
        0.63
      ],
      "color": 3949391,
      "explode": [
        -1.3,
        -0.9,
        -1.4
      ],
      "opacity": 1,
      "description": "Wheel and traction schematic."
    },
    {
      "id": "wheel-rr",
      "label": "Rear right wheel",
      "layer": "mobility",
      "shape": "cylinder",
      "position": [
        -0.82,
        0.55,
        0.79
      ],
      "size": [
        0.63,
        0.3,
        0.63
      ],
      "color": 3949391,
      "explode": [
        -1.3,
        -0.9,
        1.4
      ],
      "opacity": 1,
      "description": "Wheel and traction schematic."
    },
    {
      "id": "rocker-left",
      "label": "Left mobility linkage",
      "layer": "actuation",
      "shape": "box",
      "position": [
        0,
        0.86,
        -0.67
      ],
      "size": [
        1.82,
        0.14,
        0.17
      ],
      "color": 7969450,
      "explode": [
        0,
        -0.8,
        -1
      ],
      "opacity": 1,
      "description": "Rocker/bogie linkage illustration, no articulated suspension."
    },
    {
      "id": "rocker-right",
      "label": "Right mobility linkage",
      "layer": "actuation",
      "shape": "box",
      "position": [
        0,
        0.86,
        0.67
      ],
      "size": [
        1.82,
        0.14,
        0.17
      ],
      "color": 7969450,
      "explode": [
        0,
        -0.8,
        1
      ],
      "opacity": 1,
      "description": "Rocker/bogie linkage illustration."
    },
    {
      "id": "mast",
      "label": "Sensor mast",
      "layer": "structure",
      "shape": "cylinder",
      "position": [
        0.28,
        1.95,
        0
      ],
      "size": [
        0.16,
        1.12,
        0.16
      ],
      "color": 12438484,
      "explode": [
        0.6,
        1.4,
        0
      ],
      "opacity": 1,
      "description": "Illustrative sensor mast."
    },
    {
      "id": "stereo-cameras",
      "label": "Navigation cameras",
      "layer": "sensors",
      "shape": "box",
      "position": [
        0.32,
        2.54,
        0
      ],
      "size": [
        0.47,
        0.23,
        0.48
      ],
      "color": 4172479,
      "explode": [
        0.6,
        1.8,
        0
      ],
      "opacity": 1,
      "description": "Stereo navigation cameras; no real images."
    },
    {
      "id": "sample-arm",
      "label": "Science sample arm",
      "layer": "payload",
      "shape": "capsule",
      "position": [
        0.88,
        1.33,
        0.62
      ],
      "size": [
        0.22,
        0.77,
        0.21
      ],
      "color": 11781325,
      "explode": [
        1.1,
        1.2,
        1.4
      ],
      "opacity": 1,
      "description": "Science arm graphic, not a sampling mechanism."
    },
    {
      "id": "solar-array",
      "label": "Solar energy array",
      "layer": "power",
      "shape": "box",
      "position": [
        -0.32,
        1.57,
        0
      ],
      "size": [
        0.98,
        0.08,
        0.88
      ],
      "color": 3107261,
      "explode": [
        -0.7,
        1.5,
        0
      ],
      "opacity": 1,
      "description": "Solar energy study panel."
    },
    {
      "id": "battery",
      "label": "Rover battery",
      "layer": "power",
      "shape": "box",
      "position": [
        -0.29,
        1.12,
        0
      ],
      "size": [
        0.48,
        0.3,
        0.39
      ],
      "color": 14005357,
      "explode": [
        -0.8,
        -0.5,
        1.2
      ],
      "opacity": 1,
      "description": "Illustrative energy storage."
    },
    {
      "id": "computer",
      "label": "Navigation computer",
      "layer": "compute",
      "shape": "box",
      "position": [
        0.21,
        1.1,
        0
      ],
      "size": [
        0.37,
        0.27,
        0.35
      ],
      "color": 5819313,
      "explode": [
        0.3,
        -0.5,
        -1
      ],
      "opacity": 1,
      "description": "Navigation compute, no onboard autonomy code."
    },
    {
      "id": "radio",
      "label": "Communications antenna",
      "layer": "comms",
      "shape": "cylinder",
      "position": [
        -0.64,
        2.13,
        0
      ],
      "size": [
        0.4,
        0.55,
        0.39
      ],
      "color": 13358045,
      "explode": [
        -0.9,
        1.6,
        0
      ],
      "opacity": 1,
      "description": "Communication link illustration; no signal sent."
    }
  ]
},
 "exoskeleton":{
  "title": "MOBILITY EXOSKELETON",
  "subtitle": "Wearable assistive-mechanics concept: sensing, fit, actuation and safe-stop",
  "parts": [
    {
      "id": "torso-harness",
      "label": "Torso support harness",
      "layer": "structure",
      "shape": "box",
      "position": [
        0,
        1.72,
        0
      ],
      "size": [
        0.85,
        0.83,
        0.48
      ],
      "color": 7253170,
      "explode": [
        0,
        1.4,
        0
      ],
      "opacity": 1,
      "description": "Illustrative harness shape. Not a fitted medical mobility device."
    },
    {
      "id": "spine-support",
      "label": "Posterior support frame",
      "layer": "structure",
      "shape": "box",
      "position": [
        0,
        1.55,
        -0.35
      ],
      "size": [
        0.22,
        1.17,
        0.12
      ],
      "color": 10532550,
      "explode": [
        0,
        1.2,
        -1.2
      ],
      "opacity": 1,
      "description": "Mechanical support concept without load validation."
    },
    {
      "id": "left-hip",
      "label": "Left hip joint",
      "layer": "actuation",
      "shape": "sphere",
      "position": [
        -0.38,
        1.03,
        0
      ],
      "size": [
        0.28,
        0.28,
        0.26
      ],
      "color": 8625838,
      "explode": [
        -1.2,
        0.3,
        0
      ],
      "opacity": 1,
      "description": "Joint representation; no actuator torque rating."
    },
    {
      "id": "right-hip",
      "label": "Right hip joint",
      "layer": "actuation",
      "shape": "sphere",
      "position": [
        0.38,
        1.03,
        0
      ],
      "size": [
        0.28,
        0.28,
        0.26
      ],
      "color": 8625838,
      "explode": [
        1.2,
        0.3,
        0
      ],
      "opacity": 1,
      "description": "Joint representation; no actuator torque rating."
    },
    {
      "id": "left-leg-rail",
      "label": "Left leg rail",
      "layer": "structure",
      "shape": "capsule",
      "position": [
        -0.38,
        0.51,
        -0.14
      ],
      "size": [
        0.19,
        0.96,
        0.2
      ],
      "color": 11125196,
      "explode": [
        -0.8,
        -1.1,
        -0.8
      ],
      "opacity": 1,
      "description": "Illustrative wearable rail."
    },
    {
      "id": "right-leg-rail",
      "label": "Right leg rail",
      "layer": "structure",
      "shape": "capsule",
      "position": [
        0.38,
        0.51,
        -0.14
      ],
      "size": [
        0.19,
        0.96,
        0.2
      ],
      "color": 11125196,
      "explode": [
        0.8,
        -1.1,
        -0.8
      ],
      "opacity": 1,
      "description": "Illustrative wearable rail."
    },
    {
      "id": "left-knee",
      "label": "Left knee actuator",
      "layer": "actuation",
      "shape": "sphere",
      "position": [
        -0.4,
        0.59,
        -0.06
      ],
      "size": [
        0.23,
        0.23,
        0.23
      ],
      "color": 6003125,
      "explode": [
        -1.1,
        -0.8,
        0
      ],
      "opacity": 1,
      "description": "Knee motor schematic; no wearable assistance provided."
    },
    {
      "id": "right-knee",
      "label": "Right knee actuator",
      "layer": "actuation",
      "shape": "sphere",
      "position": [
        0.4,
        0.59,
        -0.06
      ],
      "size": [
        0.23,
        0.23,
        0.23
      ],
      "color": 6003125,
      "explode": [
        1.1,
        -0.8,
        0
      ],
      "opacity": 1,
      "description": "Knee motor schematic; no wearable assistance provided."
    },
    {
      "id": "motor-controller",
      "label": "Assistance controller",
      "layer": "controls",
      "shape": "box",
      "position": [
        0,
        1.55,
        0.28
      ],
      "size": [
        0.41,
        0.33,
        0.22
      ],
      "color": 4505525,
      "explode": [
        0,
        1.2,
        1.2
      ],
      "opacity": 1,
      "description": "Conceptual closed-loop controller; not connected to a person."
    },
    {
      "id": "gait-sensor",
      "label": "Gait sensor placeholder",
      "layer": "sensors",
      "shape": "box",
      "position": [
        -0.4,
        0.37,
        0.16
      ],
      "size": [
        0.22,
        0.15,
        0.14
      ],
      "color": 5748706,
      "explode": [
        -1.1,
        -1,
        1
      ],
      "opacity": 1,
      "description": "Noncalibrated motion-sensing placeholder."
    },
    {
      "id": "battery",
      "label": "Wearable energy storage",
      "layer": "power",
      "shape": "box",
      "position": [
        0,
        1.09,
        -0.32
      ],
      "size": [
        0.49,
        0.31,
        0.27
      ],
      "color": 14795115,
      "explode": [
        0,
        -0.8,
        -1.2
      ],
      "opacity": 1,
      "description": "Energy pack schematic; no charging or thermal safeguards."
    },
    {
      "id": "safe-stop",
      "label": "Safety cut-off concept",
      "layer": "controls",
      "shape": "box",
      "position": [
        0.47,
        1.84,
        0.06
      ],
      "size": [
        0.2,
        0.19,
        0.22
      ],
      "color": 15761532,
      "explode": [
        1.4,
        1.6,
        0
      ],
      "opacity": 1,
      "description": "Visual design concept only; not functional medical device safety control."
    },
    {
      "id": "fit-adjustment",
      "label": "Adjustable fitting brackets",
      "layer": "structure",
      "shape": "box",
      "position": [
        0,
        1.14,
        0
      ],
      "size": [
        0.76,
        0.18,
        0.49
      ],
      "color": 8367542,
      "explode": [
        0,
        -1,
        0
      ],
      "opacity": 1,
      "description": "No patient-specific dimensions, prescriptions or measured fit."
    }
  ]
},
 "robotic-arm":{
  "title": "INDUSTRIAL ROBOT ARM",
  "subtitle": "Factory robot: base, articulated joints, actuator modules and tool head",
  "parts": [
    {
      "id": "mounting-base",
      "label": "Mounting pedestal",
      "layer": "structure",
      "shape": "cylinder",
      "position": [
        0,
        0.4,
        0
      ],
      "size": [
        0.96,
        0.71,
        0.96
      ],
      "color": 7309213,
      "explode": [
        0,
        -1.2,
        0
      ],
      "opacity": 1,
      "description": "Schematic robot base; no load anchoring or structural certification."
    },
    {
      "id": "yaw-joint",
      "label": "Base rotation joint",
      "layer": "actuation",
      "shape": "cylinder",
      "position": [
        0,
        0.9,
        0
      ],
      "size": [
        0.66,
        0.27,
        0.66
      ],
      "color": 9744318,
      "explode": [
        0,
        -0.4,
        1.3
      ],
      "opacity": 1,
      "description": "Conceptual rotation axis without torque/speed calibration."
    },
    {
      "id": "upper-link",
      "label": "Upper arm segment",
      "layer": "structure",
      "shape": "capsule",
      "position": [
        0,
        1.44,
        0
      ],
      "size": [
        0.37,
        1.06,
        0.35
      ],
      "color": 12767451,
      "explode": [
        0,
        1.1,
        0
      ],
      "opacity": 1,
      "description": "Articulated arm link, not a physical manipulator drawing."
    },
    {
      "id": "shoulder-motor",
      "label": "Shoulder drive",
      "layer": "actuation",
      "shape": "sphere",
      "position": [
        0,
        1.17,
        0.03
      ],
      "size": [
        0.4,
        0.42,
        0.4
      ],
      "color": 4689065,
      "explode": [
        -0.9,
        0.6,
        1.2
      ],
      "opacity": 1,
      "description": "Motorized joint schematic."
    },
    {
      "id": "elbow-joint",
      "label": "Elbow drive",
      "layer": "actuation",
      "shape": "sphere",
      "position": [
        0,
        1.99,
        0.03
      ],
      "size": [
        0.33,
        0.34,
        0.32
      ],
      "color": 4689065,
      "explode": [
        0.9,
        1.4,
        0
      ],
      "opacity": 1,
      "description": "Elbow actuator placeholder."
    },
    {
      "id": "forearm",
      "label": "Forearm segment",
      "layer": "structure",
      "shape": "capsule",
      "position": [
        0.44,
        2.26,
        0.05
      ],
      "size": [
        0.35,
        0.92,
        0.32
      ],
      "color": 11650001,
      "explode": [
        1.1,
        1.5,
        0
      ],
      "opacity": 1,
      "description": "Simplified forearm link."
    },
    {
      "id": "wrist-joint",
      "label": "Wrist articulation",
      "layer": "actuation",
      "shape": "sphere",
      "position": [
        0.88,
        2.49,
        0.05
      ],
      "size": [
        0.29,
        0.31,
        0.28
      ],
      "color": 5876936,
      "explode": [
        1.5,
        1.4,
        0
      ],
      "opacity": 1,
      "description": "Generic rotating wrist joint."
    },
    {
      "id": "gripper",
      "label": "End effector",
      "layer": "payload",
      "shape": "box",
      "position": [
        1.14,
        2.51,
        0.05
      ],
      "size": [
        0.43,
        0.29,
        0.34
      ],
      "color": 6279364,
      "explode": [
        1.9,
        1.6,
        0
      ],
      "opacity": 1,
      "description": "Symbolic robotic gripper; no contact/force physics."
    },
    {
      "id": "torque-sensor",
      "label": "Joint feedback sensor",
      "layer": "sensors",
      "shape": "sphere",
      "position": [
        -0.2,
        1.17,
        0
      ],
      "size": [
        0.16,
        0.17,
        0.17
      ],
      "color": 9558254,
      "explode": [
        -1.2,
        0.6,
        0
      ],
      "opacity": 1,
      "description": "Feedback sensor mockup; no actual torque readings."
    },
    {
      "id": "vision-camera",
      "label": "Inspection camera",
      "layer": "sensors",
      "shape": "box",
      "position": [
        0.97,
        2.72,
        0.05
      ],
      "size": [
        0.31,
        0.24,
        0.25
      ],
      "color": 5932495,
      "explode": [
        1.5,
        1.7,
        0
      ],
      "opacity": 1,
      "description": "Vision subsystem placeholder, no surveillance or recording."
    },
    {
      "id": "controller",
      "label": "Robot controller",
      "layer": "controls",
      "shape": "box",
      "position": [
        -0.97,
        0.78,
        0
      ],
      "size": [
        0.65,
        0.64,
        0.62
      ],
      "color": 4173735,
      "explode": [
        -1.6,
        -0.7,
        0
      ],
      "opacity": 1,
      "description": "Controller enclosure. No motion planner or PLC connection."
    },
    {
      "id": "power",
      "label": "Electrical supply",
      "layer": "power",
      "shape": "box",
      "position": [
        -1,
        0.37,
        0
      ],
      "size": [
        0.46,
        0.31,
        0.45
      ],
      "color": 14725994,
      "explode": [
        -1.7,
        -1.1,
        0
      ],
      "opacity": 1,
      "description": "Power block, no grid wiring or electrical safety certification."
    },
    {
      "id": "stop",
      "label": "Emergency stop concept",
      "layer": "controls",
      "shape": "sphere",
      "position": [
        -1.12,
        1.19,
        0.1
      ],
      "size": [
        0.18,
        0.17,
        0.18
      ],
      "color": 15752284,
      "explode": [
        -1.7,
        0.3,
        0.6
      ],
      "opacity": 1,
      "description": "Visual safety indicator; no actual safety-rated stop."
    }
  ]
},
}


export const HOLOCAD_AEROSPACE_SUBJECTS=['aircraft','spacecraft','satellite','drone'] as const
export const HOLOCAD_ROBOTICS_SUBJECTS=['humanoid-robot','robot-dog','rover','exoskeleton','robotic-arm'] as const
export const HOLOCAD_AEROSPACE_ROBOTICS_TOTAL_PARTS=
 HOLOCAD_AEROSPACE_ROBOTICS_KEYS.reduce((count,key)=>count+HOLOCAD_AEROSPACE_ROBOTICS_PRESETS[key].parts.length,0)
