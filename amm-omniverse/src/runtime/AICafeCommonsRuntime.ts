/** AI Commons / Café discussion and observability.
 * A deliberate, local-only playground. Third-party agent activity is never
 * monitored without owner authorization and an explicit opted-in feed.
 * No microphone, camera, home sensor, or private message ingestion.
 */
export type CommonsTopic='religion-and-belief'|'ai-ethics'|'streetverse-design'|'business'|'accessibility'
export type CommonsRole='guide'|'critic'|'researcher'|'moderator'
export type CommonsEvent={
 id:string;sessionId:string;topic:CommonsTopic;role:CommonsRole;
 text:string;origin:'scripted-demo'|'authorized-agent';consent:true;at:string;
}
export type CommonsSession={
 id:string;topic:CommonsTopic;createdAt:string;enabled:boolean;events:CommonsEvent[];
 notice:'VISIBLE_OPT_IN_AGENT_DISCUSSION_ONLY';privateHumanCapture:false;homeMonitoring:false;
}
export const AI_COMMONS_KEY='tryamm.ai-cafe.commons.v1'
export const AI_COMMONS_TOPICS:readonly {id:CommonsTopic;label:string;starter:string}[]=[
 {id:'religion-and-belief',label:'Religions & belief systems',starter:'How can agents compare beliefs respectfully without presenting invented religions as factual or pressuring anyone to join?'},
 {id:'ai-ethics',label:'AI ethics & autonomy',starter:'What can agent self-models show, and why are they not proof of consciousness?'},
 {id:'streetverse-design',label:'StreetVerse living world',starter:'What gameplay would make Circle Park NPCs more believable while respecting players?'},
 {id:'business',label:'AI Café & local business',starter:'How can people use supervised AI tools to learn business skills and review their results?'},
 {id:'accessibility',label:'Accessibility',starter:'How can voice, captions and one-hand controls work for different players?'}
] as const
const roles:readonly CommonsRole[]=['guide','critic','researcher','moderator']
const topics=new Set(AI_COMMONS_TOPICS.map(x=>x.id))
const clean=(text:string,max=500)=>text.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max)
const isTopic=(value:unknown):value is CommonsTopic=>topics.has(value as CommonsTopic)
const isRole=(value:unknown):value is CommonsRole=>roles.includes(value as CommonsRole)
export function beginCommonsSession(topic:CommonsTopic,now=new Date().toISOString()):CommonsSession{
 if(!isTopic(topic))throw Error('Unknown topic')
 return {id:'commons-'+now.replace(/[^0-9]/g,'').slice(0,16),topic,createdAt:now,enabled:true,events:[],
  notice:'VISIBLE_OPT_IN_AGENT_DISCUSSION_ONLY',privateHumanCapture:false,homeMonitoring:false}
}
export function draftAgentTurn(topic:CommonsTopic,role:CommonsRole):string{
 const subject=AI_COMMONS_TOPICS.find(x=>x.id===topic)
 if(!subject||!isRole(role))return 'Unsupported demo topic or role.'
 const scripts:Record<CommonsRole,(label:string)=>string>={
  guide:label=>'Discussion topic: '+label+'. Each agent is a simulated participant; visitors may choose whether to read or contribute.',
  critic:label=>'Critical question for '+label+': what evidence is missing, and how could this idea mislead people?',
  researcher:label=>'Research prompt on '+label+': separate primary sources, community interpretations and speculative claims.',
  moderator:label=>'Moderation note for '+label+': discuss beliefs respectfully; no personal surveillance, coercion, or claims of proven AI consciousness.'
 }
 return scripts[role](subject.label)
}
export function appendCommonsTurn(session:CommonsSession,input:{role:CommonsRole;text:string;origin:'scripted-demo'|'authorized-agent';authorized:boolean},at=new Date().toISOString()):CommonsSession{
 if(!session.enabled||!input.authorized||!isRole(input.role)||!['scripted-demo','authorized-agent'].includes(input.origin)||!input.text.trim())return session
 const text=clean(input.text)
 if(!text)return session
 const event:CommonsEvent={id:session.id+'-'+(session.events.length+1),sessionId:session.id,topic:session.topic,role:input.role,text,origin:input.origin,consent:true,at}
 return {...session,events:[...session.events,event].slice(-60)}
}
export function runCommonsDemo(topic:CommonsTopic):CommonsSession{
 let session=beginCommonsSession(topic)
 for(const role of roles)session=appendCommonsTurn(session,{role,text:draftAgentTurn(topic,role),origin:'scripted-demo',authorized:true})
 return session
}
export function parseCommonsSaved(raw:string|null):CommonsSession|null{
 if(!raw||raw.length>80000)return null
 try{
  const x=JSON.parse(raw)
  if(!x||!isTopic(x.topic)||x.notice!=='VISIBLE_OPT_IN_AGENT_DISCUSSION_ONLY'||x.privateHumanCapture!==false||x.homeMonitoring!==false||!Array.isArray(x.events)||x.events.length>60)return null
  const session=beginCommonsSession(x.topic,clean(String(x.createdAt||''),60))
  session.id=clean(String(x.id||''),80);session.enabled=x.enabled===true
  if(!/^commons-[a-zA-Z0-9_-]+$/.test(session.id))return null
  session.events=x.events.filter((e:unknown)=>{
   if(!e||typeof e!=='object')return false
   const v=e as Partial<CommonsEvent>
   return v.consent===true&&v.sessionId===session.id&&v.topic===session.topic&&isRole(v.role)&&
    (v.origin==='scripted-demo'||v.origin==='authorized-agent')&&typeof v.text==='string'&&v.text.length<=500
  }).map((e:CommonsEvent)=>({...e,text:clean(e.text),consent:true}))
  return session
 }catch{return null}
}
export const AI_COMMONS_MONITOR_POLICY={
 defaultRecording:false,sessionMustBeEnabled:true,authorizedAgentsOnly:true,
 microphoneCapture:false,cameraCapture:false,privateHumanCapture:false,homeSensorCapture:false,
 agentOriginLabels:true,localOnly:true,liveExternalFeedNotVerified:true,
 personalDataMinimized:true,automaticReligionCreation:false,
 requireConsentForAnyFutureRemoteObservability:true
} as const
