export type PlatformArea={id:string;name:string;status:'source-created'|'wired'|'preview-ready'|'provider-gated'|'device-gated'|'planned';includes:string[]}

export const CANONICAL_PLATFORM_INVENTORY:PlatformArea[]=[
{id:'social-live',name:'TRYAMM Social + LIVE',status:'wired',includes:['vertical feed','LIVE rooms','PK battles','chat','agencies/family groups','moderation','Holo Gifts','AR/VR gifts','Face Gifts','Global Gift Passport','Holo Clip','cross-platform sharing']},
{id:'creator-ai',name:'Poyo AI Studio MAX + HoloGPT',status:'wired',includes:['multi-engine image/video/music/voice/chat/3D routing','creator studio','Holo Social','media handoff','JARVIS orchestration']},
{id:'tv',name:'TRYAMM TV / Omni Box',status:'wired',includes:['Isaiah AI TV','All American Network TV','Servants of Christ TV','LIVE→replay→episode→podcast→clips','captions','audio description','translation','watchlists']},
{id:'networks',name:'TRYAMM Networks',status:'wired',includes:['All American Network','Servants of Christ Network','creator channels','faith channels','sports/news/local TV','global programming']},
{id:'games',name:'GameVerse',status:'source-created',includes:['StreetVerse','Gridiron X','Court Kings','Diamond Legends','Ice Storm','World Pitch','Fight Night Holo','Battlefront Zero','Yogihoo Arena','Volcano Racers','Kingdom Builders']},
{id:'worlds',name:'Living Worlds',status:'wired',includes:['StreetVerse','My World','Kingdom','Mars','StarVerse','Holoverse','persistent avatar/XP/inventory/checkpoints']},
{id:'access',name:'Universal Accessibility + HoloLingo',status:'wired',includes:['Accessibility Passport','one-hand mode','voice navigation','switch access','screen reader','large targets/text','high contrast','reduced motion','captions/transcripts','audio description','speech↔text','plain language','sign language hub','global language runtime']},
{id:'wearables',name:'OmniWear',status:'provider-gated',includes:['watch','band','ring','glasses','clothing','glove','vest','suit','mobility','sensor','haptics','XR','non-invasive accessibility controls']},
{id:'communications',name:'TRYAMM Connect',status:'wired',includes:['Holo Fon','Quantum Email','chat/messaging','AI call center architecture','cross-device command surface']},
{id:'commerce',name:'Commerce + Marketplace',status:'wired',includes:['marketplace','BusinessVerse','Holo Marketplace','Holo Delivery','Neighborhood Commerce','Virtual Warehouse','Holo Fridge','creator commerce','advertising/sponsorship intents']},
{id:'payments',name:'Wallet + Payments',status:'provider-gated',includes:['Money Engine','double-entry ledger','Holo Credit architecture','wallet','Aniyah Cross-Border Pay','provider/KYC/AML/sanctions gates']},
{id:'family',name:'Family Legacy Ventures',status:'wired',includes:['Jacobie Vision Cybersecurity','Jacobie Vision Real Estate/House Flipping','Isaiah AI TV','StarVerse','Aniyah 64-Track Studio','Aniyah Cross-Border Pay','Greenville University / Class of 31','Family Legacy Hub']},
{id:'education',name:'Education',status:'wired',includes:['All American University','School Network','creator/skills training','accessible learning']},
{id:'security',name:'Security + Jacobie Vision',status:'wired',includes:['defensive security','threat modeling','privacy/compliance readiness','cyber labs','Security Center']},
{id:'real-estate',name:'Property + Real Estate',status:'wired',includes:['PropertyVerse concepts','house flipping analysis','land/rental/development analysis','HUD/Section 8 architecture','environmental property categories']},
{id:'music',name:'Music + Audio',status:'wired',includes:['HoloMusic','Pro Audio','Quantum Beat','Aniyah 64-Track Studio','creator music','podcasts','label/showcase workflows']},
{id:'space',name:'SpaceOS + Advanced Worlds',status:'source-created',includes:['flight/space simulation','Mars','planetary missions','SPICE-oriented navigation architecture','crew progression']},
{id:'developer',name:'Developer + Build Systems',status:'source-created',includes:['AMM Developer Platform','Build Swarm','Holo Core','Quantum Engine','integration registries','release/health tooling']},
{id:'regional',name:'Global / Asia Expansion',status:'source-created',includes:['LINE','WeChat','Douyin','Xiaohongshu/RED','Bilibili','QQ','KakaoTalk','Naver','Zalo','Grab','Gojek','PayPay','Rakuten','Mercari','global share targets']},
{id:'orchestration',name:'JARVIS',status:'wired',includes:['HoloGPT-facing orchestration','open LIVE','open Poyo','open games','open StreetVerse','open accessibility/sign/wearables','open TV/networks','open family ventures','open security','open media/share']}
]

export const RELEASE_TRUTH=['DESIGNED','SOURCE-CREATED','DB-CREATED','API-WIRED','TESTED','DEPLOYED','LIVE','REAL-DEVICE-PROVEN'] as const
