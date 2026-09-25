export type StubbsRelationshipKind='core-family'|'extended-family'|'next-generation'|'friend'|'family-connected'|'community'
export type StubbsCharacterPassport={id:string;displayName:string;relationship:StubbsRelationshipKind;roles:string[];worlds:string[];referencePolicy:'authorized-reference'|'original-generated';persistent:boolean}
export const MEET_THE_STUBBS_FAMILY_FRIENDS:StubbsCharacterPassport[]=[
{id:'bj-stubbs',displayName:'BJ Stubbs',relationship:'core-family',roles:['StreetVerse','Family','Security','Shadow Ops'],worlds:['StreetVerse','MeetTheStubbs','ShadowOps'],referencePolicy:'authorized-reference',persistent:true},
{id:'marcus-stubbs',displayName:'Marcus Stubbs',relationship:'core-family',roles:['StreetVerse','Family'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'al-b',displayName:'Al B',relationship:'family-connected',roles:['StreetVerse','Family'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'kenosha',displayName:'Kenosha',relationship:'core-family',roles:['Mom','Legacy'],worlds:['StreetVerse','MeetTheStubbs','TimeMachine'],referencePolicy:'authorized-reference',persistent:true},
{id:'raymond-jarreau',displayName:'Raymond Jarreau',relationship:'extended-family',roles:['Uncle','Legacy'],worlds:['StreetVerse','MeetTheStubbs','TimeMachine'],referencePolicy:'authorized-reference',persistent:true},
{id:'shawndell-shelton',displayName:'Shawndell Shelton',relationship:'core-family',roles:['Sister','Legacy'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'deon-ham',displayName:'Deon Ham',relationship:'family-connected',roles:['StreetVerse','Family'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'asia-watson',displayName:'Asia Watson',relationship:'family-connected',roles:['StreetVerse','Family'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'benny',displayName:'Benny',relationship:'family-connected',roles:['Family','Omni Host'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'simone-j',displayName:'Simone J',relationship:'extended-family',roles:['Family','Postal Worker'],worlds:['StreetVerse','MeetTheStubbs','TimeMachine'],referencePolicy:'authorized-reference',persistent:true},
{id:'nikki-frances',displayName:'Nikki Frances',relationship:'friend',roles:['Regional Companion','Detroit Story'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'tae-monroe',displayName:'Tae Monroe',relationship:'friend',roles:['Regional Companion','Florida Story','Adult Story'],worlds:['StreetVerse','MeetTheStubbs','AfterDark'],referencePolicy:'authorized-reference',persistent:true},
{id:'tasha-ash',displayName:'Tasha Ash',relationship:'family-connected',roles:['Legacy Ally','Help Chain'],worlds:['StreetVerse','MeetTheStubbs','TimeMachine'],referencePolicy:'authorized-reference',persistent:true},
{id:'sarah',displayName:'Sarah',relationship:'family-connected',roles:['Mother','Social Worker','Family Services'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'jay',displayName:'Jay',relationship:'friend',roles:['StreetVerse','Missions'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'nova',displayName:'Nova',relationship:'friend',roles:['StreetVerse','Missions'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'ace',displayName:'Ace',relationship:'friend',roles:['StreetVerse','Missions'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'sky',displayName:'Sky',relationship:'friend',roles:['StreetVerse','Missions'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'miles',displayName:'Miles',relationship:'friend',roles:['StreetVerse','Missions'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
]
export function getStubbsPassport(nameOrId:string){const key=nameOrId.trim().toLowerCase();return MEET_THE_STUBBS_FAMILY_FRIENDS.find(x=>x.id===key||x.displayName.toLowerCase()===key)}
export function familyFriendsByRelationship(kind:StubbsRelationshipKind){return MEET_THE_STUBBS_FAMILY_FRIENDS.filter(x=>x.relationship===kind)}
