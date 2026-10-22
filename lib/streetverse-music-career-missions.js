'use strict';
/* StreetVerse music career missions: deterministic local story content.
   No real-money rewards, copyrighted recordings, or celebrity endorsements. */
const MISSIONS=[
 {id:'artist-create',title:'Create Your Artist',stage:'identity',city:'any',options:{A:'Solo rapper',B:'Singer',C:'Producer',D:'Group artist'},next:'studio-session'},
 {id:'studio-session',title:'64-Track Studio Session',stage:'record',city:'any',options:{A:'Write a verse',B:'Record vocals',C:'Produce a beat',D:'Collaborate'},next:'release-single'},
 {id:'release-single',title:'Drop Your First Single',stage:'release',city:'any',options:{A:'Hip-hop',B:'R&B',C:'Gospel',D:'Experimental'},next:'street-promo'},
 {id:'street-promo',title:'StreetVerse Promo Run',stage:'promote',city:'any',options:{A:'Reel teaser',B:'Street performance',C:'Radio interview',D:'Creator collaboration'},next:'battle-night'},
 {id:'battle-night',title:'Mic Battle Night',stage:'battle',city:'any',options:{A:'Freestyle',B:'Written verse',C:'Call-and-response',D:'Team performance'},next:'label-meeting'},
 {id:'label-meeting',title:'Independent Label Meeting',stage:'label',city:'any',options:{A:'Stay independent',B:'Negotiate a license',C:'Build your label',D:'Request mentorship'},next:'tour-booking'},
 {id:'tour-booking',title:'Book Your First Tour',stage:'tour',city:'any',options:{A:'Chicago',B:'Detroit',C:'Atlanta',D:'New York City'},next:null}
];
function getMusicMissions(){return MISSIONS.map(m=>({...m,options:{...m.options}}));}
function createMusicCareer(artistId){if(typeof artistId!=='string'||!/^[a-z0-9_-]{2,60}$/i.test(artistId))throw Error('Invalid artist ID');let index=0;const history=[];return {view(){const m=MISSIONS[index];return {artistId,mission:m?{...m,options:{...m.options}}:null,completed:index===MISSIONS.length,history:history.slice()};},choose(choice){const m=MISSIONS[index];if(!m)throw Error('Career complete');if(!Object.hasOwn(m.options,choice))throw Error('Choose A, B, C or D');history.push({missionId:m.id,choice,label:m.options[choice]});index++;return this.view();}};}
module.exports={getMusicMissions,createMusicCareer};
