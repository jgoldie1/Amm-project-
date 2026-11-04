/** Original educational schematic HoloCAD presets. Not clinical, veterinary, vehicle-OEM, or architectural CAD. */
export type HoloCADSubject='human'|'canine'|'automobile'|'building'
export type HoloCADLayer='shell'|'muscle'|'skeleton'|'organs'|'circulation'|'structure'|'mechanical'|'electrical'|'interior'|'plumbing'|'hvac'
export type HoloCADShape='sphere'|'box'|'cylinder'|'capsule'
export type HoloCADPart={id:string;label:string;layer:HoloCADLayer;shape:HoloCADShape;position:[number,number,number];size:[number,number,number];explode:[number,number,number];color:number;opacity:number;description:string}
export type HoloCADPreset={title:string;subtitle:string;parts:readonly HoloCADPart[]}
export const HOLOCAD_LIVING_PRESETS:Record<HoloCADSubject,HoloCADPreset>={
  "human": {
    "title": "HUMAN BODY",
    "subtitle": "Layered illustrative anatomy and rigging",
    "parts": [
      {
        "id": "skin-head",
        "label": "Head envelope",
        "layer": "shell",
        "shape": "sphere",
        "position": [
          0,
          2.5,
          0
        ],
        "size": [
          0.48,
          0.53,
          0.4
        ],
        "color": 12421225,
        "explode": [
          0,
          1.1,
          0
        ],
        "opacity": 0.3,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "skin-torso",
        "label": "External torso",
        "layer": "shell",
        "shape": "sphere",
        "position": [
          0,
          1.55,
          0
        ],
        "size": [
          0.88,
          1,
          0.5
        ],
        "color": 12158309,
        "explode": [
          0,
          0,
          1.1
        ],
        "opacity": 0.2,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "skin-left-arm",
        "label": "Left arm surface",
        "layer": "shell",
        "shape": "capsule",
        "position": [
          -0.66,
          1.48,
          0
        ],
        "size": [
          0.25,
          1.08,
          0.27
        ],
        "color": 12158309,
        "explode": [
          -1.2,
          0.1,
          0
        ],
        "opacity": 0.25,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "skin-right-arm",
        "label": "Right arm surface",
        "layer": "shell",
        "shape": "capsule",
        "position": [
          0.66,
          1.48,
          0
        ],
        "size": [
          0.25,
          1.08,
          0.27
        ],
        "color": 12158309,
        "explode": [
          1.2,
          0.1,
          0
        ],
        "opacity": 0.25,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "skin-left-leg",
        "label": "Left leg surface",
        "layer": "shell",
        "shape": "capsule",
        "position": [
          -0.24,
          0.57,
          0
        ],
        "size": [
          0.35,
          1.12,
          0.35
        ],
        "color": 12158309,
        "explode": [
          -0.7,
          -0.8,
          0
        ],
        "opacity": 0.25,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "skin-right-leg",
        "label": "Right leg surface",
        "layer": "shell",
        "shape": "capsule",
        "position": [
          0.24,
          0.57,
          0
        ],
        "size": [
          0.35,
          1.12,
          0.35
        ],
        "color": 12158309,
        "explode": [
          0.7,
          -0.8,
          0
        ],
        "opacity": 0.25,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "skull",
        "label": "Skull",
        "layer": "skeleton",
        "shape": "sphere",
        "position": [
          0,
          2.5,
          0
        ],
        "size": [
          0.35,
          0.4,
          0.35
        ],
        "color": 15326136,
        "explode": [
          0,
          1.4,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "ribs",
        "label": "Rib cage",
        "layer": "skeleton",
        "shape": "sphere",
        "position": [
          0,
          1.8,
          0
        ],
        "size": [
          0.61,
          0.7,
          0.39
        ],
        "color": 15259822,
        "explode": [
          0,
          0.25,
          -1.3
        ],
        "opacity": 0.44,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "spine",
        "label": "Spinal column",
        "layer": "skeleton",
        "shape": "cylinder",
        "position": [
          0,
          1.48,
          -0.18
        ],
        "size": [
          0.12,
          1.35,
          0.12
        ],
        "color": 15193773,
        "explode": [
          0,
          -0.4,
          -1.2
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "pelvis",
        "label": "Pelvic bones",
        "layer": "skeleton",
        "shape": "sphere",
        "position": [
          0,
          0.95,
          0
        ],
        "size": [
          0.54,
          0.3,
          0.32
        ],
        "color": 15391667,
        "explode": [
          0,
          -0.6,
          -1.3
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "left-femur",
        "label": "Left femur",
        "layer": "skeleton",
        "shape": "cylinder",
        "position": [
          -0.24,
          0.46,
          0
        ],
        "size": [
          0.11,
          0.84,
          0.11
        ],
        "color": 15326400,
        "explode": [
          -0.7,
          -1,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "right-femur",
        "label": "Right femur",
        "layer": "skeleton",
        "shape": "cylinder",
        "position": [
          0.24,
          0.46,
          0
        ],
        "size": [
          0.11,
          0.84,
          0.11
        ],
        "color": 15326400,
        "explode": [
          0.7,
          -1,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "chest-muscle",
        "label": "Chest and shoulder muscle",
        "layer": "muscle",
        "shape": "sphere",
        "position": [
          0,
          1.9,
          0.08
        ],
        "size": [
          0.68,
          0.45,
          0.38
        ],
        "color": 11878475,
        "explode": [
          0,
          0.4,
          1.4
        ],
        "opacity": 0.72,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "abdominal-wall",
        "label": "Abdominal muscle layer",
        "layer": "muscle",
        "shape": "sphere",
        "position": [
          0,
          1.4,
          0.14
        ],
        "size": [
          0.55,
          0.48,
          0.3
        ],
        "color": 11025481,
        "explode": [
          0,
          -0.4,
          1.4
        ],
        "opacity": 0.7,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "heart",
        "label": "Heart",
        "layer": "organs",
        "shape": "sphere",
        "position": [
          -0.13,
          1.83,
          0.19
        ],
        "size": [
          0.19,
          0.26,
          0.2
        ],
        "color": 14565984,
        "explode": [
          -1,
          0.85,
          1.7
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "left-lung",
        "label": "Left lung",
        "layer": "organs",
        "shape": "sphere",
        "position": [
          -0.3,
          1.86,
          0.06
        ],
        "size": [
          0.3,
          0.51,
          0.26
        ],
        "color": 15115429,
        "explode": [
          -1.1,
          0.6,
          1.45
        ],
        "opacity": 0.82,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "right-lung",
        "label": "Right lung",
        "layer": "organs",
        "shape": "sphere",
        "position": [
          0.3,
          1.86,
          0.06
        ],
        "size": [
          0.33,
          0.51,
          0.26
        ],
        "color": 15115429,
        "explode": [
          1.1,
          0.6,
          1.45
        ],
        "opacity": 0.82,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "liver",
        "label": "Liver",
        "layer": "organs",
        "shape": "sphere",
        "position": [
          0.22,
          1.29,
          0.15
        ],
        "size": [
          0.43,
          0.26,
          0.28
        ],
        "color": 9194549,
        "explode": [
          1.25,
          -0.15,
          1.5
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "stomach",
        "label": "Stomach",
        "layer": "organs",
        "shape": "sphere",
        "position": [
          -0.18,
          1.25,
          0.18
        ],
        "size": [
          0.22,
          0.32,
          0.25
        ],
        "color": 15051655,
        "explode": [
          -1.2,
          -0.15,
          1.5
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "intestines",
        "label": "Intestines",
        "layer": "organs",
        "shape": "sphere",
        "position": [
          0,
          0.99,
          0.14
        ],
        "size": [
          0.45,
          0.26,
          0.29
        ],
        "color": 15517352,
        "explode": [
          0,
          -0.95,
          1.55
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "left-kidney",
        "label": "Left kidney",
        "layer": "organs",
        "shape": "sphere",
        "position": [
          -0.3,
          1.16,
          -0.16
        ],
        "size": [
          0.18,
          0.25,
          0.15
        ],
        "color": 10045528,
        "explode": [
          -1.1,
          -0.2,
          -1.2
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "right-kidney",
        "label": "Right kidney",
        "layer": "organs",
        "shape": "sphere",
        "position": [
          0.3,
          1.16,
          -0.16
        ],
        "size": [
          0.18,
          0.25,
          0.15
        ],
        "color": 10045528,
        "explode": [
          1.1,
          -0.2,
          -1.2
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "main-vessel",
        "label": "Vascular pathway",
        "layer": "circulation",
        "shape": "cylinder",
        "position": [
          0,
          1.48,
          0.3
        ],
        "size": [
          0.045,
          0.9,
          0.045
        ],
        "color": 15022931,
        "explode": [
          0,
          0.5,
          1.9
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "trachea",
        "label": "Airway",
        "layer": "circulation",
        "shape": "cylinder",
        "position": [
          0,
          2.19,
          0.11
        ],
        "size": [
          0.08,
          0.4,
          0.08
        ],
        "color": 3980776,
        "explode": [
          0,
          1.2,
          1.9
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      }
    ]
  },
  "canine": {
    "title": "ANIMAL / CANINE",
    "subtitle": "Quadruped skeleton and organs",
    "parts": [
      {
        "id": "dog-coat",
        "label": "Canine body envelope",
        "layer": "shell",
        "shape": "sphere",
        "position": [
          0,
          1.06,
          0
        ],
        "size": [
          1,
          0.46,
          0.43
        ],
        "color": 12031607,
        "explode": [
          0,
          0.5,
          0.7
        ],
        "opacity": 0.24,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-head",
        "label": "Canine head",
        "layer": "shell",
        "shape": "sphere",
        "position": [
          1.12,
          1.33,
          0
        ],
        "size": [
          0.42,
          0.39,
          0.38
        ],
        "color": 12031607,
        "explode": [
          1.2,
          1,
          0.2
        ],
        "opacity": 0.28,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-muzzle",
        "label": "Muzzle",
        "layer": "shell",
        "shape": "sphere",
        "position": [
          1.48,
          1.21,
          0
        ],
        "size": [
          0.34,
          0.2,
          0.24
        ],
        "color": 12228986,
        "explode": [
          1.5,
          0.6,
          0.3
        ],
        "opacity": 0.3,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-left-forelimb",
        "label": "Left forelimb envelope",
        "layer": "shell",
        "shape": "capsule",
        "position": [
          0.56,
          0.47,
          -0.3
        ],
        "size": [
          0.19,
          0.8,
          0.22
        ],
        "color": 12031607,
        "explode": [
          -1,
          -0.8,
          -0.7
        ],
        "opacity": 0.3,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-right-forelimb",
        "label": "Right forelimb envelope",
        "layer": "shell",
        "shape": "capsule",
        "position": [
          0.56,
          0.47,
          0.3
        ],
        "size": [
          0.19,
          0.8,
          0.22
        ],
        "color": 12031607,
        "explode": [
          1,
          -0.8,
          0.7
        ],
        "opacity": 0.3,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-left-hindlimb",
        "label": "Left hindlimb envelope",
        "layer": "shell",
        "shape": "capsule",
        "position": [
          -0.67,
          0.45,
          -0.29
        ],
        "size": [
          0.2,
          0.78,
          0.22
        ],
        "color": 12031607,
        "explode": [
          -1.5,
          -0.8,
          -0.6
        ],
        "opacity": 0.3,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-right-hindlimb",
        "label": "Right hindlimb envelope",
        "layer": "shell",
        "shape": "capsule",
        "position": [
          -0.67,
          0.45,
          0.29
        ],
        "size": [
          0.2,
          0.78,
          0.22
        ],
        "color": 12031607,
        "explode": [
          1.5,
          -0.8,
          0.6
        ],
        "opacity": 0.3,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-spine",
        "label": "Canine spinal column",
        "layer": "skeleton",
        "shape": "box",
        "position": [
          0,
          1.26,
          0
        ],
        "size": [
          1.7,
          0.1,
          0.12
        ],
        "color": 15195581,
        "explode": [
          0,
          1,
          -0.9
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-ribcage",
        "label": "Canine rib cage",
        "layer": "skeleton",
        "shape": "sphere",
        "position": [
          0.2,
          1.08,
          0
        ],
        "size": [
          0.67,
          0.34,
          0.37
        ],
        "color": 15326141,
        "explode": [
          0,
          0.7,
          -1.1
        ],
        "opacity": 0.48,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-skull",
        "label": "Canine skull",
        "layer": "skeleton",
        "shape": "sphere",
        "position": [
          1.14,
          1.3,
          0
        ],
        "size": [
          0.34,
          0.34,
          0.31
        ],
        "color": 15458503,
        "explode": [
          1.5,
          1.3,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-shoulder-muscle",
        "label": "Shoulder muscles",
        "layer": "muscle",
        "shape": "sphere",
        "position": [
          0.52,
          1.05,
          0
        ],
        "size": [
          0.36,
          0.36,
          0.4
        ],
        "color": 11158350,
        "explode": [
          0.9,
          0.5,
          1
        ],
        "opacity": 0.77,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-hip-muscle",
        "label": "Hindquarter muscles",
        "layer": "muscle",
        "shape": "sphere",
        "position": [
          -0.69,
          1.01,
          0
        ],
        "size": [
          0.32,
          0.35,
          0.42
        ],
        "color": 11224914,
        "explode": [
          -1,
          0.5,
          1
        ],
        "opacity": 0.77,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-heart",
        "label": "Canine heart",
        "layer": "organs",
        "shape": "sphere",
        "position": [
          0.42,
          1.04,
          0.14
        ],
        "size": [
          0.15,
          0.2,
          0.17
        ],
        "color": 14303324,
        "explode": [
          1.4,
          0.8,
          1.4
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-lungs",
        "label": "Canine lungs",
        "layer": "organs",
        "shape": "sphere",
        "position": [
          0.22,
          1.06,
          0
        ],
        "size": [
          0.45,
          0.23,
          0.29
        ],
        "color": 15179942,
        "explode": [
          0,
          0.7,
          -1.5
        ],
        "opacity": 0.85,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-liver",
        "label": "Canine liver",
        "layer": "organs",
        "shape": "sphere",
        "position": [
          -0.19,
          1.02,
          0.12
        ],
        "size": [
          0.3,
          0.24,
          0.25
        ],
        "color": 9130042,
        "explode": [
          0.5,
          0.5,
          1.3
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-stomach",
        "label": "Canine stomach",
        "layer": "organs",
        "shape": "sphere",
        "position": [
          -0.53,
          0.97,
          0.14
        ],
        "size": [
          0.24,
          0.21,
          0.2
        ],
        "color": 14594700,
        "explode": [
          -1,
          0.2,
          1.4
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-intestines",
        "label": "Canine intestines",
        "layer": "organs",
        "shape": "sphere",
        "position": [
          -0.66,
          0.83,
          0
        ],
        "size": [
          0.28,
          0.19,
          0.27
        ],
        "color": 15385507,
        "explode": [
          -1.2,
          -0.5,
          1.4
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "dog-vessel",
        "label": "Vascular teaching path",
        "layer": "circulation",
        "shape": "box",
        "position": [
          0,
          1.17,
          0.18
        ],
        "size": [
          1.4,
          0.055,
          0.055
        ],
        "color": 13580359,
        "explode": [
          0,
          1,
          1.8
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      }
    ]
  },
  "automobile": {
    "title": "VEHICLE TEARDOWN",
    "subtitle": "Structure, powertrain, electric systems, interior",
    "parts": [
      {
        "id": "body-shell",
        "label": "Exterior car body",
        "layer": "shell",
        "shape": "box",
        "position": [
          0,
          1.1,
          0
        ],
        "size": [
          3.8,
          0.8,
          1.75
        ],
        "color": 5410500,
        "explode": [
          0,
          2,
          0
        ],
        "opacity": 0.2,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "roof",
        "label": "Vehicle roof",
        "layer": "shell",
        "shape": "box",
        "position": [
          -0.22,
          1.72,
          0
        ],
        "size": [
          2,
          0.33,
          1.5
        ],
        "color": 8041946,
        "explode": [
          0,
          2.1,
          0
        ],
        "opacity": 0.44,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "hood",
        "label": "Hood assembly",
        "layer": "shell",
        "shape": "box",
        "position": [
          1.36,
          1.52,
          0
        ],
        "size": [
          1.03,
          0.16,
          1.65
        ],
        "color": 3699628,
        "explode": [
          2.2,
          1.2,
          0
        ],
        "opacity": 0.62,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "trunk-lid",
        "label": "Trunk lid",
        "layer": "shell",
        "shape": "box",
        "position": [
          -1.47,
          1.43,
          0
        ],
        "size": [
          0.76,
          0.15,
          1.58
        ],
        "color": 3699628,
        "explode": [
          -2.1,
          1.2,
          0
        ],
        "opacity": 0.62,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "chassis",
        "label": "Chassis/frame",
        "layer": "structure",
        "shape": "box",
        "position": [
          0,
          0.64,
          0
        ],
        "size": [
          3.75,
          0.23,
          1.57
        ],
        "color": 12043216,
        "explode": [
          0,
          -1.5,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "front-frame",
        "label": "Front structural section",
        "layer": "structure",
        "shape": "box",
        "position": [
          1.62,
          0.8,
          0
        ],
        "size": [
          0.65,
          0.26,
          1.55
        ],
        "color": 12897237,
        "explode": [
          1.5,
          -1.2,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "rear-frame",
        "label": "Rear structural section",
        "layer": "structure",
        "shape": "box",
        "position": [
          -1.63,
          0.8,
          0
        ],
        "size": [
          0.65,
          0.26,
          1.55
        ],
        "color": 12371665,
        "explode": [
          -1.6,
          -1.2,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "engine",
        "label": "Powertrain",
        "layer": "mechanical",
        "shape": "box",
        "position": [
          1.1,
          1.12,
          0
        ],
        "size": [
          0.83,
          0.72,
          0.87
        ],
        "color": 5069165,
        "explode": [
          1.7,
          0.9,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "gearbox",
        "label": "Transmission",
        "layer": "mechanical",
        "shape": "box",
        "position": [
          0.43,
          0.9,
          0
        ],
        "size": [
          0.57,
          0.4,
          0.43
        ],
        "color": 8886698,
        "explode": [
          0.7,
          0.4,
          1.6
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "front-axle",
        "label": "Front axle",
        "layer": "mechanical",
        "shape": "box",
        "position": [
          1.11,
          0.44,
          0
        ],
        "size": [
          0.17,
          0.18,
          1.6
        ],
        "color": 10662078,
        "explode": [
          1,
          -0.7,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "rear-axle",
        "label": "Rear axle",
        "layer": "mechanical",
        "shape": "box",
        "position": [
          -1.17,
          0.44,
          0
        ],
        "size": [
          0.17,
          0.18,
          1.6
        ],
        "color": 10662078,
        "explode": [
          -1,
          -0.7,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "front-left-wheel",
        "label": "Front-left tire",
        "layer": "mechanical",
        "shape": "cylinder",
        "position": [
          1.14,
          0.48,
          -0.86
        ],
        "size": [
          0.58,
          0.24,
          0.58
        ],
        "color": 2764858,
        "explode": [
          1.4,
          -0.7,
          -1.2
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "front-right-wheel",
        "label": "Front-right tire",
        "layer": "mechanical",
        "shape": "cylinder",
        "position": [
          1.14,
          0.48,
          0.86
        ],
        "size": [
          0.58,
          0.24,
          0.58
        ],
        "color": 2764858,
        "explode": [
          1.4,
          -0.7,
          1.2
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "rear-left-wheel",
        "label": "Rear-left tire",
        "layer": "mechanical",
        "shape": "cylinder",
        "position": [
          -1.17,
          0.48,
          -0.86
        ],
        "size": [
          0.58,
          0.24,
          0.58
        ],
        "color": 2764858,
        "explode": [
          -1.4,
          -0.7,
          -1.2
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "rear-right-wheel",
        "label": "Rear-right tire",
        "layer": "mechanical",
        "shape": "cylinder",
        "position": [
          -1.17,
          0.48,
          0.86
        ],
        "size": [
          0.58,
          0.24,
          0.58
        ],
        "color": 2764858,
        "explode": [
          -1.4,
          -0.7,
          1.2
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "brake-unit",
        "label": "Braking system",
        "layer": "mechanical",
        "shape": "box",
        "position": [
          0.78,
          1.4,
          -0.57
        ],
        "size": [
          0.3,
          0.25,
          0.27
        ],
        "color": 13612170,
        "explode": [
          1.7,
          1.4,
          -1.3
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "battery",
        "label": "Electrical battery",
        "layer": "electrical",
        "shape": "box",
        "position": [
          1.52,
          1.3,
          0.54
        ],
        "size": [
          0.42,
          0.32,
          0.35
        ],
        "color": 15844968,
        "explode": [
          2.1,
          1.6,
          1.6
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "ecu",
        "label": "Computer control module",
        "layer": "electrical",
        "shape": "box",
        "position": [
          0.4,
          1.05,
          0.6
        ],
        "size": [
          0.38,
          0.23,
          0.26
        ],
        "color": 4834746,
        "explode": [
          0.5,
          1.6,
          1.9
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "wiring",
        "label": "Wiring harness schematic",
        "layer": "electrical",
        "shape": "box",
        "position": [
          -0.02,
          1.05,
          0.7
        ],
        "size": [
          2.15,
          0.06,
          0.06
        ],
        "color": 15913318,
        "explode": [
          0,
          1.6,
          1.9
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "driver-seat",
        "label": "Driver seat",
        "layer": "interior",
        "shape": "box",
        "position": [
          -0.2,
          1.1,
          -0.42
        ],
        "size": [
          0.7,
          0.81,
          0.55
        ],
        "color": 9854549,
        "explode": [
          0,
          1.8,
          -1.5
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "passenger-seat",
        "label": "Passenger seat",
        "layer": "interior",
        "shape": "box",
        "position": [
          -0.2,
          1.1,
          0.42
        ],
        "size": [
          0.7,
          0.81,
          0.55
        ],
        "color": 9854549,
        "explode": [
          0,
          1.8,
          1.5
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "rear-bench",
        "label": "Rear seating",
        "layer": "interior",
        "shape": "box",
        "position": [
          -1.24,
          1.05,
          0
        ],
        "size": [
          0.67,
          0.79,
          1.34
        ],
        "color": 9788498,
        "explode": [
          -1.4,
          1.2,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "cabin-hvac",
        "label": "Cabin HVAC",
        "layer": "interior",
        "shape": "box",
        "position": [
          0.49,
          1.01,
          0
        ],
        "size": [
          0.32,
          0.28,
          1.05
        ],
        "color": 7125209,
        "explode": [
          1.1,
          1.2,
          1.3
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      }
    ]
  },
  "building": {
    "title": "HOLOCAD APARTMENT",
    "subtitle": "Structure, plumbing, electrical, HVAC",
    "parts": [
      {
        "id": "roof",
        "label": "Roof envelope",
        "layer": "shell",
        "shape": "box",
        "position": [
          0,
          3.35,
          0
        ],
        "size": [
          3.4,
          0.22,
          3
        ],
        "color": 7448005,
        "explode": [
          0,
          1.9,
          0
        ],
        "opacity": 0.28,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "front",
        "label": "Front wall",
        "layer": "shell",
        "shape": "box",
        "position": [
          0,
          1.72,
          1.45
        ],
        "size": [
          3.4,
          3.2,
          0.18
        ],
        "color": 10401478,
        "explode": [
          0,
          0,
          1.8
        ],
        "opacity": 0.2,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "back",
        "label": "Rear wall",
        "layer": "shell",
        "shape": "box",
        "position": [
          0,
          1.72,
          -1.45
        ],
        "size": [
          3.4,
          3.2,
          0.18
        ],
        "color": 10401478,
        "explode": [
          0,
          0,
          -1.8
        ],
        "opacity": 0.2,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "left",
        "label": "Left wall",
        "layer": "shell",
        "shape": "box",
        "position": [
          -1.65,
          1.72,
          0
        ],
        "size": [
          0.2,
          3.2,
          2.9
        ],
        "color": 10401478,
        "explode": [
          -1.8,
          0,
          0
        ],
        "opacity": 0.2,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "right",
        "label": "Right wall",
        "layer": "shell",
        "shape": "box",
        "position": [
          1.65,
          1.72,
          0
        ],
        "size": [
          0.2,
          3.2,
          2.9
        ],
        "color": 10401478,
        "explode": [
          1.8,
          0,
          0
        ],
        "opacity": 0.2,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "foundation",
        "label": "Foundation slab",
        "layer": "structure",
        "shape": "box",
        "position": [
          0,
          0.04,
          0
        ],
        "size": [
          3.5,
          0.23,
          3.12
        ],
        "color": 12503248,
        "explode": [
          0,
          -1.4,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "floor-1",
        "label": "First floor",
        "layer": "structure",
        "shape": "box",
        "position": [
          0,
          0.9,
          0
        ],
        "size": [
          3.2,
          0.18,
          2.92
        ],
        "color": 14931130,
        "explode": [
          0,
          -0.7,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "floor-2",
        "label": "Second floor",
        "layer": "structure",
        "shape": "box",
        "position": [
          0,
          2.14,
          0
        ],
        "size": [
          3.2,
          0.18,
          2.92
        ],
        "color": 14931130,
        "explode": [
          0,
          0.5,
          0
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "stairs",
        "label": "Stairs schematic",
        "layer": "interior",
        "shape": "box",
        "position": [
          -0.88,
          1.5,
          0.56
        ],
        "size": [
          0.65,
          1.9,
          0.91
        ],
        "color": 13149562,
        "explode": [
          -1.5,
          0.3,
          1.3
        ],
        "opacity": 0.5,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "apartment",
        "label": "Apartment room core",
        "layer": "interior",
        "shape": "box",
        "position": [
          0.45,
          1.49,
          0
        ],
        "size": [
          1.63,
          2.07,
          1.7
        ],
        "color": 6731449,
        "explode": [
          1.3,
          0.3,
          0
        ],
        "opacity": 0.25,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "water-riser",
        "label": "Water supply riser",
        "layer": "plumbing",
        "shape": "cylinder",
        "position": [
          -1.28,
          1.57,
          -0.72
        ],
        "size": [
          0.09,
          2.8,
          0.09
        ],
        "color": 4963561,
        "explode": [
          -2,
          0.2,
          -1.4
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "drain-stack",
        "label": "Drainage path",
        "layer": "plumbing",
        "shape": "cylinder",
        "position": [
          -1.03,
          1.57,
          -0.72
        ],
        "size": [
          0.14,
          2.8,
          0.14
        ],
        "color": 7769577,
        "explode": [
          -1.7,
          -0.4,
          -1.3
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "electrical-panel",
        "label": "Electrical panel",
        "layer": "electrical",
        "shape": "box",
        "position": [
          1.19,
          1.17,
          -1.13
        ],
        "size": [
          0.44,
          0.62,
          0.13
        ],
        "color": 14992748,
        "explode": [
          2.1,
          -0.2,
          -1.1
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "electric-conduit",
        "label": "Conduit",
        "layer": "electrical",
        "shape": "cylinder",
        "position": [
          1.24,
          2.08,
          -1.13
        ],
        "size": [
          0.07,
          1.52,
          0.07
        ],
        "color": 15323517,
        "explode": [
          2.1,
          0.6,
          -1.1
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "air-handler",
        "label": "HVAC air handler",
        "layer": "hvac",
        "shape": "box",
        "position": [
          0.73,
          2.77,
          -0.57
        ],
        "size": [
          0.93,
          0.59,
          0.72
        ],
        "color": 7327392,
        "explode": [
          1.1,
          1.7,
          -1.2
        ],
        "opacity": 1,
        "description": "Schematic teaching part; not certified technical geometry."
      },
      {
        "id": "air-duct",
        "label": "Air duct schematic",
        "layer": "hvac",
        "shape": "box",
        "position": [
          0,
          2.75,
          0
        ],
        "size": [
          2.58,
          0.2,
          0.42
        ],
        "color": 8640444,
        "explode": [
          0,
          1.5,
          1.4
        ],
        "opacity": 0.85,
        "description": "Schematic teaching part; not certified technical geometry."
      }
    ]
  }
}
export const HOLOCAD_SUBJECT_ORDER:readonly HoloCADSubject[]=['human','canine','automobile','building']
export function validateHoloCADPresets(){for(const key of HOLOCAD_SUBJECT_ORDER){const p=HOLOCAD_LIVING_PRESETS[key];if(!p?.parts.length)throw Error('Missing subject '+key);const seen=new Set<string>();for(const part of p.parts){if(seen.has(part.id)||!part.label)throw Error('Duplicate/empty part');seen.add(part.id);if(![...part.position,...part.size,...part.explode].every(Number.isFinite))throw Error('Invalid coordinates');if(part.size.some(n=>n<=0||n>10))throw Error('Invalid size')}}return true}
export function layoutHoloCAD(subject:HoloCADSubject,explosion:number,detached:ReadonlySet<string>){const d=HOLOCAD_LIVING_PRESETS[subject];if(!d||!Number.isFinite(explosion)||explosion<0||explosion>1.7)throw Error('Invalid teardown state');return d.parts.map(part=>({...part,detached:detached.has(part.id),positionNow:part.position.map((v,i)=>v+part.explode[i]*(explosion+(detached.has(part.id)?2.0:0))) as [number,number,number]}))}
