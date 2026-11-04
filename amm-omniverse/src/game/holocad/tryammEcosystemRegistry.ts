/**
 * Metadata-only repository inventory; 2026-11-04 connected GitHub root audit.
 * Do not confuse repository visibility with installed/working/deployed integration.
 * No credentials, private email, customer data, payment records or secrets.
 */
export type TRYAMMRepoRole='reference'|'business'|'research'|'service'|'hub'|'frontend'|'placeholder'
export type TRYAMMConnectionState='none'|'manual'|'isolate'|'pending-api'|'local'|'security-review'|'pending-ui'
export type TRYAMMRepoRecord=Readonly<{
 name:string;url:string;role:TRYAMMRepoRole;connection:TRYAMMConnectionState;notes:string
}>
export const TRYAMM_ECOSYSTEM_REPOS:readonly TRYAMMRepoRecord[]=[
 {name:"github-slideshow",url:"https://github.com/jgoldie1/github-slideshow",role:"reference",connection:"none",notes:"GitHub tutorial repository; no StreetVerse integration verified"},
 {name:"jgoldie1",url:"https://github.com/jgoldie1/jgoldie1",role:"reference",connection:"none",notes:"Profile README only"},
 {name:"marchandlewis",url:"https://github.com/jgoldie1/marchandlewis",role:"business",connection:"manual",notes:"Staffing agency repository currently documents the concept only"},
 {name:"autogpt",url:"https://github.com/jgoldie1/autogpt",role:"research",connection:"isolate",notes:"General purpose agent code; do not run autonomous shell/data operations as a game dependency"},
 {name:"jarvis-2.0-memory-vault",url:"https://github.com/jgoldie1/jarvis-2.0-memory-vault",role:"research",connection:"isolate",notes:"Automation and memory scripts require isolated security review before use"},
 {name:"jarvis_os-",url:"https://github.com/jgoldie1/jarvis_os-",role:"reference",connection:"none",notes:"README-only placeholder"},
 {name:"qse-ecosystem",url:"https://github.com/jgoldie1/qse-ecosystem",role:"service",connection:"pending-api",notes:"Express/SQLite QSE service for Sculptify/March & Lewis; contract/auth not verified"},
 {name:"Amm-project-",url:"https://github.com/jgoldie1/Amm-project-",role:"hub",connection:"local",notes:"TRYAMM/StreetVerse core plus four separate active integration pull requests"},
 {name:"amm-core-clean",url:"https://github.com/jgoldie1/amm-core-clean",role:"service",connection:"pending-api",notes:"Small Express starter; no validated production API"},
 {name:"omnicare-route-fix",url:"https://github.com/jgoldie1/omnicare-route-fix",role:"business",connection:"security-review",notes:"OmniCare TanStack app; tracked .env file requires private secret review"},
 {name:"middleverse-os",url:"https://github.com/jgoldie1/middleverse-os",role:"service",connection:"pending-api",notes:"Express/Socket.io MiddleVerse service; auth/contracts not verified"},
 {name:"amm-platform",url:"https://github.com/jgoldie1/amm-platform",role:"frontend",connection:"pending-ui",notes:"Accessibility-first Next.js creator interface; runtime integration not validated"},
 {name:"-holoverse-core-mvp",url:"https://github.com/jgoldie1/-holoverse-core-mvp",role:"placeholder",connection:"none",notes:"Empty repository at audit; no importable source"},
 {name:"modly",url:"https://github.com/jgoldie1/modly",role:"research",connection:"manual",notes:"GPU-heavy local image-to-3D Electron app; separate Python/GPU dependency"},
 {name:"Free-api-ke",url:"https://github.com/jgoldie1/Free-api-ke",role:"placeholder",connection:"none",notes:"Empty repository; should not be treated as an API-key source"},
 {name:"Free-api-key-",url:"https://github.com/jgoldie1/Free-api-key-",role:"placeholder",connection:"none",notes:"Empty repository; should not be treated as an API-key source"},
 {name:"omniverse-platform",url:"https://github.com/jgoldie1/omniverse-platform",role:"reference",connection:"none",notes:"README-only placeholder"},
 {name:"tryammplatform-",url:"https://github.com/jgoldie1/tryammplatform-",role:"reference",connection:"none",notes:"README-only placeholder"},
 {name:"Sculptify-Wellness-Hub",url:"https://github.com/jgoldie1/Sculptify-Wellness-Hub",role:"business",connection:"manual",notes:"Separate business PWA; existing README cites Supabase but live integration unverified"},
 {name:"Sculptify-Wellness-hubs",url:"https://github.com/jgoldie1/Sculptify-Wellness-hubs",role:"placeholder",connection:"none",notes:"Empty repository at audit; no importable source"},
]
export const TRYAMM_INTEGRATION_RELEASE_GATES={
 productionUntouched:true,
 livePaymentsWired:false,
 externalRepoAPIsVerified:false,
 physicalQuantumHardware:false,
 liveRoboticsControls:false,
 realCustomerDataConnected:false,
 separateUnmergedPRs: [691,692,694,695] as const,
 activePrototype:'PR 695: HoloCAD internal browser-only research bridge',
} as const
