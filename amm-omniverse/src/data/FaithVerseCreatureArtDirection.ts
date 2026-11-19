/**
 * Original TRYAMM creature design presets for scripture-guided fantasy encounters.
 * The visuals are expressly artistic speculation, NOT a description of verified
 * angel anatomy, ancestry, archaeology, or the historical appearance of the Nephilim.
 */
export type CreatureKey='nephilim'|'watcher'|'goliath'
export type CreatureDirection={
 id:CreatureKey;name:string;source:string[];historicalStatus:string;silhouette:string;
 palette:readonly string[];details:readonly string[];animation:string[];
 conduct:string;ageRating:'teen';canSpawnAsHostileNpc:boolean;humanDignityRule:string
}
export const FAITHVERSE_CREATURES:Readonly<Record<CreatureKey,CreatureDirection>>={
 nephilim:{
  id:'nephilim',name:'Nephilim · shadowed giants',
  source:['Genesis 6:1–4','Numbers 13:32–33'],
  historicalStatus:'The identities, ancestry and size of the Nephilim are debated. Tall figures and unsettling appearances are original fantasy visualization, not documented features.',
  silhouette:'Towering broad-shouldered, uneven stone-like silhouette, long arms and ragged dark cloak, no gory body horror.',
  palette:['#2c303e','#57536b','#9d6485','#d9b07a'],
  details:['Angular asymmetrical shoulders','Scars rendered as cracked stone patterns rather than open wounds','Distant glowing amber eyes','Heavy uneven footfall and dark cloth'],
  animation:['idle-breathe','slow-stride','look-down','non-contact-roar','retreat'],
  conduct:'Non-graphic cautionary roleplay and peaceful observation; no real-world demon diagnosis.',
  ageRating:'teen',canSpawnAsHostileNpc:false,
  humanDignityRule:'Do not equate real people, ethnicity, disabilities or physical differences with monsters.'
 },
 watcher:{
  id:'watcher',name:'Watchers · fallen-angels tradition',
  source:['1 Enoch 6–15','Genesis 6:1–4 (comparison passage)'],
  historicalStatus:'Details derive from the Book of Watchers in the Enochic tradition; appearance, wings, facial form and behavior are creative imagery, not established facts.',
  silhouette:'Unsettling hooded fantasy beings with torn feather-like wings, irregular robe edges and long silhouettes; non-graphic.',
  palette:['#201b31','#574064','#b76c91','#dec6a0'],
  details:['Fragmented feather silhouettes','Two eerie but non-flashing eye glints','Weathered textured cloaks','No gore or explicit torture'],
  animation:['hover-illusion','fold-wings','slow-turn','shadow-shift','disappear'],
  conduct:'Symbolic encounter; learners compare the Genesis passage with 1 Enoch rather than asserting they describe identical beings.',
  ageRating:'teen',canSpawnAsHostileNpc:false,
  humanDignityRule:'Do not represent real religious, ethnic or social groups as fallen angels or monsters.'
 },
 goliath:{
  id:'goliath',name:'Goliath · Philistine champion',
  source:['1 Samuel 17:1–58'],
  historicalStatus:'Goliath is a named human warrior in 1 Samuel. The game must never identify him as a fallen angel or verified Nephilim.',
  silhouette:'Very tall armored human warrior with helmet, shield and spear; distinguish from fantasy supernatural figures.',
  palette:['#685039','#9f8150','#a6a29b','#303339'],
  details:['Period-inspired bronze-colored armor','Tall defensive stance','Shield and spear for visual storytelling','Non-graphic sling practice sequence'],
  animation:['idle-guard','walk-heavy','challenge-gesture','non-graphic-fall'],
  conduct:'Age-appropriate scripted reenactment; no graphic injury, decapitation or real-world weapon instructions.',
  ageRating:'teen',canSpawnAsHostileNpc:false,
  humanDignityRule:'Respect historic peoples and modern descendants; fictional warrior does not define a nation.'
 }
} as const
export const CREATURE_RELEASE={
 originalConcepts:true,skinned3dAssetsVerified:false,npcMotionVerified:false,
 historicalMetadataVerifiedByEditor:false,ageAndDeviceTestingComplete:false,
 publicWorldSpawningApproved:false,productionReady:false
} as const
