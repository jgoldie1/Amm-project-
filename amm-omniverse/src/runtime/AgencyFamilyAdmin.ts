export type AgencyFamily={id:string;name:string;kind:'agency'|'family';ownerId:string;memberIds:string[];managerIds:string[]}
export type AdminAction='mute'|'suspend-live'|'remove-content'|'freeze-reward'|'restore'|'escalate'
export const AGENCY_FAMILY_ADMIN={ownerCannotOverridePlatformSafety:true,managerLeastPrivilege:true,auditedAdminActions:true,creatorCanLeave:true,noForcedExclusivity:true,youthRequiresProtectedLane:true} as const
export function canManage(group:AgencyFamily,userId:string){return group.ownerId===userId||group.managerIds.includes(userId)}
export function canJoin(group:AgencyFamily,userId:string){return !group.memberIds.includes(userId)&&group.ownerId!==userId}
