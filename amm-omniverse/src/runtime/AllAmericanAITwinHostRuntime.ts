export type AITwinHostMode='standby'|'prep'|'speaking'|'handoff'
export type AITwinHostSegment={
 id:string;title:string;formatId:string;script:string;sources:Array<{title:string;url:string;publisher?:string;publishedAt?:string}>;
 disclosure:string;approved:boolean;createdAt:string;
}
export type AITwinHostState={
 id:'aan-ai-twin-host';name:string;role:string;synthetic:true;temporaryUntilHumanCast:true;mode:AITwinHostMode;
 voiceEnabled:boolean;captions:boolean;lowerThird:string;currentSegment:AITwinHostSegment|null;humanHostIds:string[];lastSpokenAt:string|null;
}

const validSource=(s:{title?:string;url?:string})=>{try{const u=new URL(String(s.url||''));return u.protocol==='https:'&&Boolean(String(s.title||'').trim())}catch{return false}}
const initial=():AITwinHostState=>({
 id:'aan-ai-twin-host',name:'AAN AI Twin',role:'Temporary Synthetic Broadcast Host',synthetic:true,temporaryUntilHumanCast:true,mode:'standby',
 voiceEnabled:true,captions:true,lowerThird:'AAN AI TWIN • SYNTHETIC HOST',currentSegment:null,humanHostIds:[],lastSpokenAt:null,
})

export function installAllAmericanAITwinHostRuntime(){
 if(typeof window==='undefined')return()=>{}
 let state=initial()
 let utterance:SpeechSynthesisUtterance|null=null
 const emit=(reason:string)=>window.dispatchEvent(new CustomEvent('tryamm:aan-ai-twin-state',{detail:{...state,reason,syntheticDisclosureRequired:true,humanTakeoverPriority:true,noImpersonation:true}}))
 const stopVoice=()=>{try{speechSynthesis.cancel()}catch{};utterance=null}
 const speak=(segment:AITwinHostSegment)=>{
   if(!segment.approved)return
   stopVoice();state={...state,mode:'speaking',currentSegment:segment,lastSpokenAt:new Date().toISOString()};emit('speaking')
   window.dispatchEvent(new CustomEvent('tryamm:broadcast-lower-third',{detail:{text:state.lowerThird,disclosure:'Synthetic/AI-assisted host'}}))
   window.dispatchEvent(new CustomEvent('tryamm:broadcast-captions',{detail:{text:segment.script,source:'aan-ai-twin'}}))
   if(!state.voiceEnabled||!('speechSynthesis'in window))return
   utterance=new SpeechSynthesisUtterance(segment.script)
   utterance.rate=.96;utterance.pitch=.96;utterance.volume=1
   utterance.onend=()=>{state={...state,mode:'standby'};emit('spoken')}
   utterance.onerror=()=>{state={...state,mode:'standby'};emit('voice-error')}
   speechSynthesis.speak(utterance)
 }
 const onPrepare=(event:Event)=>{
   const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
   const sources=Array.isArray(d.sources)?(d.sources as Array<{title:string;url:string;publisher?:string;publishedAt?:string}>).filter(validSource):[]
   const formatId=String(d.formatId||'all-american-news')
   const factual=/news|crypto|business|finance|sports/i.test(formatId)
   const script=String(d.script||'').trim()
   if(!script){window.dispatchEvent(new CustomEvent('tryamm:aan-ai-twin-blocked',{detail:{reason:'script-required'}}));return}
   if(factual&&sources.length===0){window.dispatchEvent(new CustomEvent('tryamm:aan-ai-twin-blocked',{detail:{reason:'sources-required',formatId}}));return}
   const segment:AITwinHostSegment={id:'ai-twin-segment-'+Date.now(),title:String(d.title||'All American Network'),formatId,script,sources,disclosure:'AI/Synthetic host • sources shown for factual segments',approved:d.approved===true,createdAt:new Date().toISOString()}
   state={...state,mode:'prep',currentSegment:segment};emit('prepared')
 }
 const onApprove=()=>{if(!state.currentSegment)return;state={...state,currentSegment:{...state.currentSegment,approved:true}};emit('approved')}
 const onSpeak=()=>{if(state.currentSegment)speak(state.currentSegment)}
 const onVoice=(event:Event)=>{state={...state,voiceEnabled:Boolean((event as CustomEvent<{enabled?:boolean}>).detail?.enabled)};if(!state.voiceEnabled)stopVoice();emit('voice')}
 const onHuman=(event:Event)=>{
   const d=(event as CustomEvent<{hostIds?:string[]}>).detail||{}
   const humanHostIds=Array.isArray(d.hostIds)?d.hostIds.filter(Boolean):[]
   state={...state,humanHostIds}
   if(humanHostIds.length){stopVoice();state={...state,mode:'handoff'};window.dispatchEvent(new CustomEvent('tryamm:aan-ai-twin-handoff',{detail:{toHostIds:humanHostIds,from:'aan-ai-twin-host',reason:'human-host-cast'}}))}
   emit('human-hosts')
 }
 const onStop=()=>{stopVoice();state={...state,mode:'standby',currentSegment:null};emit('stop')}
 const onRequest=()=>emit('request')
 addEventListener('tryamm:aan-ai-twin-prepare',onPrepare)
 addEventListener('tryamm:aan-ai-twin-approve',onApprove)
 addEventListener('tryamm:aan-ai-twin-speak',onSpeak)
 addEventListener('tryamm:aan-ai-twin-voice',onVoice)
 addEventListener('tryamm:aan-human-hosts',onHuman)
 addEventListener('tryamm:aan-ai-twin-stop',onStop)
 addEventListener('tryamm:aan-ai-twin-request',onRequest)
 emit('startup')
 return()=>{stopVoice();removeEventListener('tryamm:aan-ai-twin-prepare',onPrepare);removeEventListener('tryamm:aan-ai-twin-approve',onApprove);removeEventListener('tryamm:aan-ai-twin-speak',onSpeak);removeEventListener('tryamm:aan-ai-twin-voice',onVoice);removeEventListener('tryamm:aan-human-hosts',onHuman);removeEventListener('tryamm:aan-ai-twin-stop',onStop);removeEventListener('tryamm:aan-ai-twin-request',onRequest)}
}