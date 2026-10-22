'use strict';
/* Non-exhaustive restored music history references, NOT licensed performer avatars. */
const genres=['Chicago house','Chicago blues','gospel','jazz','soul','hip-hop','drill','R&B','spoken word','experimental Afrofuturism','Christian rap','gospel R&B','worship','Set Apart music'];
const eras=[
 {id:'blues-gospel',label:'Blues and Gospel Roots',years:'1900s–1950s',genres:['Chicago blues','gospel','jazz'],mission:'Discover neighborhood performance history'},
 {id:'independent-jazz',label:'Independent Jazz and Sun Ra',years:'1950s–1970s',genres:['jazz','experimental Afrofuturism'],mission:'Explore El Saturn independent music history'},
 {id:'house-birth',label:'Chicago House Era',years:'1980s',genres:['Chicago house','soul'],mission:'Build an original dance-music set'},
 {id:'rap-roots',label:'Chicago Rap and Underground',years:'1990s–2000s',genres:['hip-hop','R&B'],mission:'Open Mic and Windy City Flow'},
 {id:'modern-scene',label:'Modern Chicago Music',years:'2010s–2020s',genres:['hip-hop','drill','R&B','gospel'],mission:'Studio to StreetVerse and City Cypher'},
 {id:'future',label:'Future MusicVerse',years:'fictional future',genres:['experimental Afrofuturism','Set Apart music'],mission:'Holo Headliner'}
];
const artistReferences=['Twista','Shawnna','Tink','King Von','Lil Durk','Kanye West','Da Brat','Crucial Conflict','Lupe Fiasco','Juice WRLD','Common','G Herbo','Sun Ra','Alton Abraham'];
const missionCircuit=[
 {id:'open-mic-qualifier',xp:300},{id:'windy-city-flow',xp:450},{id:'studio-to-streetverse',xp:500},{id:'city-cypher',xp:650},{id:'holo-headliner',xp:1000}
];
function buildMusicTimeMachineEra(id){const era=eras.find(e=>e.id===id);if(!era)throw Error('Unknown music era');return {...era,kind:'historically-inspired-simulation',historicalAccuracy:'requires-curation',rightsRequiredForExactLikeness:true,realArtistVoicesEnabled:false,avatarGenerationEnabled:false,chronoverse:{checkpointRequired:true,returnPortalRequired:true,passportContinuityRequired:true}};}
module.exports={genres,eras,artistReferences,missionCircuit,buildMusicTimeMachineEra};
