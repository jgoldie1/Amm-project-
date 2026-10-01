export const BJ_V5_PHOTO_CAPTURE_GUIDE={
 characterId:'bj-stubbs',
 version:'bj-v5-photo-match-capture-v1',
 required:[
  {id:'front-neutral',label:'Front • neutral',instruction:'Face the camera straight on. Neutral expression. Eyes open. Mouth closed.'},
 ],
 stronglyRecommended:[
  {id:'slight-left',label:'Slight left',instruction:'Turn your head about 30 degrees left while keeping your eyes toward the camera.'},
  {id:'slight-right',label:'Slight right',instruction:'Turn your head about 30 degrees right while keeping your eyes toward the camera.'},
 ],
 optional:[
  {id:'front-smile',label:'Front • small smile',instruction:'Same lighting and distance with a small natural smile.'},
  {id:'profile-left',label:'Left profile',instruction:'Turn to a clean left-side profile.'},
  {id:'profile-right',label:'Right profile',instruction:'Turn to a clean right-side profile.'},
 ],
 capture:{
  lighting:'bright even light from the front; avoid strong shadows or colored lighting',
  camera:'eye level; avoid extreme wide-angle distortion',
  framing:'head and upper shoulders; keep hair/loc silhouette visible',
  accessories:'remove sunglasses; avoid anything covering eyes, nose, mouth or beard',
  expression:'neutral for the main reference',
  quality:'use the clearest original photo available; avoid screenshots if a direct camera photo is possible',
 },
 continuity:{
  keepCurrentEra:true,
  preserveBodyRig:true,
  preserveInventory:true,
  preserveProgression:true,
  preserveMissions:true,
  preserveOutfitSlots:true,
  preserveLongLocs:true,
  preserveSaltPepperBeard:true,
 },
} as const
