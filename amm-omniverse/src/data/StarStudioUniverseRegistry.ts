export type StarStudioPillarId='aniyah-64'|'starverse'|'isaiah-tv'|'all-american-network'|'movie-studio'|'jacobie-vision'|'jacobie-real-estate'|'campusverse'
export type StarStudioPillar={id:StarStudioPillarId;label:string;owner:string;kind:string;existingSurface:string;outputs:string[];status:'existing'|'beta-existing'}

export const STAR_STUDIO_PILLARS:readonly StarStudioPillar[]=[
 {id:'aniyah-64',label:'Aniyah 64-Track Studio',owner:'Aniyah',kind:'music-production',existingSurface:'MusicCreatorStudio',outputs:['song','album','soundtrack','performance mix','immersive mix','release package'],status:'existing'},
 {id:'starverse',label:'StarVerse • Anyone Can Be a Star',owner:'TRYAMM / Isaiah AI TV',kind:'talent-discovery',existingSurface:'/starverse',outputs:['audition','showcase','competition','fan discovery','casting lead'],status:'existing'},
 {id:'isaiah-tv',label:'Isaiah AI TV',owner:'Isaiah',kind:'broadcast-network',existingSurface:'/isaiah-ai-tv',outputs:['original','showcase','games','music','education','StarVerse programming'],status:'existing'},
 {id:'all-american-network',label:'All American Network',owner:'All American Network',kind:'distribution',existingSurface:'/network',outputs:['TV','FAST-style programming','creator shows','news','music','sports','marketplace shows'],status:'existing'},
 {id:'movie-studio',label:'TRYAMM Movie Studio',owner:'TRYAMM Creator Omniverse',kind:'film-production',existingSurface:'MovieStudioCenter',outputs:['reel','episode','30-minute film','60-minute film','90-minute film','120-minute film'],status:'existing'},
 {id:'jacobie-vision',label:'Jacobie Vision Cyber Security',owner:'Jacobie',kind:'cyber-defense',existingSurface:'JacobieVisionCenter',outputs:['defensive lab','security portfolio','authorized client work','incident response evidence'],status:'existing'},
 {id:'jacobie-real-estate',label:'Jacobie Real Estate + Home Flipping',owner:'Jacobie',kind:'real-estate',existingSurface:'JacobieFlipLab',outputs:['deal analysis','rehab plan','3D scan','Holo listing','property media','flip portfolio'],status:'existing'},
 {id:'campusverse',label:'CampusVerse',owner:'TRYAMM Education',kind:'campus-network',existingSurface:'IllinoisCampusVerseNetwork',outputs:['campus event','student showcase','audition','performance','skills passport','creator content'],status:'existing'},
] as const

export const STAR_STUDIO_MASTER_FLOW=[
 'CREATE IDENTITY / STAR PROFILE',
 'AUDITION OR ORIGINAL IDEA',
 'CAMPUSVERSE / STREETVERSE / STARVERSE PERFORMANCE',
 'ANIYAH 64-TRACK AUDIO PRODUCTION',
 'RP / ACTING / CINEMATIC CAPTURE',
 'MOVIE STUDIO EDIT / CONTINUITY / RIGHTS',
 'REEL / EPISODE / MOVIE MASTER',
 'ISAIAH AI TV / ALL AMERICAN NETWORK DISTRIBUTION',
 'FAN / FAME / CASTING / COMMERCE / VERIFIED EARNINGS',
] as const

export const STAR_STUDIO_CROSSOVER={
 cyberSecurity:'Jacobie Vision can secure creator accounts, production assets, releases and authorized business systems.',
 realEstate:'Jacobie Flip Lab/property media can become home-flip shows, property documentaries, Holo listings and sponsored real-estate programming.',
 campusVerse:'CampusVerse can host auditions, student productions, performances, internships and StarVerse showcases.',
 aniyah:'Aniyah 64-Track Studio supplies music, vocals, soundtracks and immersive mixes for Reels, LIVE, TV and movies.',
} as const