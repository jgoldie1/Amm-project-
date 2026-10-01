export type StreetVerseDiscordRole='verified-player'|'creator'|'rp-host'|'pk-player'|'campusverse-student'|'business-owner'
export const STREETVERSE_DISCORD={
 communityName:'StreetVerse Global',
 oauth:{
  flow:'authorization-code',
  scopes:['identify','guilds.join','role_connections.write'],
  serverOnly:['DISCORD_CLIENT_SECRET','bot-token','oauth-code-exchange','guild-member-write'],
  requiredChecks:['state','redirect-uri','token-owner','guild-id'],
 },
 channels:[
  {id:'start-here',label:'#start-here',purpose:'Rules, onboarding and first mission'},
  {id:'streetverse-global',label:'#streetverse-global',purpose:'Global RP community'},
  {id:'circle-park-live',label:'#circle-park-live',purpose:'Circle Park LIVE/PK session announcements'},
  {id:'creator-pass',label:'#creator-pass',purpose:'Creator codes, collabs and recruitment'},
  {id:'pk-challenges',label:'#pk-challenges',purpose:'PK schedules and team challenges'},
  {id:'missions',label:'#missions',purpose:'Mission parties and progression'},
  {id:'reels',label:'#reels',purpose:'Gameplay clips and Reel moments'},
  {id:'support',label:'#support',purpose:'Player help and bug reports'},
 ] as const,
 roles:[
  {id:'verified-player',label:'Verified Player',source:'validated StreetVerse account connection'},
  {id:'creator',label:'StreetVerse Creator',source:'validated creator status'},
  {id:'rp-host',label:'RP Host',source:'validated hosted LIVE/RP session'},
  {id:'pk-player',label:'PK Player',source:'validated PK participation'},
  {id:'campusverse-student',label:'CampusVerse Player',source:'validated CampusVerse progression'},
  {id:'business-owner',label:'StreetVerse Business Owner',source:'validated in-game business ownership'},
 ] as const,
 safety:'Never expose bot tokens or the Discord client secret in browser code. Moderator/admin permissions are manual and are not gameplay rewards.'
} as const
export const requestDiscordConnect=()=>window.dispatchEvent(new CustomEvent('tryamm:discord-oauth-request',{detail:{flow:'authorization-code',scopes:STREETVERSE_DISCORD.oauth.scopes}}))
export const requestDiscordRoleSync=()=>window.dispatchEvent(new CustomEvent('tryamm:discord-role-sync-request',{detail:{source:'streetverse'}}))
export const requestDiscordShare=(kind:'creator-pass'|'live-rp'|'pk-challenge'|'mission'|'reel',payload:Record<string,unknown>={})=>window.dispatchEvent(new CustomEvent('tryamm:discord-share-request',{detail:{kind,payload,source:'streetverse'}}))
