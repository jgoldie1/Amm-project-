let installed=false

const isPhone=()=>typeof window!=='undefined'&&(matchMedia('(pointer:coarse)').matches||/iPhone|iPod|Android.+Mobile/i.test(navigator.userAgent))
const fire=(type:'keydown'|'keyup',key:string)=>window.dispatchEvent(new KeyboardEvent(type,{key,bubbles:true,cancelable:true}))

function addButton(parent:HTMLElement,label:string,key:string,style:Partial<CSSStyleDeclaration>={}){
  const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-label',label)
  Object.assign(b.style,{width:'62px',height:'62px',borderRadius:'18px',border:'1px solid rgba(126,229,255,.65)',background:'rgba(3,12,24,.88)',color:'#fff',font:'800 22px system-ui',boxShadow:'0 8px 28px rgba(0,0,0,.38)',touchAction:'none',userSelect:'none',WebkitUserSelect:'none',...style})
  const down=(e:Event)=>{e.preventDefault();fire('keydown',key)};const up=(e:Event)=>{e.preventDefault();fire('keyup',key)}
  b.addEventListener('pointerdown',down,{passive:false});b.addEventListener('pointerup',up,{passive:false});b.addEventListener('pointercancel',up,{passive:false});b.addEventListener('pointerleave',up,{passive:false})
  parent.appendChild(b);return b
}

function mount(){
  if(!isPhone()||document.getElementById('tryamm-streetverse-mobile-controls'))return
  const root=document.createElement('div');root.id='tryamm-streetverse-mobile-controls';root.setAttribute('aria-label','StreetVerse mobile game controls')
  Object.assign(root.style,{position:'fixed',inset:'0',zIndex:'2147482500',pointerEvents:'none',fontFamily:'system-ui',padding:'max(10px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left))',boxSizing:'border-box'})
  const pad=document.createElement('div');Object.assign(pad.style,{position:'absolute',left:'max(12px,env(safe-area-inset-left))',bottom:'max(18px,env(safe-area-inset-bottom))',width:'190px',height:'190px',pointerEvents:'auto'})
  const pos=(x:string,y:string)=>({position:'absolute',left:x,top:y} as Partial<CSSStyleDeclaration>)
  addButton(pad,'▲','ArrowUp',pos('64px','0'));addButton(pad,'◀','ArrowLeft',pos('0','64px'));addButton(pad,'▶','ArrowRight',pos('128px','64px'));addButton(pad,'▼','ArrowDown',pos('64px','128px'))
  const actions=document.createElement('div');Object.assign(actions.style,{position:'absolute',right:'max(12px,env(safe-area-inset-right))',bottom:'max(22px,env(safe-area-inset-bottom))',display:'grid',gap:'12px',pointerEvents:'auto',justifyItems:'end'})
  const action=addButton(actions,'ACT','e',{width:'76px',height:'76px',borderRadius:'50%',fontSize:'16px',background:'rgba(8,76,98,.92)'})
  action.setAttribute('aria-label','Interact enter exit vehicle or building')
  addButton(actions,'RUN','Shift',{width:'70px',height:'52px',fontSize:'14px'})
  const hint=document.createElement('div');hint.textContent='PHONE PLAY • MOVE  ACT  RUN';Object.assign(hint.style,{position:'absolute',left:'50%',transform:'translateX(-50%)',bottom:'max(8px,env(safe-area-inset-bottom))',padding:'6px 10px',borderRadius:'999px',background:'rgba(0,0,0,.58)',color:'#dff9ff',font:'700 10px system-ui',letterSpacing:'.08em',pointerEvents:'none',whiteSpace:'nowrap'})
  root.append(pad,actions,hint);document.body.appendChild(root)
  document.documentElement.dataset.tryammMobilePlay='true'
  window.dispatchEvent(new CustomEvent('tryamm:mobile-play-ready',{detail:{touchControls:true,phoneMode:true,questRequired:false}}))
}

function shouldShow(){return Boolean(document.querySelector('canvas'))&&/streetverse/i.test(document.body.innerText||'')}
function sync(){const existing=document.getElementById('tryamm-streetverse-mobile-controls');if(isPhone()&&shouldShow()){if(!existing)mount()}else existing?.remove()}

export function installStreetVerseMobilePlayRuntime(){
  if(installed||typeof window==='undefined')return;installed=true
  const meta=document.querySelector('meta[name="viewport"]') as HTMLMetaElement|null;if(meta&&!/viewport-fit/.test(meta.content))meta.content=`${meta.content}, viewport-fit=cover`
  const observer=new MutationObserver(()=>sync());observer.observe(document.documentElement,{childList:true,subtree:true});sync();window.addEventListener('resize',sync);window.addEventListener('orientationchange',sync)
}
