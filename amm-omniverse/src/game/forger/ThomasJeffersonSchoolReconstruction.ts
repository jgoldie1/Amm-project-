export const JEFFERSON_SCHOOL_RECONSTRUCTION={
 id:'sv-thomas-jefferson-school',
 realWorldIdentity:{name:'Thomas Jefferson Public School / STEM Magnet Academy',address:'1522 W Fillmore St, Chicago, IL 60607',historicName:'Thomas Jefferson Elementary School',exteriorAuthority:'reference-photo+public-record',interiorAuthority:'playable-game-reconstruction-until-verified-plans'},
 exterior:{
  style:'historic Chicago public school',
  materials:['red masonry','light stone trim','dark window frames','stone entrance surround'],
  features:['multi-story connected masonry masses','tall repeated window bays','horizontal stone belt courses','stone cornice/parapet accents','projecting entrance bay','front steps','school sign'],
 },
 interiorProgram:[
  'main lobby/reception','principal/admin office','nurse/counselor','classrooms','science/STEM classroom','computer/maker lab',
  'library/media center','gymnasium','locker/changing rooms','student restrooms','staff restroom','cafeteria/multipurpose room',
  'kitchen/service','music/art classroom','storage/maintenance','mechanical/electrical','stairs','accessible vertical circulation','corridors'
 ],
 gameplay:['attend-class','teacher/student NPC schedules','basketball/gym','STEM missions','after-school activities','emergency/fire drill','school events'],
 productionGates:['photo-proportion-review','collision','interior-nav','door-interactions','stairs-accessibility','mobile-lod','lighting','iPhone-device-verify']
} as const
