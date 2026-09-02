type District='South Side'|'West Side'|'North Side'|'Loop'|'Lakefront'|'River'
type Mission={id:string;title:string;district:District;summary:string;objectives:string[];rewardXp:number;rewardCredits:number}

type SaveState={missionId?:string;objective?:number;completed:string[];xp:number;credits:number}

const ID='tryamm-streetverse-chicago-world'
const KEY='tryamm.streetverse.chicago.world.v1'
let installed=false

const L_LINES=[
  {name:'Red Line',corridor:'Howard ↔ 95th/Dan Ryan',color:'#c60c30'},
  {name:'Blue Line',corridor:"O’Hare ↔ Forest Park",color:'#00a1de'},
  {name:'Brown Line',corridor:'Kimball ↔ Loop',color:'#62361b'},
  {name:'Green Line',corridor:'Harlem/Lake ↔ South Side branches',color:'#009b3a'},
  {name:'Orange Line',corridor:'Midway ↔ Loop',color:'#f9461c'},
  {name:'Pink Line',corridor:'54th/Cermak ↔ Loop',color:'#e27ea6'},
  {name:'Purple Line',corridor:'Linden ↔ Howard / express corridor',color:'#522398'},
  {name:'Yellow Line',corridor:'Skokie ↔ Howard',color:'#f9e300'},
]

const BUS_ROUTES=[
  {route:'6',name:'Jackson Park Express',zone:'Lakefront / South Side'},
  {route:'20',name:'Madison',zone:'West Side ↔ Downtown'},
  {route:'22',name:'Clark',zone:'North Side ↔ Downtown'},
  {route:'29',name:'State',zone:'South Side ↔ Downtown'},
  {route:'49',name:'Western',zone:'North/South spine'},
  {route:'66',name:'Chicago',zone:'West Side ↔ Near North'},
  {route:'79',name:'79th',zone:'South Side'},
  {route:'151',name:'Sheridan',zone:'Lakefront / North Side'},
]

const DISTRICTS=[
  {name:'South Side',look:'brick two-flats • greystones • neighborhood storefronts • boulevards • courts',missions:'basketball • delivery • business • lakefront'},
  {name:'West Side',look:'two-flats • murals • industrial corridors • viaducts • corner businesses',missions:'creator • jobs • transit • neighborhood restoration'},
  {name:'North Side',look:'dense storefront streets • apartments • elevated rail • lakefront parks',missions:'music • nightlife • transit • creator runs'},
  {name:'Loop',look:'glass/steel towers • historic masonry • elevated tracks • canyon streets',missions:'L jobs • courier • business • rooftop'},
  {name:'Lakefront',look:'Lake Michigan • beaches • parks • trail • skyline views',missions:'Lake Shore drive • rescue • race • event'},
  {name:'River',look:'Chicago River • movable bridges • riverwalk • towers • Lower Wacker access',missions:'bridge • Lower Wacker • courier • chase'},
]

const MISSIONS:Mission[]=[
  {id:'lsd-night-run',title:'Lake Shore Night Run',district:'Lakefront',summary:'Drive the lakefront corridor, hit skyline checkpoints and finish without losing the route.',objectives:['Start near the South Side lakefront','Reach Museum Campus checkpoint','Run the downtown lakefront corridor','Finish at the North Side lakefront'],rewardXp:450,rewardCredits:90},
  {id:'lakefront-defense',title:'Lakefront Stand',district:'Lakefront',summary:'Protect a creator event from a rival crew using non-lethal game combat and crowd-control objectives.',objectives:['Meet the event organizer','Secure the south entrance','Defeat the rival crew encounter','Escort creators to the safe zone'],rewardXp:520,rewardCredits:105},
  {id:'lower-wacker-job',title:'Lower Wacker After Hours',district:'River',summary:'Take a late-night courier job through the lower-level downtown road network.',objectives:['Pick up the sealed package downtown','Enter Lower Wacker route','Clear three underground checkpoints','Deliver at the river service entrance'],rewardXp:600,rewardCredits:120},
  {id:'river-bridge-run',title:'Bridge Timing',district:'River',summary:'Move a priority delivery across the river while bridge and traffic windows change.',objectives:['Collect the priority cargo','Reach the first river bridge','Reroute around a bridge delay','Complete the River North delivery'],rewardXp:420,rewardCredits:85},
  {id:'loop-l-job',title:"'L' Line Rush",district:'Loop',summary:'Work a transit-support mission connecting Loop stations and elevated-track checkpoints.',objectives:['Report at the Loop platform','Reach three elevated stations','Assist a stranded game-world passenger','Finish at the transfer checkpoint'],rewardXp:480,rewardCredits:95},
  {id:'south-side-court',title:'South Side Court Kings',district:'South Side',summary:'Win a neighborhood basketball challenge and recruit a local player.',objectives:['Arrive at the court','Win the opening 1v1','Complete the 3v3 challenge','Recruit the featured player'],rewardXp:550,rewardCredits:110},
  {id:'west-side-mural',title:'West Side Walls',district:'West Side',summary:'Help creators complete a neighborhood mural and protect the block event.',objectives:['Meet the mural crew','Deliver paint and equipment','Complete creator challenge','Launch the block showcase'],rewardXp:380,rewardCredits:75},
  {id:'north-side-night',title:'North Side Night Shift',district:'North Side',summary:'Run a creator/music delivery route between neighborhood storefronts and an elevated station.',objectives:['Pick up the music package','Visit two storefront partners','Cross the elevated station district','Deliver to the creator venue'],rewardXp:400,rewardCredits:80},
  {id:'bus-operator',title:'Chicago Bus Operator',district:'Loop',summary:'Run a StreetVerse bus service loop through multiple neighborhoods while keeping schedule checkpoints.',objectives:['Choose a bus route','Complete downtown stop','Complete neighborhood stop','Return to terminal on schedule'],rewardXp:500,rewardCredits:100},
]

