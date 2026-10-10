export type StarStudioTrackType='audio'|'midi'|'video'|'automation'|'holo-cue'|'verse-event';
export type StarStudioTrack={id:string;name:string;type:StarStudioTrackType;clips:{start:number;duration:number;label:string}[];muted?:boolean;solo?:boolean};
export type StarStudioSession={id:string;creatorId:string;bpm:number;key?:string;tracks:StarStudioTrack[];collaborators:string[];takeIds:string[]};

export const STAR_STUDIO_CAPABILITIES=[
 'multitrack audio timeline','MIDI clips and virtual instruments','video/performance track',
 'holographic lighting and stage cues','Verse portal/event automation','AI arrangement suggestions',
 'stem organization','remote collaboration','versioned takes','Reel Composer handoff',
 'spatial/mixed-reality control surface','voice/one-hand/gaze/switch accessible editing'
] as const;

export const STAR_STUDIO_AI_ACTIONS=[
 {id:'arrange',label:'Arrange this performance',requiresApproval:true},
 {id:'clean-take',label:'Prepare a non-destructive clean take',requiresApproval:true},
 {id:'build-drums',label:'Draft a drum pattern',requiresApproval:true},
 {id:'harmonize',label:'Suggest harmony/MIDI',requiresApproval:true},
 {id:'stage-sync',label:'Sync Holo lights and stage cues to timeline',requiresApproval:true},
 {id:'reel-cut',label:'Draft short Reel moments from approved takes',requiresApproval:true},
] as const;

export const STAR_STUDIO_PIPELINE=[
 'import/capture approved media','create non-destructive tracks','AI suggests edits',
 'creator previews','creator accepts/rejects','version snapshot','mix/performance render request',
 'rights/provenance check','Reel/StarVerse stage handoff','publish only after creator approval'
] as const;
