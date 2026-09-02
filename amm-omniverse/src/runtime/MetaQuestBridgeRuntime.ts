let installed=false

type QuestState={
  secure:boolean
  xrAvailable:boolean
  immersiveVR:boolean
  immersiveAR:boolean
  handTracking:boolean
  questLike:boolean
  mode:'screen-3d'|'webxr-ready'|'immersive-vr'
  lastError?:string
}

const STATE_KEY='tryamm_meta_quest_bridge_v1'

function emit(name:string,detail:any={}){window.dispatchEvent(new CustomEvent(name,{detail}))}
function isQuestLike(){const ua=navigator.userAgent||'';return /Quest|OculusBrowser/i.test(ua)}
async function supported(mode:'immersive-vr'|'immersive-ar'){
  try{const xr=(navigator as any).xr;if(!xr?.isSessionSupported)return false;return Boolean(await xr.isSessionSupported(mode))}catch{return false}
}
async function readState():Promise<QuestState>{
  const xrAvailable=Boolean((navigator as any).xr)
  const immersiveVR=xrAvailable?await supported('immersive-vr'):false
  const immersiveAR=xrAvailable?await supported('immersive-ar'):false
  const handTracking=xrAvailable&&typeof (window as any).XRHand!=='undefined'
  const questLike=isQuestLike()
  return {secure:window.isSecureContext,xrAvailable,immersiveVR,immersiveAR,handTracking,questLike,mode:immersiveVR?'webxr-ready':'screen-3d'}
}
function persist(s:QuestState){try{localStorage.setItem(STATE_KEY,JSON.stringify({...s,checkedAt:new Date().toISOString()}))}catch{};emit('tryamm:meta-quest-state',s)}
function styleButton(b:HTMLElement){Object.assign(b.style,{border:'1px solid #72e5ff88',borderRadius:'999px',padding:'9px 12px',background:'#092338',color:'#fff',fontWeight:'900',cursor:'pointer'})}
function renderPanel(s:QuestState){
  let p=document.getElementById('tryamm-meta-quest') as HTMLDivElement|null
  if(!p){p=document.createElement('div');p.id='tryamm-meta-quest';Object.assign(p.style,{position:'fixed',right:'14px',bottom:'14px',zIndex:'2147482700',width:'min(350px,88vw)',padding:'12px',borderRadius:'16px',background:'rgba(3,11,21,.95)',border:'1px solid rgba(114,229,255,.45)',color:'#fff',font:'800 11px system-ui',boxShadow:'0 18px 50px #000a'});document.body.appendChild(p)}
  p.innerHTML=`<div style="color:#72e5ff;font-size:10px;letter-spacing:.12em">META QUEST / WEBXR BRIDGE</div><div style="font-size:15px;margin:5px 0">${s.immersiveVR?'QUEST VR READY':'QUEST SCREEN MODE READY'}</div><div style="opacity:.75;line-height:1.5">HTTPS ${s.secure?'✓':'✕'} • WebXR ${s.xrAvailable?'✓':'✕'} • immersive VR ${s.immersiveVR?'✓':'✕'} • passthrough AR ${s.immersiveAR?'✓':'✕'} • hand API ${s.handTracking?'✓':'—'}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:9px"><button id="mq-open">OPEN STREETVERSE</button>${s.immersiveVR?'<button id="mq-enter">ENTER QUEST VR</button>':''}<button id="mq-hide">HIDE</button></div><div style="font-size:9px;opacity:.6;margin-top:8px">Uses runtime feature detection. Store publication still requires Meta developer organization verification, packaging/review and applicable VRC checks.</div>`
  p.querySelectorAll('button').forEach(x=>styleButton(x as HTMLElement))
  p.querySelector('#mq-open')?.addEventListener('click',()=>emit('tryamm:command',{action:'open-streetverse',source:'meta-quest'}))
  p.querySelector('#mq-enter')?.addEventListener('click',()=>emit('tryamm:meta-quest-request-immersive',{mode:'immersive-vr'}))
  p.querySelector('#mq-hide')?.addEventListener('click',()=>p?.remove())
}

export async function installMetaQuestBridgeRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  const state=await readState();persist(state)
  if(state.questLike||state.xrAvailable)renderPanel(state)
  window.addEventListener('tryamm:meta-quest-show',()=>renderPanel(state))
  window.addEventListener('tryamm:meta-quest-session-start',(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};persist({...state,mode:'immersive-vr'});emit('tryamm:omniverse-submit',{source:'meta-quest',type:'xr.session.started',title:'Meta Quest immersive session started',metadata:d})})
  window.addEventListener('tryamm:meta-quest-controller',(e:Event)=>emit('tryamm:game-input',{source:'meta-quest-controller',...(e as CustomEvent<any>).detail}))
  window.addEventListener('tryamm:meta-quest-hand',(e:Event)=>emit('tryamm:game-input',{source:'meta-quest-hand',...(e as CustomEvent<any>).detail}))
  queueMicrotask(()=>emit('tryamm:meta-quest-ready',{...state,webxrPath:true,pwaPath:true,nativeQuestPath:true}))
}
