import { FAMILY_BUSINESS_REGISTRY } from './familyBusinessRegistry'

export const FAMILY_BUSINESS_ROUTES=['/business',...FAMILY_BUSINESS_REGISTRY.map(p=>`/business/${p.id}`)]

export function isKnownFamilyBusinessRoute(pathname:string){return FAMILY_BUSINESS_ROUTES.includes(pathname.replace(/\/$/,''))}
