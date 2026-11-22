/** Source-backed website inventory. Paths indicate recovered source, not verified public deployment. */
export type WebsiteInventoryEntry = {
 id: string
 name: string
 sourcePath: string
 status: 'source-recovered' | 'preview' | 'verification-needed'
 publicPath?: string
}
export const TRYAMM_WEBSITE_MASTER_REGISTRY: WebsiteInventoryEntry[] = [
 {id:'jacobie-visions',name:"Jacobie’s Visions",sourcePath:'amm-omniverse/public/jacobie-visions.html',status:'preview',publicPath:'/jacobie-visions.html'},
 {id:'lateasia-beauty-house',name:'LaTeasia Monroe Beauty House / BeautyVerse',sourcePath:'amm-omniverse/public/lateasia-beauty-house.html',status:'preview',publicPath:'/lateasia-beauty-house.html'},
 {id:'sculptify-ltd',name:'Sculptify Ltd — San Diego',sourcePath:'amm-omniverse/src/data/sculptifySanDiegoStreetVerse.ts',status:'verification-needed'},
 {id:'alton-kevon-stubbs',name:'Alton Kevon Stubbs — Media and Forex Education',sourcePath:'amm-omniverse/src/data/familyBusinessRegistry.ts',status:'verification-needed'},
 {id:'alton-security',name:'Alton Stubbs Security and Training',sourcePath:'sites/stubbs-security/index.html',status:'source-recovered'},
 {id:'stubbs-mobility',name:'Stubbs Mobility',sourcePath:'sites/stubbs-mobility/index.html',status:'source-recovered'},
 {id:'raymond-jarreau',name:'Raymond Jarreau / OmniCare Business',sourcePath:'sites/raymond-jarreau/index.html',status:'source-recovered'},
 {id:'jacobie-vision-site',name:'Jacobie Vision Standalone Site',sourcePath:'sites/jacobie-vision/index.html',status:'source-recovered'},
 {id:'business-owner-dashboard',name:'TRYAMM Business Owner Dashboard',sourcePath:'sites/business-owner-dashboard/index.html',status:'source-recovered'},
 {id:'nekira-hr-logistics',name:'Nekira Frances HR Logistics',sourcePath:'business-templates/nekira-frances-hr-logistics/launch-registry.json',status:'verification-needed'},
]
