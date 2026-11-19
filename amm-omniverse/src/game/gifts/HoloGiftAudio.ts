// CC0 Kenney sounds distributed through the community Open Game SFX Index.
// Source license: https://kenney.nl/assets/sci-fi-sounds (CC0)
// Index and provenance: https://github.com/Mcamento8/open-game-sfx-index
// Sound previews are remote, not bundled: verify availability before a public release.
// Never replace authentic whale/lion/shofar or licensed music with misleading generic cues.
const ROOT='https://raw.githubusercontent.com/Mcamento8/open-game-sfx-index/main/audio/';
const SOUND_FILES={
  sparkle:'interface-sounds/confirmation_001.ogg',
  celebration:'interface-sounds/confirmation_004.ogg',
  pop:'ui-audio/click1.ogg',
  heart:'interface-sounds/glass_002.ogg',
  comedy:'interface-sounds/bong_001.ogg',
  impact:'impact-sounds/impactGeneric_light_002.ogg',
  metal:'impact-sounds/impactMetal_heavy_002.ogg',
  bell:'impact-sounds/impactBell_heavy_000.ogg',
  page:'rpg-audio/bookOpen.ogg',
  close:'rpg-audio/bookClose.ogg',
  music:'music-jingles/jingles_HIT00.ogg',
  music2:'music-jingles/jingles_PIZZI00.ogg',
  portal:'sci-fi-sounds/forceField_000.ogg',
  space:'sci-fi-sounds/spaceEngineLarge_000.ogg',
  vacuum:'sci-fi-sounds/spaceEngineLow_000.ogg',
  blast:'sci-fi-sounds/lowFrequency_explosion_000.ogg',
  laser:'sci-fi-sounds/laserLarge_000.ogg',
  launch:'sci-fi-sounds/thrusterFire_000.ogg',
} as const;
export type GiftSoundKey=keyof typeof SOUND_FILES;
export const GIFT_SOUND_SOURCES=Object.fromEntries(Object.entries(SOUND_FILES).map(([key,path])=>[key,ROOT+path])) as Record<GiftSoundKey,string>;
const BY_GIFT:Record<string,GiftSoundKey>={
 spark:'sparkle',rose:'heart',heart:'heart',fire:'blast',confetti:'celebration',
 'kiss-me':'heart','air-kiss':'heart','holo-hug':'heart','high-five':'impact',wink:'pop',
 'laugh-burst':'comedy',boo:'comedy',heartbreak:'close','cartoon-punch':'impact','cartoon-slap':'impact',
 america250:'celebration',eagle:'launch','liberty-bell':'bell','stars-stripes':'celebration',
 'mic-drop':'metal',vinyl:'music',boombox:'music2','gold-record':'celebration',
 crown:'bell',diamond:'sparkle',supercar:'space','private-jet':'launch',yacht:'space',
 lion:'portal','twelve-tribes':'bell',shofar:'portal','set-apart-scroll':'page',
 'menorah-light':'sparkle','jerusalem-gate':'portal',ark:'portal',judah:'celebration',
 'pk-ko':'impact','pk-comeback':'blast','pk-crown':'celebration',
 galaxy:'space',supernova:'blast','streetverse-car':'space','mars-drop':'blast',
 'starverse-stage':'music',portal:'portal','omnibox-premiere':'music2','world-takeover':'space',
 'galaxy-whale':'space','cosmic-vacuum':'vacuum'
};
let enabled=true;
let lastGift='';
let lastAt=0;
let active:HTMLAudioElement|null=null;
// Legacy iPhones may reject OGG/Vorbis. Simple original tone fallback keeps preview audible;
// it is NOT an authentic instrument, song, animal call, or equivalent to the source sound.
function playFallbackTone(key:GiftSoundKey){
 try{
  const Ctor=window.AudioContext;
  if(!Ctor)return;
  const ctx=new Ctor();const osc=ctx.createOscillator();const gain=ctx.createGain();
  osc.type=key==='impact'||key==='blast'?'sawtooth':'sine';
  osc.frequency.setValueAtTime(key==='bell'?660:key==='impact'?160:440,ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(key==='blast'?70:220,ctx.currentTime+.25);
  gain.gain.setValueAtTime(.0001,ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.08,ctx.currentTime+.02);
  gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.38);
  osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.4);
  osc.onended=()=>{void ctx.close().catch(()=>{})};
 }catch{/* Audio is optional: visual gift remains available. */}
}
export function setHoloGiftSoundEnabled(value:boolean){enabled=value;if(!value){active?.pause();active=null}}
export function playHoloGiftSound(giftId:string):boolean{
 if(!enabled||typeof Audio==='undefined')return false;
 const now=Date.now();
 if(lastGift===giftId&&now-lastAt<450)return false; // same on-screen and broadcast event
 lastGift=giftId;lastAt=now;
 const key=BY_GIFT[giftId];
 if(!key)return false; // no mislabeled generic audio for unverified cultural/nature gifts
 try{
  active?.pause();
  const audio=new Audio(GIFT_SOUND_SOURCES[key]);audio.preload='none';audio.volume=.28;
  active=audio;
  void audio.play().catch(()=>{if(active===audio)active=null});
  return true;
 }catch{return false}
}
export const HOLO_GIFT_AUDIO_STATUS={
 license:'Kenney CC0 1.0',
 source:'https://github.com/Mcamento8/open-game-sfx-index',
 hosted:'remote-source-not-self-hosted',
 authenticWhale:false,authenticLion:false,authenticShofar:false,
 licensedCommercialSongClips:false
} as const;