function read():SaveState{try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return {completed:Array.isArray(x.completed)?x.completed:[],xp:Number(x.xp)||0,credits:Number(x.credits)||0,missionId:x.missionId,objective:Number(x.objective)||0}}catch{return {completed:[],xp:0,credits:0}}}
function write(s:SaveState){try{localStorage.setItem(KEY,JSON.stringify({...s,updatedAt:new Date().toISOString()}))}catch{}}
function onChicago(){const h=location.hash.replace(/^#/,'');return h==='/streetverse'||h==='/city'}
function css(el:HTMLElement,s:Partial<CSSStyleDeclaration>){Object.assign(el.style,s)}
function announce(text:string){window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text}}))}

function mount(){
  const old=document.getElementById(ID)
  if(!onChicago()){old?.remove();return}
  if(old)return
  let state=read()
  const root=document.createElement('div');root.id=ID;root.setAttribute('aria-label','StreetVerse Chicago world systems')
  css(root,{position:'fixed',left:'12px',bottom:'82px',zIndex:'2147482500',fontFamily:'Inter,Arial,sans-serif',color:'#fff'})
  const launch=document.createElement('button');launch.type='button';launch.textContent='🏙️ CHICAGO';css(launch,{border:'1px solid #77b7dd88',borderRadius:'999px',padding:'10px 13px',background:'#08131dee',color:'#fff',fontWeight:'900',fontSize:'11px',cursor:'pointer',boxShadow:'0 8px 28px #0008'})
  const panel=document.createElement('div');css(panel,{display:'none',marginTop:'7px',width:'min(92vw,430px)',maxHeight:'68vh',overflow:'auto',padding:'12px',border:'1px solid #35566c',borderRadius:'16px',background:'#050b12f5',boxShadow:'0 22px 60px #000c'})
  const tabs=document.createElement('div');css(tabs,{display:'flex',gap:'5px',flexWrap:'wrap',marginBottom:'10px'})
  const body=document.createElement('div')
  function button(label:string,fn:()=>void){const b=document.createElement('button');b.type='button';b.textContent=label;css(b,{border:'1px solid #365366',borderRadius:'9px',padding:'8px 9px',background:'#0d1822',color:'#fff',fontSize:'10px',fontWeight:'800',cursor:'pointer'});b.onclick=fn;return b}
  function show(section:'missions'|'rail'|'bus'|'districts'){
    body.innerHTML=''
    if(section==='rail'){
      const h=document.createElement('h3');h.textContent="CHICAGO 'L' NETWORK";body.append(h)
      L_LINES.forEach(line=>{const r=document.createElement('div');r.innerHTML=`<b>${line.name}</b><br><span>${line.corridor}</span>`;css(r,{borderLeft:`5px solid ${line.color}`,padding:'8px 10px',margin:'5px 0',background:'#0b141d',borderRadius:'7px',fontSize:'11px'});body.append(r)})
      const note=document.createElement('small');note.textContent='StreetVerse reference network — not live CTA tracking or official CTA service.';body.append(note)
    } else if(section==='bus'){
      const h=document.createElement('h3');h.textContent='BUS ROUTES';body.append(h)
      BUS_ROUTES.forEach(route=>{const r=document.createElement('div');r.innerHTML=`<b>#${route.route} ${route.name}</b><br><span>${route.zone}</span>`;css(r,{padding:'8px 10px',margin:'5px 0',background:'#0b141d',border:'1px solid #263847',borderRadius:'7px',fontSize:'11px'});r.onclick=()=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-chicago-transit-select',{detail:{mode:'bus',...route}}));announce(`Selected bus route ${route.route} ${route.name}`)};body.append(r)})
    } else if(section==='districts'){
      const h=document.createElement('h3');h.textContent='CHICAGO DISTRICTS';body.append(h)
      DISTRICTS.forEach(d=>{const r=document.createElement('div');r.innerHTML=`<b>${d.name}</b><br><span>${d.look}</span><br><em>${d.missions}</em>`;css(r,{padding:'9px 10px',margin:'6px 0',background:'#0b141d',border:'1px solid #263847',borderRadius:'8px',fontSize:'10px',lineHeight:'1.45'});body.append(r)})
    } else {
      const h=document.createElement('h3');h.textContent=`CHICAGO MISSIONS • XP ${state.xp} • HC ${state.credits}`;body.append(h)
      MISSIONS.forEach(m=>{const card=document.createElement('div');css(card,{padding:'10px',margin:'7px 0',background:state.completed.includes(m.id)?'#0c2318':'#0b141d',border:'1px solid #2d4557',borderRadius:'10px'});const active=state.missionId===m.id;card.innerHTML=`<b>${state.completed.includes(m.id)?'✓ ':''}${m.title}</b> <small>• ${m.district}</small><p style="font-size:10px;opacity:.8;margin:5px 0">${m.summary}</p>${active?`<div style="font-size:10px;color:#8fd8ff">OBJECTIVE ${Math.min((state.objective||0)+1,m.objectives.length)}/${m.objectives.length}: ${m.objectives[Math.min(state.objective||0,m.objectives.length-1)]}</div>`:''}`;const action=button(active?'COMPLETE OBJECTIVE':'START MISSION',()=>{
          if(!active){state={...state,missionId:m.id,objective:0};write(state);announce(`${m.title} started`);show('missions');window.dispatchEvent(new CustomEvent('tryamm:streetverse-chicago-mission-start',{detail:m}));return}
          const next=(state.objective||0)+1
          if(next>=m.objectives.length){state={...state,missionId:undefined,objective:0,completed:[...new Set([...state.completed,m.id])],xp:state.xp+m.rewardXp,credits:state.credits+m.rewardCredits};write(state);announce(`${m.title} complete. Earned ${m.rewardXp} XP and ${m.rewardCredits} Holo Credits.`);window.dispatchEvent(new CustomEvent('tryamm:mission-completed',{detail:{missionId:m.id,title:m.title,xp:m.rewardXp,holoCredits:m.rewardCredits,source:'streetverse-chicago'}}))}else{state={...state,objective:next};write(state);announce(m.objectives[next])}
          show('missions')
        });if(!state.completed.includes(m.id)||active)card.append(action);body.append(card)})
      const safety=document.createElement('small');safety.textContent='Mission rewards are in-game XP/Holo Credits only unless a separately funded, server-verified payout program is explicitly enabled.';body.append(safety)
    }
  }
  ;[['MISSIONS','missions'],["'L'",'rail'],['BUS','bus'],['DISTRICTS','districts']].forEach(([label,key])=>tabs.append(button(label,()=>show(key as any))))
  launch.onclick=()=>{panel.style.display=panel.style.display==='none'?'block':'none';if(panel.style.display==='block')show('missions')}
  panel.append(tabs,body);root.append(launch,panel);document.body.append(root)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-chicago-world-ready',{detail:{lLines:L_LINES.length,busRoutes:BUS_ROUTES.length,districts:DISTRICTS.length,missions:MISSIONS.length}}))
}

export function installStreetVerseChicagoWorldRuntime(){
  if(installed||typeof window==='undefined'||typeof document==='undefined')return;installed=true
  const sync=()=>requestAnimationFrame(mount)
  window.addEventListener('hashchange',sync);window.addEventListener('tryamm:streetverse-enter',sync)
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync()
}
