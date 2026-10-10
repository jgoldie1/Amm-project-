export type EditorIntent='tighten'|'reframe'|'caption'|'translate'|'clean-audio'|'mix'|'beat-sync'|'color-suggest'|'find-highlight'|'reel-cut'|'longform-cut'|'stage-sync'|'accessibility-pass';
export type EditProposal={id:string;intent:EditorIntent;summary:string;operations:string[];destructive:false;confidence:number;requiresApproval:true;};
export type EditVersion={id:string;parentId?:string;label:string;createdAt:string;proposalIds:string[];published:false;};

export const AI_ASSISTANT_EDITOR_RULES=[
 'never overwrite source media','every AI change is a previewable proposal',
 'creator can accept/reject individual operations','keep version history and restore points',
 'show why a highlight/cut was suggested','do not fabricate spoken words in captions/transcripts',
 'translation is labeled and previewed before publishing','preserve creator rights/provenance metadata',
 'no payable earnings mutation from editor clients','accessible editing has equivalent voice/touch/one-hand/gaze/switch paths'
] as const;

export const AI_EDITOR_COMMANDS=[
 {intent:'tighten',example:'Tighten this performance but keep my full chorus.'},
 {intent:'find-highlight',example:'Find my three strongest moments for a Reel.'},
 {intent:'clean-audio',example:'Clean the vocal and reduce background noise without changing my voice.'},
 {intent:'beat-sync',example:'Cut the camera changes to the beat.'},
 {intent:'stage-sync',example:'Build Holo lighting cues around the hook.'},
 {intent:'caption',example:'Create accurate captions and flag uncertain words for me.'},
 {intent:'translate',example:'Prepare approved-language subtitle drafts for global distribution.'},
 {intent:'accessibility-pass',example:'Create captions, readable overlays and reduced-motion alternatives.'}
] as const;

export const AI_EDITOR_PIPELINE=[
 'creator intent','inspect selected media/timeline range','rights + safety gate','draft edit plan',
 'generate non-destructive proposals','preview A/B','creator accepts/rejects','create version snapshot',
 'render request','quality/accessibility check','creator publish approval','Reel/StarVerse/distribution handoff'
] as const;
