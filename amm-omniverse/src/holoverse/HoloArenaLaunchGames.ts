export type ArenaLevel = { id:string; name:string; objective:string; unlock?:string }
export type ArenaGame = { id:string; title:string; lane:string; players:string; modes:string[]; levels:ArenaLevel[]; commerce:string[]; safety:string[] }

export const HOLOARENA_LAUNCH_GAMES:ArenaGame[] = [
 { id:'battle-beck-arena', title:'Battle Beck: Holo Deck Arena', lane:'strategy + creature/hero deck battle + free-roam XR', players:'1–6', modes:['solo training','co-op','team battle','tournament'], levels:[
  {id:'bb-1',name:'Deck Forge Academy',objective:'Learn original Battle Beck cards, energy, movement and safe arena interaction.'},
  {id:'bb-2',name:'Neon District Clash',objective:'Capture three holographic beacons while building a legal combo chain.'},
  {id:'bb-3',name:'Volcano Forge',objective:'Cross a shifting volcanic arena, cool unstable zones and defeat the Forge Guardian.'},
  {id:'bb-4',name:'Crown Circuit',objective:'Compete in a multi-round team championship with spectator replay and World Memory.'}
 ], commerce:['physical Battle Beck starter deck','rights-clean expansion packs','playmat/deck case','wearable team bands','collectible venue badges'], safety:['no projectile hardware required','operator pause/abort','age lane','room boundary'] },
 { id:'volcano-rescue', title:'Volcano: Zero Hour', lane:'co-op disaster rescue/adventure', players:'2–6', modes:['family','standard','advanced'], levels:[
  {id:'vz-1',name:'Warning Signs',objective:'Read sensors, map evacuation routes and locate the missing research team.'},
  {id:'vz-2',name:'Lava Run',objective:'Coordinate bridges, drones and safe zones as routes change.'},
  {id:'vz-3',name:'Inside the Mountain',objective:'Stabilize a fictional geothermal core through team puzzles.'},
  {id:'vz-4',name:'Final Evacuation',objective:'Rescue civilians and escape before the simulated eruption finale.'}
 ], commerce:['mission photo/replay package','team shirts','collectible rescue badge'], safety:['fictional simulation only','no real disaster instruction','seated/low-motion option','operator hard stop'] },
 { id:'streetverse-quantum-tag', title:'StreetVerse: Quantum Tag', lane:'movement + team objective', players:'2–8 venue-config dependent', modes:['tag','relay','territory','accessibility-balanced'], levels:[
  {id:'qt-1',name:'The Block',objective:'Learn movement, tagging and safe boundary awareness.'},
  {id:'qt-2',name:'Lakefront Lights',objective:'Relay across a stylized Chicago-inspired waterfront course.'},
  {id:'qt-3',name:'Transit Shift',objective:'Coordinate moving objective zones and team roles.'},
  {id:'qt-4',name:'World Memory Championship',objective:'Finish a persistent team season whose choices alter future venue missions.'}
 ], commerce:['team wristbands','venue league membership','highlight reel','original apparel'], safety:['no physical contact','boundary guardian','adaptive speed','seated role available'] },
 { id:'spaceverse-ark-run', title:'SpaceVerse: Ark Run', lane:'crew exploration + ship operations', players:'1–6', modes:['crew','academy','creator cinematic'], levels:[
  {id:'ar-1',name:'Crew School',objective:'Assign captain, navigation, science, engineering and communications roles.'},
  {id:'ar-2',name:'Launch Window',objective:'Complete a fictional launch sequence and cooperative orbital puzzle.'},
  {id:'ar-3',name:'Mars Signal',objective:'Explore an original Mars outpost and recover a lost signal.'},
  {id:'ar-4',name:'HoloVerse Gate',objective:'Coordinate the crew through a cinematic final mission and record a shareable ending.'}
 ], commerce:['crew mission replay','captain log print/digital collectible','SpaceVerse apparel','education lab package'], safety:['seated mode','motion comfort settings','no real aerospace claims','operator hard stop'] }
]

export const HOLOARENA_GAME_LOOP = 'BOOK → CHECK IN → CONSENT/AGE → ACCESSIBILITY → DEVICE ASSIGNMENT → CALIBRATE → PARTY LOBBY → CHOOSE GAME/LEVEL → EXPERIENCE → OPERATOR SAFETY → SAVE WORLD MEMORY → RECORD HIGHLIGHTS → CHECKOUT → SHARE/RETURN'
