import { FAMILY_BUSINESS_REGISTRY } from './familyBusinessRegistry'

export const FAMILY_BUSINESS_ROUTE_ACCEPTANCE={
 directory:'/business',
 profiles:FAMILY_BUSINESS_REGISTRY.map(p=>({id:p.id,path:`/business/${p.id}`,expectedOwner:p.owner,expectedStatus:p.status})),
 requirements:['directory-renders','profile-renders','back-to-directory','prelaunch-status-honest','middleverse-runtime-installed'] as const,
}
