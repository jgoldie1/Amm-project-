export type StarOpportunityType='audition'|'collaboration'|'show'|'sponsorship'|'mentor'|'studio-session'|'agency-review';
export type TalentSignal={
 creatorId:string;paths:string[];verifiedPerformances:number;completionRate:number;
 audienceRetention:number;collabReliability:number;rightsClear:boolean;
 accessibilityPreferences?:string[];region?:string;languages?:string[];
};
export type StarOpportunity={
 id:string;type:StarOpportunityType;title:string;path:string;requirements:string[];
 compensation:'none'|'fixed'|'revenue-split'|'sponsored-reward';humanDecisionRequired:boolean;
};
export function talentScore(s:TalentSignal){
 const performance=Math.min(1,s.verifiedPerformances/10);
 const score=.30*performance+.25*s.completionRate+.25*s.audienceRetention+.20*s.collabReliability;
 return Math.round(score*100);
}
export function eligibleForScout(s:TalentSignal){
 return s.rightsClear&&s.verifiedPerformances>0&&talentScore(s)>=45;
}
export const STAR_SCOUT_RULES=[
 'rank verified creative work, not protected traits',
 'never infer race, religion, health, disability, sexuality or politics',
 'do not require popularity alone; skill growth and reliability count',
 'creators may inspect why an opportunity was recommended',
 'paid opportunities disclose compensation and material terms',
 'sponsorship/casting final decisions require authorized human or business approval',
 'minor accounts use age-appropriate opportunity and guardian/platform controls where required',
 'accessibility preferences change interaction delivery, never lower talent ranking'
] as const;
export const STAR_OPPORTUNITIES:StarOpportunity[]=[
 {id:'debut-audition',type:'audition',title:'StarVerse Debut Audition',path:'creator',requirements:['1 verified performance','rights clear'],compensation:'none',humanDecisionRequired:false},
 {id:'global-collab-call',type:'collaboration',title:'Global Creator Collaboration',path:'music',requirements:['2 verified performances','collaboration-ready'],compensation:'revenue-split',humanDecisionRequired:true},
 {id:'holo-stage-show',type:'show',title:'Holo Stage Featured Show',path:'live-host',requirements:['audition complete','live safety check'],compensation:'revenue-split',humanDecisionRequired:true},
 {id:'brand-mission',type:'sponsorship',title:'Creator Sponsor Mission',path:'creator',requirements:['brand eligibility','rights clear','disclosure accepted'],compensation:'sponsored-reward',humanDecisionRequired:true},
 {id:'mentor-match',type:'mentor',title:'Star Mentor Match',path:'creator',requirements:['growth goal selected'],compensation:'none',humanDecisionRequired:true},
 {id:'studio-session',type:'studio-session',title:'64-Track Studio Session',path:'music',requirements:['music path selected'],compensation:'revenue-split',humanDecisionRequired:true},
];
export const SCOUT_PIPELINE=['verified performance','rights check','talent signals','explainable score','opportunity match','creator opt-in','human/business approval where required','contract/split record','schedule','performance receipt','outcome feedback'] as const;
