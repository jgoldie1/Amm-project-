export type BennyOverlayMode='guide'|'mission'|'scan'|'creator'|'accessibility'|'construct'
export type BennyOverlayState={enabled:boolean;mode:BennyOverlayMode;opacity:number;scanlines:boolean;depthCue:boolean;worldAnchored:boolean;physicalProjection:false}

let state:BennyOverlayState={enabled:true,mode:'guide',opacity:.9,scanlines:true,depthCue:true,worldAnchored:true,physicalProjection:false}
let installed=false
let shell:HTMLDivElement|null=null
let caption:HTMLDivElement|null=null
let pulseTimer:number|undefined

const emit=(name:string,detail:unknown)=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))}
const MODE_COPY:Record<BennyOverlayMode,string>={
 guide:'Benny online • StreetVerse guide ready.',
 mission:'Mission link acquired • follow the Construct beacon.',
 scan:'Avatar Scan • local processing • no identity match.',
 creator:'Creator mode • Reel and Omni tools linked.',
 accessibility:'Accessibility mode • captions and guidance active.',
 construct:'Construct online • world systems linked.',
}

function render(){
 if(typeof document==='undefined')return
 if(!shell){
  shell=document.createElement('div')
  shell.id='tryamm-benny-construct-hologram'
  shell.setAttribute('role','status')
  shell.setAttribute('aria-live','polite')
  Object.assign(shell.style,{position:'fixed',right:'18px',bottom:'86px',zIndex:'2147483000',width:'min(280px,72vw)',padding:'13px 14px',borderRadius:'18px',border:'1px solid rgba(86,232,255,.65)',background:'linear-gradient(145deg,rgba(4,24,39,.88),rgba(20,9,48,.80))',boxShadow:'0 0 32px rgba(61,221,255,.22),inset 0 0 24px rgba(90,90,255,.12)',backdropFilter:'blur(14px) saturate(150%)',color:'#dffaff',fontFamily:'Inter,system-ui,sans-serif',pointerEvents:'none',transformOrigin:'bottom right',transition:'opacity .18s ease,transform .18s ease'})
  const title=document.createElement('div');title.textContent='♀ BENNY • CONSTRUCT';Object.assign(title.style,{fontSize:'11px',fontWeight:'900',letterSpacing:'1.5px',color:'#75edff',marginBottom:'6px'});shell.appendChild(title)
  const body=document.createElement('div');body.textContent='◉';Object.assign(body.style,{float:'left',width:'38px',height:'38px',marginRight:'9px',borderRadius:'50%',border:'1px solid rgba(120,245,255,.75)',display:'grid',placeItems:'center',fontSize:'18px',color:'#9ff8ff',boxShadow:'0 0 18px rgba(80,235,255,.45),inset 0 0 12px rgba(100,90,255,.3)'});shell.appendChild(body)
  caption=document.createElement('div');Object.assign(caption.style,{fontSize:'11px',lineHeight:'1.45',minHeight:'34px'});shell.appendChild(caption)
  const footer=document.createElement('div');footer.textContent='SOFTWARE HOLOGRAM • WORLD-ANCHORED UI';Object.assign(footer.style,{clear:'both',paddingTop:'7px',fontSize:'8px',letterSpacing:'1px',opacity:'.58'});shell.appendChild(footer)
  document.body.appendChild(shell)
 }
 shell.style.display=state.enabled?'block':'none'
 shell.style.opacity=String(state.opacity)
 shell.style.transform=state.enabled?'scale(1) translateY(0)':'scale(.96) translateY(8px)'
 if(caption)caption.textContent=MODE_COPY[state.mode]
 shell.dataset.mode=state.mode
 shell.style.background=state.mode==='mission'?'linear-gradient(145deg,rgba(38,28,3,.90),rgba(28,8,42,.84))':state.mode==='scan'?'linear-gradient(145deg,rgba(2,33,35,.92),rgba(6,12,38,.84))':state.mode==='creator'?'linear-gradient(145deg,rgba(39,8,42,.90),rgba(5,22,42,.84))':'linear-gradient(145deg,rgba(4,24,39,.88),rgba(20,9,48,.80))'
}

export function getBennyConstructOverlay(){return {...state}}
export function setBennyConstructOverlay(patch:Partial<BennyOverlayState>){state={...state,...patch,physicalProjection:false};render();emit('tryamm:benny:construct-overlay-state',{...state,softwareOverlay:true,requiresCompatibleDisplayForPhysicalHologram:true,createdAt:new Date().toISOString()});return getBennyConstructOverlay()}
export function pulseBennyConstructOverlay(context:string){render();if(shell){shell.style.transform='scale(1.035)';if(pulseTimer)window.clearTimeout(pulseTimer);pulseTimer=window.setTimeout(()=>{if(shell)shell.style.transform='scale(1)'},220)}emit('tryamm:benny:construct-pulse',{context,state:getBennyConstructOverlay(),layers:['volumetric-rim','depth-grid','scanline-shell','world-anchor','caption-panel','mission-pointer'],createdAt:new Date().toISOString()})}

export function installBennyConstructHolographicOverlay(){
 if(installed||typeof window==='undefined')return
 installed=true
 render()
 window.addEventListener('tryamm:benny:overlay-request',(event:Event)=>{const detail=(event as CustomEvent<Record<string,unknown>>).detail||{};const context=String(detail.context||'streetverse');setBennyConstructOverlay({enabled:true,mode:context.includes('creator')?'creator':context.includes('scan')?'scan':context.includes('mission')?'mission':'construct'});pulseBennyConstructOverlay(context)})
 window.addEventListener('tryamm:mission:discovered',()=>{setBennyConstructOverlay({enabled:true,mode:'mission'});pulseBennyConstructOverlay('mission')})
 window.addEventListener('tryamm:mission-completed',()=>{setBennyConstructOverlay({enabled:true,mode:'guide'});pulseBennyConstructOverlay('mission-complete')})
 window.addEventListener('tryamm:media-studio-open',()=>{setBennyConstructOverlay({enabled:true,mode:'creator'});pulseBennyConstructOverlay('creator')})
 window.addEventListener('tryamm:avatar-capture-authorized',()=>{setBennyConstructOverlay({enabled:true,mode:'scan'});pulseBennyConstructOverlay('avatar-scan')})
 window.addEventListener('tryamm:avatar-video-ephemeral-complete',()=>{setBennyConstructOverlay({enabled:true,mode:'guide'});pulseBennyConstructOverlay('avatar-scan-complete')})
 window.addEventListener('tryamm:streetverse-enter',()=>{setBennyConstructOverlay({enabled:true,mode:'construct'});pulseBennyConstructOverlay('streetverse-enter')})
 window.addEventListener('tryamm:streetverse-exit',()=>setBennyConstructOverlay({enabled:false}))
 emit('tryamm:benny:construct-overlay-ready',{software:true,physicalProjection:false,layers:['volumetric-rim','depth-grid','scanline-shell','world-anchor','caption-panel','mission-pointer'],accessibility:['captions','high-contrast','reduced-motion-compatible','audio-description-hooks'],modes:Object.keys(MODE_COPY)})
}
