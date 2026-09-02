const KEY='tryamm.streetverse.playable-character.v1'
let installed=false

export type StreetVersePlayableCharacter={id:string;label:string;index:number;role:string}

const ROSTER:StreetVersePlayableCharacter[]=[
  {id:'you',label:'YOU',index:-1,role:'Founder / Explorer'},
  ...Array.from({length:24},(_,i)=>({id:`resident-${i+1}`,label:`RESIDENT ${String(i+1).padStart(2,'0')}`,index:i,role:i%4===0?'Creator':i%4===1?'Athlete':i%4===2?'Builder':'Entrepreneur'}))
]

function emit(name:string,detail:any={}){window.dispatchEvent(new CustomEvent(name,{detail}))}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
function save(character:StreetVersePlayableCharacter){try{localStorage.setItem(KEY,JSON.stringify({character,updatedAt:new Date().toISOString()}))}catch{}}

function mount(){
  if(document.getElementById('tryamm-playable-character-switcher'))return
  const root=document.createElement('div');root.id='tryamm-playable-character-switcher';root.setAttribute('aria-label','StreetVerse playable character switcher')
  Object.assign(root.style,{position:'fixed',right:'12px',top:'86px',zIndex:'2147482400',display:'none',fontFamily:'Inter,system-ui,sans-serif'})
  const button=document.createElement('button');button.type='button';button.textContent='👥 CHARACTERS';Object.assign(button.style,{border:'1px solid #59e7ff88',borderRadius:'999px',padding:'10px 13px',background:'#07131dee',color:'#fff',fontWeight:'900',fontSize:'11px',cursor:'pointer',boxShadow:'0 8px 26px #0008'})
  const panel=document.createElement('div');Object.assign(panel.style,{display:'none',marginTop:'7px',width:'min(86vw,320px)',maxHeight:'62vh',overflowY:'auto',padding:'10px',border:'1px solid #31536a',borderRadius:'16px',background:'#050b13f4',boxShadow:'0 18px 55px #000b'})
  const title=document.createElement('div');title.textContent='PLAYABLE STREETVERSE ROSTER';Object.assign(title.style,{fontSize:'10px',color:'#59e7ff',fontWeight:'950',letterSpacing:'1.5px',padding:'4px 5px 9px'});panel.appendChild(title)
  const grid=document.createElement('div');Object.assign(grid.style,{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'6px'})
  ROSTER.forEach(character=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<strong>${character.label}</strong><br><span style="opacity:.7;font-size:9px">${character.role}</span>`;Object.assign(b.style,{textAlign:'left',padding:'10px',border:'1px solid #23394b',borderRadius:'11px',background:'#0b1520',color:'#fff',cursor:'pointer',minHeight:'55px'});b.addEventListener('click',()=>{save(character);emit('tryamm:streetverse-character-select',{...character,source:'roster'});emit('tryamm:accessibility-announce',{text:`Now playing as ${character.label}`});panel.style.display='none';button.textContent=`👥 ${character.label}`});grid.appendChild(b)});panel.appendChild(grid)
  button.addEventListener('click',()=>panel.style.display=panel.style.display==='none'?'block':'none')
  root.append(button,panel);document.body.appendChild(root)

  const sync=()=>{const inStreetVerse=location.pathname.startsWith('/streetverse');root.style.display=inStreetVerse?'block':'none'};sync();setInterval(sync,1200)
  const current=read()?.character as StreetVersePlayableCharacter|undefined;if(current?.label)button.textContent=`👥 ${current.label}`
}

export function installStreetVersePlayableCharactersRuntime(){
  if(installed||typeof window==='undefined'||typeof document==='undefined')return;installed=true
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount()
  queueMicrotask(()=>emit('tryamm:streetverse-playable-roster-ready',{count:ROSTER.length,characters:ROSTER}))
}
