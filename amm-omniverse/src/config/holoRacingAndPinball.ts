export type VolcanoRaceMode=
  |'MULTI_LANE'
  |'EQUINE_GRAND_PRIX'
  |'LIGHTLINE_CYCLE'
  |'HOLO_CAR_GRAND_PRIX'
  |'VEHICLE_BATTLE'

export const VOLCANO_RACERS_HOLO_CIRCUIT={
  id:'volcano-racers-holo-circuit',
  title:'Volcano Racers: Holo Circuit',
  parentGame:'Volcano Racers',
  designRule:'Original TRYAMM racing IP. Inspiration may come from racing genres, but no third-party characters, vehicles, logos, track designs, music, dialogue or visual identity are copied.',
  modes:{
    MULTI_LANE:{
      title:'Multi-Lane Rush',
      loop:['choose lane','draft','overtake','hazard dodge','boost zone','finish'],
      accessibility:['one-hand steer','auto-accelerate','lane-snap assist','reduced-camera-motion'],
    },
    EQUINE_GRAND_PRIX:{
      title:'Equine Grand Prix',
      loop:['horse selection','training','stamina pacing','lane positioning','finish sprint'],
      rules:['no gambling system','no real-money wagering','animal welfare presented as a game-world requirement'],
    },
    LIGHTLINE_CYCLE:{
      title:'Lightline Cycle',
      loop:['high-speed arena race','energy trail','boost gates','wall ride','team relay'],
      visualLanguage:'original neon-energy vehicles and tracks; not TRON branding or assets',
    },
    HOLO_CAR_GRAND_PRIX:{
      title:'Holo-Car Grand Prix',
      loop:['projected vehicle select','precision cornering','holographic shortcuts','phase gates','time trial'],
      visualLanguage:'original holographic cars and grid roads; not Automan branding or assets',
    },
    VEHICLE_BATTLE:{
      title:'Holo Vehicle Battle',
      loop:['race','shield','disable fictional drones','capture zone','finish objective'],
      combatRule:'fantasy vehicle combat only; server-authoritative competitive state',
    },
  } satisfies Record<VolcanoRaceMode,unknown>,
  sharedSystems:[
    'TRYAMM Passport',
    'driver rank',
    'vehicle mastery',
    'replay/highlight capture',
    'creator tournaments',
    'Global Conflict crossover missions',
    'Future Mobility World portals',
  ],
  enginePipeline:{
    blender:'asset modeling, track prototyping, vehicle meshes, UVs, LODs and export',
    unity:'mobile AR/MR prototypes, tabletop tracks and HoloArena adapters',
    unreal:'AAA racing, vehicle physics, cinematic tracks, large crowds and high-end multiplayer target',
    web:'lightweight previews, launcher, leaderboards and creator/replay surfaces',
  },
} as const

export const HOLOGRAPHIC_PINBALL_GAME={
  id:'quantum-pinball',
  title:'Quantum Pinball',
  legacyTitle:'AMM Omniverse Holographic 3D Pinball',
  status:'external-prototype-not-yet-integrated',
  core:['ball physics','dual flippers','bumpers','ramps','score','multipliers','three-ball lifecycle','touch controls','keyboard controls'],
  spatial:['standard perspective','four-view reflector mode','future AR/MR table placement'],
  crossover:['GameVerse Nexus','Creator-made tables','SportVerse event tables','Global Conflict event tables','music/concert tables'],
  authority:'Scores used for competitive or paid events must be verified server-side before rewards or rankings are granted.',
} as const
