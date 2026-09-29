export type CareScope='navigate'|'read-ui'|'open-mission'|'communication'|'access-settings'
export type CareGrant={id:string;ownerId:string;assistantId:string;scopes:CareScope[];expiresAt?:string;revoked:boolean}
const grants=new Map<string,CareGrant>()
export function grantCareAccess(g:CareGrant){grants.set(g.id,{...g,scopes:[...new Set(g.scopes)]});return grants.get(g.id)!}
export function revokeCareAccess(id:string){const g=grants.get(id);if(!g)return false;g.revoked=true;return true}
export function mayAssist(id:string,scope:CareScope){const g=grants.get(id);if(!g||g.revoked)return false;if(g.expiresAt&&Date.parse(g.expiresAt)<=Date.now())return false;return g.scopes.includes(scope)}
