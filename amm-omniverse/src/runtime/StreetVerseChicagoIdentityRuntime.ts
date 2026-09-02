let installed=false
const ID='tryamm-streetverse-chicago-identity'

function css(el:HTMLElement,styles:Partial<CSSStyleDeclaration>){Object.assign(el.style,styles)}
function isChicagoRoute(){const h=location.hash.replace(/^#/,'');return h==='/streetverse'||h==='/city'}

function makeSign(text:string,side:'left'|'right',top:number){
  const sign=document.createElement('div');sign.textContent=text
  css(sign,{position:'absolute',[side]:'14px',top:`${top}px`,padding:'5px 9px',borderRadius:'4px',background:'#174f85',border:'1px solid rgba(255,255,255,.78)',color:'#fff',fontFamily:'Arial,Helvetica,sans-serif',fontWeight:'800',fontSize:'10px',letterSpacing:'.35px',boxShadow:'0 3px 12px rgba(0,0,0,.45)'})
  return sign
}

function mount(){
  const existing=document.getElementById(ID)
  if(!isChicagoRoute()){existing?.remove();document.documentElement.removeAttribute('data-streetverse-chicago');return}
  if(existing)return
  document.documentElement.setAttribute('data-streetverse-chicago','true')
  const root=document.createElement('div');root.id=ID;root.setAttribute('aria-label','StreetVerse Chicago visual identity')
  css(root,{position:'fixed',inset:'0',zIndex:'2147481000',pointerEvents:'none',overflow:'hidden',fontFamily:'Arial,Helvetica,sans-serif'})

  const title=document.createElement('div')
  title.innerHTML='<b>STREETVERSE CHICAGO</b><span> • LIVING CITY</span>'
  css(title,{position:'absolute',left:'50%',top:'12px',transform:'translateX(-50%)',padding:'7px 12px',borderRadius:'999px',background:'rgba(6,16,28,.78)',border:'1px solid rgba(115,184,232,.7)',color:'#f4f7fb',fontSize:'10px',letterSpacing:'1.7px',boxShadow:'0 6px 24px rgba(0,0,0,.35)',backdropFilter:'blur(8px)',whiteSpace:'nowrap'})
  const span=title.querySelector('span') as HTMLElement|null;if(span)span.style.color='#8cc8ee'

  const district=document.createElement('div');district.textContent='SOUTH LOOP • RIVER • NEIGHBORHOODS'
  css(district,{position:'absolute',left:'14px',top:'46px',padding:'6px 9px',borderRadius:'8px',background:'rgba(82,42,26,.76)',border:'1px solid rgba(191,139,101,.6)',color:'#f1dfcf',fontWeight:'800',fontSize:'9px',letterSpacing:'1px'})

  const rail=document.createElement('div')
  rail.innerHTML='<span style="font-weight:900">L</span>&nbsp; ELEVATED LINE • LOOP SERVICE'
  css(rail,{position:'absolute',right:'14px',top:'46px',padding:'6px 9px',borderRadius:'8px',background:'rgba(20,22,24,.8)',border:'1px solid rgba(180,187,194,.55)',color:'#e7ebef',fontSize:'9px',letterSpacing:'.8px'})

  const lake=document.createElement('div');lake.textContent='LAKE MICHIGAN →'
  css(lake,{position:'absolute',right:'14px',bottom:'86px',padding:'6px 9px',borderRadius:'8px',background:'rgba(7,49,75,.75)',border:'1px solid rgba(92,181,226,.55)',color:'#bce9ff',fontWeight:'800',fontSize:'9px',letterSpacing:'.8px'})

  const railTrack=document.createElement('div')
  css(railTrack,{position:'absolute',left:'0',right:'0',top:'92px',height:'3px',background:'linear-gradient(90deg,transparent 0%,rgba(115,120,126,.18) 12%,rgba(115,120,126,.35) 50%,rgba(115,120,126,.18) 88%,transparent 100%)'})
  const train=document.createElement('div');train.textContent='▰ ▰ ▰ ▰'
  css(train,{position:'absolute',top:'80px',left:'-150px',color:'rgba(205,211,216,.42)',fontSize:'18px',letterSpacing:'-3px',animation:'tryammChicagoTrain 15s linear infinite'})

  const style=document.createElement('style');style.textContent=`@keyframes tryammChicagoTrain{from{transform:translateX(-10vw)}to{transform:translateX(120vw)}} html[data-streetverse-chicago="true"] canvas{filter:saturate(.82) contrast(1.08) brightness(.96)} @media(max-width:640px){#${ID} > div:nth-child(n+5){display:none}}`
  root.append(style,title,district,rail,makeSign('STATE ST','left',80),makeSign('WABASH AVE','right',80),railTrack,train,lake)
  document.body.appendChild(root)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-chicago-ready',{detail:{districts:['South Loop','River North','West Side','Lakefront'],visuals:['brick masonry','glass towers','elevated rail','wide intersections','river/lake cues','street signs'],source:'Chicago identity runtime'}}))
}

export function installStreetVerseChicagoIdentityRuntime(){
  if(installed||typeof window==='undefined'||typeof document==='undefined')return;installed=true
  const sync=()=>requestAnimationFrame(mount)
  window.addEventListener('hashchange',sync);window.addEventListener('tryamm:streetverse-enter',sync)
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync()
}
