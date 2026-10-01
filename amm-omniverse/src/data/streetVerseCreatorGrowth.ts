export type StreetVerseCreatorTier='founder'|'creator'|'partner'
export type StreetVerseCreatorInvite=Readonly<{code:string;creatorId:string;tier:StreetVerseCreatorTier;world:'circle-park'|'streetverse-global';active:boolean}>
export const STREETVERSE_CREATOR_GROWTH={
 firstSessionGoal:'Complete one StreetVerse mission after joining through a creator code',
 trackedEvents:['invite-open','join','first-spawn','mission-start','mission-complete','live-rp-join','reel-share'],
 rewardsPolicy:'Server-authoritative. No reward is granted from the client. Creator and player rewards require validated events and anti-abuse checks.',
 launchHooks:['Circle Park LIVE RP','StreetVerse Global','PK challenge','Reel moment','Creator code'],
} as const
export const requestCreatorJoin=(code:string)=>window.dispatchEvent(new CustomEvent('tryamm:creator-join-request',{detail:{code,source:'streetverse-global'}}))
export const requestCreatorCode=()=>window.dispatchEvent(new CustomEvent('tryamm:creator-code-request',{detail:{world:'streetverse-global'}}))
