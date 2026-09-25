export type CreatorEngineKind='image'|'video'|'music'|'chat'|'3d'|'tool'|'speech'
export type CreatorEngine={provider:string;label:string;model:string;kinds:CreatorEngineKind[];capabilities:string[];tier:'fast'|'balanced'|'premium'|'specialist'}

export const CREATOR_ENGINES:CreatorEngine[]=[
  {provider:'OpenAI',label:'GPT Image 2',model:'gpt-image-2',kinds:['image'],capabilities:['text-to-image','image-edit'],tier:'premium'},
  {provider:'OpenAI',label:'Sora 2 Official',model:'sora-2-official',kinds:['video'],capabilities:['text-to-video','image-to-video'],tier:'premium'},
  {provider:'OpenAI',label:'GPT-5.6',model:'gpt-5-6',kinds:['chat'],capabilities:['chat','code','agents'],tier:'premium'},
  {provider:'Google',label:'Nano Banana Pro',model:'nano-banana-pro',kinds:['image'],capabilities:['text-to-image','image-edit','reference-image'],tier:'premium'},
  {provider:'Google',label:'Nano Banana 2',model:'nano-banana-2-api',kinds:['image'],capabilities:['text-to-image','image-edit'],tier:'balanced'},
  {provider:'Google',label:'Veo 3.1',model:'veo-3-1',kinds:['video'],capabilities:['text-to-video','image-to-video','audio'],tier:'premium'},
  {provider:'Google',label:'Gemini 3.7 Flash',model:'gemini-3-7-flash',kinds:['chat'],capabilities:['chat','multimodal'],tier:'fast'},
  {provider:'Google',label:'Gemini 3.1 Flash TTS',model:'gemini-3-1-flash-tts',kinds:['speech'],capabilities:['text-to-speech'],tier:'fast'},
  {provider:'Kling',label:'Kling 3.0',model:'kling-3-api',kinds:['video'],capabilities:['text-to-video','image-to-video','storyboard'],tier:'premium'},
  {provider:'Kling',label:'Kling 3.0 Motion Control',model:'kling-3-0-motion-control',kinds:['video'],capabilities:['motion-control','character-animation'],tier:'specialist'},
  {provider:'Kling',label:'Kling Avatar 2.0',model:'kling-avatar-2-0',kinds:['video'],capabilities:['talking-avatar','character-animation'],tier:'specialist'},
  {provider:'Seedance',label:'Seedance 2.5',model:'seedance-2-5',kinds:['video'],capabilities:['text-to-video','image-to-video','multimodal-reference','audio'],tier:'premium'},
  {provider:'Seedance',label:'Seedance 2',model:'seedance-2',kinds:['video'],capabilities:['text-to-video','image-to-video'],tier:'balanced'},
  {provider:'Alibaba',label:'Qwen Image 3.0',model:'qwen-image-3',kinds:['image'],capabilities:['text-to-image','image-edit'],tier:'balanced'},
  {provider:'Alibaba',label:'Wan 2.7 Video',model:'wan-2-7-video',kinds:['video'],capabilities:['text-to-video','image-to-video'],tier:'balanced'},
  {provider:'Black Forest Labs',label:'FLUX 3',model:'flux-3',kinds:['image','video'],capabilities:['text-to-image','reference-image','video'],tier:'premium'},
  {provider:'Black Forest Labs',label:'Flux Kontext',model:'flux-kontext',kinds:['image'],capabilities:['image-edit','reference-image'],tier:'specialist'},
  {provider:'MiniMax',label:'MiniMax H3 / Hailuo 03',model:'minimax-h3',kinds:['video'],capabilities:['text-to-video','image-to-video','first-last-frame','audio-reference'],tier:'balanced'},
  {provider:'MiniMax',label:'MiniMax Music 2.6',model:'minimax-music-2-6',kinds:['music'],capabilities:['text-to-music','song-generation'],tier:'balanced'},
  {provider:'Runway',label:'Runway Gen-4.5',model:'runway-gen-4-5',kinds:['video'],capabilities:['text-to-video','image-to-video'],tier:'premium'},
  {provider:'xAI',label:'Grok Imagine Image 2.0',model:'grok-imagine-image-2-0',kinds:['image'],capabilities:['text-to-image'],tier:'balanced'},
  {provider:'xAI',label:'Grok Imagine Video 1.5',model:'grok-imagine-video-1-5',kinds:['video'],capabilities:['text-to-video','image-to-video'],tier:'balanced'},
  {provider:'xAI',label:'xAI TTS 1',model:'xai-tts-1',kinds:['speech'],capabilities:['text-to-speech'],tier:'fast'},
  {provider:'Anthropic',label:'Claude Sonnet 5',model:'claude-sonnet-5',kinds:['chat'],capabilities:['chat','code','agents'],tier:'premium'},
  {provider:'Anthropic',label:'Claude Opus 5',model:'claude-opus-5',kinds:['chat'],capabilities:['chat','reasoning'],tier:'premium'},
  {provider:'DeepSeek',label:'DeepSeek V4 Pro',model:'deepseek-v4-pro',kinds:['chat'],capabilities:['chat','code'],tier:'balanced'},
  {provider:'Moonshot AI',label:'Kimi K3',model:'kimi-k3',kinds:['chat'],capabilities:['chat','agents'],tier:'balanced'},
  {provider:'ElevenLabs',label:'ElevenLabs Music',model:'elevenlabs-music',kinds:['music'],capabilities:['text-to-music'],tier:'premium'},
  {provider:'ElevenLabs',label:'ElevenLabs V3 TTS',model:'elevenlabs-v3-tts',kinds:['speech'],capabilities:['text-to-speech'],tier:'premium'},
  {provider:'Meshy',label:'Meshy 6 3D',model:'meshy-6',kinds:['3d'],capabilities:['text-to-3d','image-to-3d','multi-image-to-3d'],tier:'premium'},
  {provider:'Tripo3D',label:'Tripo3D H3.1',model:'tripo3d-h3-1',kinds:['3d'],capabilities:['text-to-3d','image-to-3d','multiview-to-3d'],tier:'premium'},
  {provider:'Tripo3D',label:'Tripo3D P1',model:'tripo3d-p1',kinds:['3d'],capabilities:['text-to-3d','image-to-3d','low-poly'],tier:'balanced'},
  {provider:'Hunyuan',label:'Hunyuan 3D v3.1',model:'hunyuan-3d-v3-1',kinds:['3d'],capabilities:['text-to-3d','image-to-3d'],tier:'balanced'},
  {provider:'PoYo',label:'Video Background Removal',model:'poyo-ai/video-background-removal',kinds:['tool'],capabilities:['background-removal'],tier:'specialist'},
  {provider:'PoYo',label:'Video Upscaler',model:'poyo-ai/video-upscaler',kinds:['tool'],capabilities:['video-upscale'],tier:'specialist'},
  {provider:'PoYo',label:'Image Translator',model:'image-translator',kinds:['tool'],capabilities:['image-translation'],tier:'specialist'},
  {provider:'PoYo',label:'Video Translator',model:'video-translator',kinds:['tool'],capabilities:['video-translation'],tier:'specialist'},
  {provider:'PoYo',label:'AI Music',model:'ai-music',kinds:['music'],capabilities:['text-to-music'],tier:'balanced'},
  {provider:'PoYo',label:'Generate Lyrics',model:'generate-lyrics',kinds:['music'],capabilities:['lyrics'],tier:'fast'},
  {provider:'PoYo',label:'Vocal Remover',model:'separate-vocals',kinds:['tool','music'],capabilities:['stem-separation','vocal-removal'],tier:'specialist'},
]

