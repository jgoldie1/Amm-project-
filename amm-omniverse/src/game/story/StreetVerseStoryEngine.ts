export type StoryRole='civilian'|'business'|'police'|'ems'|'creator';
export type StoryBeat={id:string;title:string;prompt:string;role:StoryRole;minutes:number};
export type StoryEpisode={id:string;title:string;city:string;createdAt:string;beats:StoryBeat[];participants:string[];businessIds:string[];status:'draft'|'active'|'complete';consentToRecord:boolean};
export type StoryMedia={episodeId:string;kind:'reel'|'episode'|'aftershow';title:string;approved:boolean;sourceClipIds:string[]};
const clean=(s:string,max=120)=>s.trim().slice(0,max);
export function createTrafficStopStory(city:string,participants:string[],businessIds:string[]=[]):StoryEpisode{
 const beats:StoryBeat[]=[
 {id:'intro',title:'Meet the characters',prompt:'Show where the characters are going and why the trip matters.',role:'civilian',minutes:4},
 {id:'incident',title:'Traffic stop',prompt:'Roleplay a respectful, non-scripted encounter; players choose dialogue and actions.',role:'police',minutes:6},
 {id:'complication',title:'Unexpected call',prompt:'Introduce a witness, a broken vehicle, or an EMS request without forcing player decisions.',role:'ems',minutes:6},
 {id:'business',title:'Community connection',prompt:'Visit a participating virtual business. Any real purchase opens a separate verified checkout.',role:'business',minutes:5},
 {id:'resolution',title:'What happens next?',prompt:'Allow characters to resolve the scene and establish a follow-up storyline.',role:'civilian',minutes:5},
 {id:'recap',title:'Story time recap',prompt:'Ask participants what happened in character; collect consent before recording or publication.',role:'creator',minutes:4}
 ];
 return {id:'story-'+Date.now().toString(36),title:'One Stop, Many Stories',city:clean(city),createdAt:new Date().toISOString(),beats,participants:participants.map(p=>clean(p,60)),businessIds:businessIds.map(b=>clean(b,60)),status:'draft',consentToRecord:false};
}
export function canPublishStory(episode:StoryEpisode,participantApprovals:Record<string,boolean>):boolean{
 return episode.status==='complete'&&episode.consentToRecord&&episode.participants.length>0&&episode.participants.every(p=>participantApprovals[p]===true);
}
export function prepareStoryMedia(episode:StoryEpisode,approvals:Record<string,boolean>):StoryMedia[]{
 if(!canPublishStory(episode,approvals))return [];
 return [
 {episodeId:episode.id,kind:'reel',title:episode.title+' — Highlights',approved:false,sourceClipIds:[]},
 {episodeId:episode.id,kind:'episode',title:episode.title+' — Full Story',approved:false,sourceClipIds:[]},
 {episodeId:episode.id,kind:'aftershow',title:episode.title+' — LIVE Aftershow',approved:false,sourceClipIds:[]}
 ];
}
