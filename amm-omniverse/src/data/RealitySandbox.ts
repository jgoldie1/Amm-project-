export type RealityAnchor='floor'|'wall'|'table'|'room'|'outdoor-surface';
export type RealityPortalSpec={id:string;verse:string;anchor:RealityAnchor;scale:'tabletop'|'portal'|'room-scale';collisionBoundary:boolean;occlusion:boolean;passthrough:boolean;comfortMode:boolean;};

export const REALITY_SANDBOX_MODES=[
 {id:'tabletop',label:'Tabletop World',description:'Place a miniature Verse on a real table; inspect, move approved virtual objects, then enter full scale.'},
 {id:'portal',label:'Walk-Through Portal',description:'Anchor a Verse doorway to a real wall/floor boundary and transition into the virtual world.'},
 {id:'room-scale',label:'Room Becomes The Level',description:'Map safe room surfaces into virtual terrain while preserving guardian/boundary awareness.'},
 {id:'director',label:'Reality Director',description:'Use the real room as a virtual-production set with cameras, performers, lights and portals.'}
] as const;

export const REALITY_SANDBOX_RULES=[
 'virtual collision never implies a real surface can support body weight',
 'keep physical boundary/guardian visible or immediately recoverable',
 'never instruct a player to climb/jump onto mapped furniture',
 'occlusion and passthrough require device capability checks',
 'seated, one-hand, touch, voice, gaze and switch equivalents remain available',
 'world mutations are permissioned and versioned',
 'physical-device commands route only through Physical Twin Gateway'
] as const;

export const REALITY_SANDBOX_PIPELINE=[
 'scan/estimate safe play area','classify anchors','creator selects Verse/world',
 'place tabletop/portal/room-scale scene','validate boundary and comfort settings',
 'instantiate world twin','enable reach-in virtual interaction','sync multiplayer state',
 'capture performance/gameplay','Reel/StarVerse handoff','restore/exit safely'
] as const;
