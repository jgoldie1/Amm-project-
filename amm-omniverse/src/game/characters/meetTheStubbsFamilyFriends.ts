export type StubbsRelationshipKind='core-family'|'extended-family'|'next-generation'|'friend'|'family-connected'|'community'
export type StubbsCharacterPassport={id:string;displayName:string;relationship:StubbsRelationshipKind;roles:string[];worlds:string[];referencePolicy:'authorized-reference'|'original-generated';persistent:boolean;homeCity?:string;socialProfiles?:{platform:'BIGO';handle:string}[]}

export const SOCIAL_CREATOR_PLACEHOLDERS:StubbsCharacterPassport[]=Array.from({length:10},(_,index)=>{
 const slot=String(index+1).padStart(2,'0')
 return {
  id:`social-creator-${slot}`,
  displayName:`Social Creator ${slot}`,
  relationship:'community',
  roles:['BIGO/TikTok Creator','Role Pending'],
  worlds:['StreetVerse','MeetTheStubbs','CreatorVerse'],
  referencePolicy:'original-generated',
  persistent:true,
 }
})
export const MEET_THE_STUBBS_FAMILY_FRIENDS:StubbsCharacterPassport[]=[
{id:'bj-stubbs',displayName:'BJ Stubbs',relationship:'core-family',roles:['StreetVerse','Family'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'al-b',displayName:'Al B',relationship:'family-connected',roles:['StreetVerse','Family'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'marcus',displayName:'Marcus',relationship:'friend',roles:['StreetVerse','Friend','Role Pending'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'tatti',displayName:'Tatti',relationship:'friend',roles:['StreetVerse','Creator','Role Pending'],worlds:['StreetVerse','MeetTheStubbs','CreatorVerse'],referencePolicy:'original-generated',persistent:true},
{id:'brielle',displayName:'Brielle',relationship:'friend',roles:['StreetVerse','Creator','Role Pending'],worlds:['StreetVerse','MeetTheStubbs','CreatorVerse'],referencePolicy:'original-generated',persistent:true},
{id:'mike',displayName:'Mike',relationship:'friend',roles:['StreetVerse','Friend','Role Pending'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'alphonso',displayName:'Alphonso',relationship:'friend',roles:['StreetVerse','Friend','Role Pending'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'jasmine',displayName:'Jasmine',relationship:'friend',roles:['StreetVerse','Creator','Role Pending'],worlds:['StreetVerse','MeetTheStubbs','CreatorVerse'],referencePolicy:'original-generated',persistent:true},
{id:'tae-monroe',displayName:'Tae Monroe',relationship:'friend',roles:['StreetVerse','Creator','Role Pending'],worlds:['StreetVerse','MeetTheStubbs','CreatorVerse'],referencePolicy:'original-generated',persistent:true},
{id:'nikki',displayName:'Nikki',relationship:'friend',roles:['StreetVerse','Friend','Role Pending'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'tasha',displayName:'Tasha',relationship:'friend',roles:['StreetVerse','Friend','Role Pending'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'uncle-ray',displayName:'Uncle Ray',relationship:'extended-family',roles:['StreetVerse','Family','Role Pending'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'j',displayName:'J',relationship:'friend',roles:['StreetVerse','Friend','Role Pending'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'sarah',displayName:'Sarah',relationship:'friend',roles:['StreetVerse','Family Story','Role Pending'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'messa',displayName:'Messa',relationship:'friend',roles:['StreetVerse','Friend','Role Pending'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'original-generated',persistent:true},
{id:'pastor-kofi',displayName:'Pastor Kofi',relationship:'community',roles:['StreetVerse','Community','Role Pending'],worlds:['StreetVerse','MeetTheStubbs','FaithVerse'],referencePolicy:'original-generated',persistent:true},
{id:'jacobie-stubbs',displayName:'Jacobie Stubbs',relationship:'next-generation',roles:['Student','Athlete','Cybersecurity','Leadership'],worlds:['StreetVerse','MeetTheStubbs','University','StarVerse'],referencePolicy:'authorized-reference',persistent:true},
{id:'isaiah-stubbs',displayName:'Isaiah Stubbs',relationship:'next-generation',roles:['Isaiah AI TV','Creator','Storyteller'],worlds:['StreetVerse','MeetTheStubbs','StarVerse'],referencePolicy:'authorized-reference',persistent:true},
{id:'aniyah-stubbs',displayName:'Aniyah Stubbs',relationship:'next-generation',roles:['64-Track Studio','Creator'],worlds:['StreetVerse','MeetTheStubbs','CreatorVerse'],referencePolicy:'authorized-reference',persistent:true},
{id:'kenosha-pennifor',displayName:'Kenosha Pennifor',relationship:'core-family',roles:['Sister','Legacy','Memorial Legacy'],worlds:['StreetVerse','MeetTheStubbs','TimeMachine'],referencePolicy:'authorized-reference',persistent:true},
{id:'raymond-jarreau',displayName:'Raymond Jarreau',relationship:'extended-family',roles:['Uncle','Legacy'],worlds:['StreetVerse','MeetTheStubbs','TimeMachine'],referencePolicy:'authorized-reference',persistent:true},
{id:'shawndell-shelton',displayName:'Shawndell Shelton',relationship:'core-family',roles:['Sister','Legacy'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'deon-ham',displayName:'Deon Ham',relationship:'family-connected',roles:['StreetVerse','Family'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'asia-watson',displayName:'Asia Watson',relationship:'family-connected',roles:['StreetVerse','Family'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'benny',displayName:'Benny',relationship:'family-connected',roles:['Family','Omni Host'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'kenny-stubbs',displayName:'Kenny Stubbs',relationship:'extended-family',roles:['Family','Legacy'],worlds:['StreetVerse','MeetTheStubbs','TimeMachine'],referencePolicy:'authorized-reference',persistent:true},
{id:'don-cario-stubbs',displayName:'Don Cario Stubbs',relationship:'extended-family',roles:['Family','Legacy'],worlds:['StreetVerse','MeetTheStubbs'],referencePolicy:'authorized-reference',persistent:true},
{id:'simone-johnson',displayName:'Simone Johnson',relationship:'extended-family',roles:['Aunt','Family','Postal Worker'],worlds:['StreetVerse','MeetTheStubbs','TimeMachine'],referencePolicy:'authorized-reference',persistent:true},
...SOCIAL_CREATOR_PLACEHOLDERS,
{id:'cash-bae',displayName:'Cash Bae',relationship:'friend',roles:['BIGO Host','Creator','Philadelphia'],worlds:['StreetVerse','MeetTheStubbs','CreatorVerse','StarVerse'],referencePolicy:'original-generated',persistent:true,homeCity:'Philadelphia, Pennsylvania',socialProfiles:[{platform:'BIGO',handle:'CashleyBankss'}]},
]
export function getStubbsPassport(nameOrId:string){const key=nameOrId.trim().toLowerCase();return MEET_THE_STUBBS_FAMILY_FRIENDS.find(x=>x.id===key||x.displayName.toLowerCase()===key)}
export function familyFriendsByRelationship(kind:StubbsRelationshipKind){return MEET_THE_STUBBS_FAMILY_FRIENDS.filter(x=>x.relationship===kind)}
