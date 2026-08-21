export type VenueMode='arcade'|'museum'|'university-lab'|'creator-studio'|'franchise'
export type SessionState='reserved'|'check-in'|'briefing'|'calibration'|'active'|'paused'|'complete'|'aborted'

export const LOCATION_VR_BRAND={
 name:'TRYAMM HoloArena',
 alternate:'All American Immersive Arena',
 promise:'Original location-based social XR combining GameVerse, Reality Lab, Immersive Library, creator/movie capture, education and World Memory.',
 truth:'This is TRYAMM original infrastructure. Third-party VR brands, patents, proprietary content and trademarks are not copied or represented as TRYAMM technology.',
}

export const VENUE_STACK=[
 'booking + waivers + age/guardian lane',
 'check-in + accessibility profile',
 'headset/controller/body-tracking assignment',
 'room-scale boundary + calibration',
 'session orchestrator + party/lobby',
 'authoritative multiplayer',
 'operator safety console + pause/abort',
 'haptics/device adapter contract',
 'spatial audio + accessibility modes',
 'GameVerse/Reality Lab/Immersive experience catalog',
 'record/replay/movie capture',
 'World Memory/checkpoint persistence',
 'post-session highlights + creator sharing',
 'venue analytics + device maintenance',
 'ticketing/membership/franchise accounting',
] as const

export const ORIGINAL_EXPERIENCE_LANES=[
 {id:'streetverse-free-roam',name:'StreetVerse Free Roam',source:'GameVerse',loop:'TEAM ENTER → MISSION → CITY EVENT → CHOICE → WORLD MEMORY → HIGHLIGHT REEL'},
 {id:'reality-lab',name:'Reality Lab: District 01',source:'Reality Lab',loop:'CALIBRATE → 7 PROOF ROOMS → IMMERSIVE WING → MULTIPLAYER PUZZLE → CHECKPOINT'},
 {id:'archive-timewalk',name:'Immersive Library Timewalk',source:'Immersive Library',loop:'ARCHIVE CLUE → HOLOGRAPHIC RECONSTRUCTION → RESEARCH → ORIGINAL CREATION → PROVENANCE → LEGACY'},
 {id:'space-crew',name:'SpaceVerse Crew Mission',source:'GameVerse/Space',loop:'BOARD → COCKPIT → CREW ROLES → LAUNCH → MISSION → RETURN → REPLAY'},
 {id:'creator-stage',name:'StarVerse Creator Stage',source:'Creator/Movie Studio',loop:'REHEARSE → PERFORM → MULTI-CAMERA CAPTURE → EDIT → PUBLISH'},
 {id:'university-lab',name:'All American University XR Lab',source:'University',loop:'LESSON → SIMULATION → TEAM TASK → EVIDENCE → PORTFOLIO/CREDENTIAL'},
] as const

export const SAFETY_CONTRACT={
 hardStops:['tracking lost','boundary breach','device thermal fault','operator emergency stop','participant distress','guardian/age violation'],
 operatorActions:['pause room','pause player','recenter/calibrate','remove haptics','switch seated mode','abort session','call floor staff'],
 accessibility:['seated/standing','one-handed controls','reduced motion','high contrast','captions','spatial-audio alternatives','sensory intensity','guardian support'],
 rule:'Safety state overrides score, quota, streak, recording and session completion.',
} as const

export const VENUE_OPERATIONS={
 roles:['venue manager','floor operator','guest experience','technician','cleaning/sanitation','content operator','accessibility lead','security','creator producer','education facilitator'],
 inventory:['headsets','controllers','trackers','haptic devices','charging docks','network equipment','sanitation kits','spares'],
 maintenance:['pre-open device test','between-session sanitation','battery rotation','tracking calibration','network/latency check','end-of-day logs','firmware compatibility approval'],
}

export const BUSINESS_MODEL={
 revenue:['per-session tickets','memberships','birthday/group packages','corporate/team events','school/university labs','creator/movie packages','original merchandise','food/beverage partner revenue where licensed','franchise/license fees after legal readiness'],
 upsell:['highlight reel','movie edit','private room','extended session','creator studio','education workshop','mobile/marketplace membership bundle'],
 franchiseTruth:'A franchise program requires franchise counsel, disclosure/registration where applicable, proven unit economics, operations manuals, trademarks/brand rights, insurance and site/safety standards before offering franchises.',
}

export const HARDWARE_ADAPTERS={
 current:'Use standards/vendor SDK adapters rather than claiming proprietary full-body hardware before prototypes exist.',
 targets:['OpenXR runtime','inside-out headset tracking','controller/hand tracking','optional body trackers','optional haptics','spatial audio','room boundary','spectator display'],
 future:['TRYAMM sensor kit','HoloFon companion/controller','approved biometric-free device presence','venue edge compute'],
}

export const SESSION_PIPELINE='BOOK → CHECK IN → CONSENT/AGE → ACCESSIBILITY → DEVICE ASSIGNMENT → CALIBRATE → PARTY LOBBY → EXPERIENCE → OPERATOR SAFETY → SAVE WORLD MEMORY → RECORD HIGHLIGHTS → CHECKOUT → SHARE/RETURN'