export function enginesFor(kind:CreatorEngineKind){return CREATOR_ENGINES.filter(engine=>engine.kinds.includes(kind))}


export type OmniBoxVisualMedium =
  | 'photoreal-human'
  | 'cinematic-live-action'
  | 'anime'
  | 'cartoon-2d'
  | 'animation-3d'
  | 'comic-graphic-novel'
  | 'clay-stop-motion'
  | 'fantasy'
  | 'sci-fi'
  | 'game-cinematic'
  | 'mixed-media'
  | 'holographic'

export const OMNIBOX_MOVIE_CAPABILITIES = {
  workflow: ['idea','script','storyboard','character-bible','scene-bible','voice','music','sfx','generate','edit','render','omnibox','distribute'],
  formats: ['reel','short-film','episode','feature-film','music-video','animation','holographic-video','holographic-animation'],
  media: ['2d','3d','stereoscopic','spatial','volumetric','transparent-layer','depth-map','alpha-video'],
  continuity: ['persistent-characters','persistent-locations','wardrobe-continuity','voice-continuity','style-continuity'],
  outputs: ['9:16','16:9','1:1','cinema','spatial-display','holo-stage'],
  distribution: ['tryamm-reels','omnibox','isaiah-ai-tv','all-american-network','servants-of-christ-network','free-global-tv','holo-theater-ppv'],
  safeguards: ['real-person-likeness-consent','voice-consent','synthetic-media-disclosure','provenance-metadata','minor-safety','rights-metadata'],
} as const

export const OMNIBOX_VISUAL_MEDIA:ReadonlyArray<{id:OmniBoxVisualMedium;label:string;description:string}> = [
  {id:'photoreal-human',label:'Photoreal Human',description:'Human-looking cinematic characters and performances with consent controls for real-person likenesses.'},
  {id:'cinematic-live-action',label:'Cinematic Live Action',description:'Film-style scenes, lighting, lenses and camera movement.'},
  {id:'anime',label:'Anime',description:'Anime-inspired character and environment animation.'},
  {id:'cartoon-2d',label:'2D Cartoon',description:'Illustrated and hand-drawn-style animation workflows.'},
  {id:'animation-3d',label:'3D Animation',description:'CG characters, environments and animated camera scenes.'},
  {id:'comic-graphic-novel',label:'Comic / Graphic Novel',description:'Panel, ink and graphic-novel visual treatments.'},
  {id:'clay-stop-motion',label:'Clay / Stop Motion',description:'Tactile miniature and frame-animation looks.'},
  {id:'fantasy',label:'Fantasy',description:'Stylized fantasy worlds, creatures and effects.'},
  {id:'sci-fi',label:'Sci-Fi',description:'Futuristic worlds, vehicles, interfaces and effects.'},
  {id:'game-cinematic',label:'Game Cinematic',description:'Realtime-game-inspired cinematic sequences.'},
  {id:'mixed-media',label:'Mixed Media',description:'Blend live action, animation, illustration and generated media scene by scene.'},
  {id:'holographic',label:'Holographic / Spatial',description:'Depth-aware, transparent, stereoscopic or volumetric-ready video and animation outputs for Holo experiences.'},
]
