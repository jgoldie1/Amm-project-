const GENERATIONS={
  genx:{label:'Gen X',birthRange:'1965-1980',tone:'direct, practical, low-hype',learning:['step-by-step','real-world examples','clear controls'],channels:['email','web','video'],safety:'adult'},
  millennial:{label:'Millennial',birthRange:'1981-1996',tone:'collaborative, transparent, outcome-focused',learning:['guided workflows','comparison tables','community examples'],channels:['web','mobile','video','podcast'],safety:'adult'},
  genz:{label:'Gen Z',birthRange:'1997-2012',tone:'concise, visual, authentic',learning:['short modules','interactive practice','creator examples'],channels:['mobile','short-video','livestream','chat'],safety:'mixed-age'},
  genalpha:{label:'Gen Alpha',birthRange:'2013-present',tone:'simple, visual, encouraging',learning:['micro-lessons','safe simulations','parent-guided activities'],channels:['mobile','tablet','interactive-video'],safety:'minor'}
};

const CAPABILITIES=['conversation','retrieval','memory','translation','creator-coaching','business-guidance','music-coaching','game-tutoring','accessibility-routing','tool-selection','evaluation'];

function resolveGeneration(input={}){
  const explicit=String(input.generation||'').toLowerCase().replace(/[^a-z]/g,'');
  if(GENERATIONS[explicit])return explicit;
  const year=Number(input.birthYear);
  if(Number.isFinite(year)){
    if(year<=1980)return'genx';
    if(year<=1996)return'millennial';
    if(year<=2012)return'genz';
    return'genalpha';
  }
  return'genx';
}

function profile(input={}){
  const generation=resolveGeneration(input);
  const base=GENERATIONS[generation];
  const minor=generation==='genalpha'||Boolean(input.isMinor);
  return{
    generation,
    ...base,
    minor,
    responseLength:input.responseLength||(['genz','genalpha'].includes(generation)?'short':'medium'),
    accessibility:{oneHanded:Boolean(input.oneHanded),voiceFirst:Boolean(input.voiceFirst),largeControls:Boolean(input.largeControls),reducedMotion:Boolean(input.reducedMotion)},
    interests:Array.isArray(input.interests)?input.interests.slice(0,20):[],
    language:String(input.language||'en').slice(0,12),
    parentalConsent:minor?Boolean(input.parentalConsent):null,
    personalizationConsent:Boolean(input.personalizationConsent)
  };
}

function systemInstructions(userProfile,context={}){
  const p=profile(userProfile);
  const rules=[
    `Adapt for ${p.label} using a ${p.tone} style.`,
    `Preferred learning: ${p.learning.join(', ')}.`,
    `Use ${p.responseLength} responses unless detail is requested.`,
    'Do not stereotype; generation is only a user-selected communication preference.',
    'State uncertainty and never claim human-level AGI, consciousness, or guaranteed correctness.',
    'Use approved retrieval, consented memory, and authorized tools only.',
    'Require confirmation before payments, publishing, account changes, legal filings, or destructive actions.',
    p.accessibility.oneHanded?'Prefer one-handed controls and minimal typing.':'',
    p.accessibility.voiceFirst?'Offer voice-first directions and read-aloud-friendly structure.':'',
    p.accessibility.reducedMotion?'Avoid motion-heavy instructions and flashing effects.':'',
    p.minor?'Apply youth-safe defaults, age-appropriate language, restricted commerce, and guardian controls.':'',
    p.minor&&!p.parentalConsent?'Do not enable personalized advertising, public messaging, location sharing, purchases, or persistent behavioral profiling.':'',
    context.faithMode?'Use respectful Yahavah, Yahusha Ha Mashiach, and Ruach terminology while separating Scripture, interpretation, and fiction.':''
  ].filter(Boolean);
  return rules.join(' ');
}

function routeTask(input={}){
  const task=String(input.task||'').toLowerCase();
  const routes=[];
  if(/music|vocal|mix|master|beat|song/.test(task))routes.push('quantum-vocal-studio');
  if(/money|payment|transfer|fx|wallet|escrow/.test(task))routes.push('aniyah-crossborder','wallet');
  if(/game|arena|npc|quest|controller/.test(task))routes.push('game-intelligence');
  if(/store|product|shop|marketplace/.test(task))routes.push('immersive-commerce');
  if(/learn|academy|course|teach/.test(task))routes.push('streaming-academy');
  if(/legal|tax|compliance|contract/.test(task))routes.push('global-compliance');
  if(/create|video|stream|reel|drama/.test(task))routes.push('creator-portal');
  return{routes:[...new Set(routes.length?routes:['amm-intelligence'])],requiresConfirmation:/pay|send|publish|delete|sign|file|transfer/.test(task)};
}

function evaluateResponse({answer='',profile:inputProfile={},requiredFacts=[],forbiddenClaims=[]}={}){
  const p=profile(inputProfile);const text=String(answer);const findings=[];
  if(!text.trim())findings.push({severity:'high',code:'empty'});
  for(const fact of requiredFacts)if(!text.toLowerCase().includes(String(fact).toLowerCase()))findings.push({severity:'medium',code:'missing-fact',fact});
  for(const claim of forbiddenClaims)if(text.toLowerCase().includes(String(claim).toLowerCase()))findings.push({severity:'high',code:'forbidden-claim',claim});
  if(p.minor&&/(gambling|adult content|send money now)/i.test(text))findings.push({severity:'high',code:'youth-safety'});
  if(/i am conscious|human-level agi|guaranteed accurate/i.test(text))findings.push({severity:'high',code:'agi-overclaim'});
  return{passed:!findings.some(f=>f.severity==='high'),score:Math.max(0,1-findings.length*.15),findings};
}

module.exports={GENERATIONS,CAPABILITIES,resolveGeneration,profile,systemInstructions,routeTask,evaluateResponse};
