import {FAMILY_BUSINESS_REGISTRY} from './familyBusinessRegistry'
/** Initial 30-website campaign registry; preserve overflow instead of silently hiding sites.
 * Existing owner-approved central registry is preserved; four missing priority brands appended.
 */
const existing=FAMILY_BUSINESS_REGISTRY.map(x=>({id:x.id,name:x.owner,stage:x.status,source:'family-business-registry' as const}))
const missing=[
 {id:'stubbs-mobility360',name:'Stubbs Mobility 360',stage:'website-preview' as const,source:'priority-existing-project' as const},
 {id:'omnicare360',name:'OmniCare360 — Uncle Raymond',stage:'website-preview' as const,source:'priority-existing-project' as const},
 {id:'sculptifyltd',name:'SculptifyLTD — Tasha',stage:'design-preview' as const,source:'priority-existing-project' as const},
 {id:'la-taeasia-beautyverse',name:'La Taeasia BeautyVerse',stage:'recovery-needed' as const,source:'priority-existing-project' as const},
]
export const TRYAMM_FIRST_30_WEBSITES=[...existing.filter(x=>!missing.some(y=>y.id===x.id)),...missing]
export const TRYAMM_FIRST_30_GATES=['owner-and-photo-approval','separate-business-identity','public-site-tested','mobile-accessibility','offer-and-supplier-approval','merchant-and-payment-verification','order-fulfillment-and-refunds','real-production-transaction-smoke'] as const
export const TRYAMM_FIRST_30_COUNTS={target:30,registeredSlots:TRYAMM_FIRST_30_WEBSITES.length,verifiedLive:TRYAMM_FIRST_30_WEBSITES.filter(x=>x.stage==='live').length}
