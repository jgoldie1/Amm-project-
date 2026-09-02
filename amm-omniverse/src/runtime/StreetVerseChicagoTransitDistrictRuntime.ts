let installed=false
const ID='tryamm-streetverse-chicago-transit-districts'

type Rail={name:string;color:string;path:string;service:string}
type Bus={route:string;corridor:string;districts:string[]}

const RAIL:Rail[]=[
{name:'Red Line',color:'#c60c30',path:'North Side → State Street subway → South Side',service:'24-hour spine'},
{name:'Blue Line',color:'#00a1de',path:'O’Hare/Northwest → Dearborn subway → West Side',service:'24-hour airport/west spine'},
{name:'Brown Line',color:'#62361b',path:'North Side → elevated Loop',service:'neighborhood-to-Loop'},
{name:'Green Line',color:'#009b3a',path:'West Side → Loop → South Side',service:'west/south elevated'},
{name:'Orange Line',color:'#f9461c',path:'Midway/Southwest → Loop',service:'airport/southwest'},
{name:'Pink Line',color:'#e27ea6',path:'West Side → Loop',service:'west neighborhood'},
{name:'Purple Line',color:'#522398',path:'North → Loop express corridor',service:'north express'},
{name:'Yellow Line',color:'#f9e300',path:'North connector',service:'north connector'}]

const BUS:Bus[]=[
{route:'2',corridor:'Hyde Park Express',districts:['South Side','Downtown']},
{route:'3',corridor:'King Drive',districts:['South Side','South Loop']},
{route:'4',corridor:'Cottage Grove',districts:['South Side','Downtown']},
{route:'6',corridor:'Jackson Park Express',districts:['South Side','Lakefront','Downtown']},
{route:'8',corridor:'Halsted',districts:['South Side','West Side','North Side']},
{route:'9',corridor:'Ashland',districts:['South Side','West Side','North Side']},
{route:'20',corridor:'Madison',districts:['West Side','Loop']},
{route:'22',corridor:'Clark',districts:['North Side','Loop']},
{route:'29',corridor:'State',districts:['South Side','Loop']},
{route:'49',corridor:'Western',districts:['South Side','West Side','North Side']},
{route:'60',corridor:'Blue Island/26th',districts:['Southwest Side','Loop']},
{route:'62',corridor:'Archer',districts:['Southwest Side','Loop']},
{route:'66',corridor:'Chicago',districts:['West Side','Near North']},
{route:'72',corridor:'North',districts:['West Side','North Side']},
{route:'79',corridor:'79th',districts:['South Side']},
{route:'151',corridor:'Sheridan',districts:['North Side','Lakefront','Downtown']},
{route:'146',corridor:'Inner Lake Shore/Michigan Express',districts:['North Side','Lakefront','Downtown']}]

const DISTRICTS=[
{name:'THE LOOP',look:'dense glass/stone towers • elevated track canyon • river bridges • busy sidewalks',x:0,z:0},
{name:'SOUTH SIDE',look:'brick two-flats • greystones • storefront corridors • murals • neighborhood courts',x:0,z:72},
{name:'WEST SIDE',look:'brick flats • boulevards • corner stores • murals • industrial edges • courts',x:-72,z:8},
{name:'NORTH SIDE',look:'dense mixed-use blocks • two/three-flats • elevated stations • nightlife storefronts',x:60,z:-62},
{name:'LAKEFRONT',look:'Lake Michigan • beaches/parks • Lake Shore corridor • skyline views',x:82,z:-4},
{name:'CHICAGO RIVER',look:'movable bridges • riverwalk • towers • water traffic • steel infrastructure',x:18,z:-24},
{name:'ALLEYS',look:'garage rows • service doors • dumpsters • utility poles • delivery shortcuts',x:-28,z:44}]

function routeActive(){const h=location.hash.replace(/^#/,'');return h==='/streetverse'||h==='/city'}
function css(el:HTMLElement,s:Partial<CSSStyleDeclaration>){Object.assign(el.style,s)}
function emit(name:string,detail:any){window.dispatchEvent(new CustomEvent(name,{detail}))}

function mount(){
 const old=document.getElementById(ID);if(!routeActive()){old?.remove();return}if(old)return
 const root=document.createElement('section');root.id=ID;root.setAttribute('aria-label','StreetVerse Chicago transit and districts')
 css(root,{position:'fixed',left:'12px',bottom:'12px',zIndex:'2147482300',fontFamily:'Inter,Arial,sans-serif',pointerEvents:'auto'})
 const open=document.createElement('button');open.type='button';open.textContent='🚇 CHICAGO TRANSIT + DISTRICTS';css(open,{padding:'9px 12px',borderRadius:'999px',border:'1px solid #79c8f5aa',background:'#07131dec',color:'#fff',fontSize:'10px',fontWeight:'900',cursor:'pointer',boxShadow:'0 8px 30px #0009'})
 const panel=document.createElement('div');css(panel,{display:'none',marginTop:'7px',width:'min(92vw,440px)',maxHeight:'68vh',overflow:'auto',padding:'12px',borderRadius:'16px',border:'1px solid #34556b',background:'#050b12f2',color:'#fff',boxShadow:'0 20px 60px #000c'})
 panel.innerHTML=`<div style="font-weight:950;letter-spacing:1px">STREETVERSE CHICAGO WORLD LAYER</div><div style="opacity:.7;font-size:10px;margin:4px 0 10px">Rail • buses • neighborhoods • river • lakefront • alleys • courts</div><div style="font-size:10px;font-weight:900;color:#9bdcff;margin:8px 0">‘L’ RAIL NETWORK</div>${RAIL.map(r=>`<button data-rail="${r.name}" style="display:block;width:100%;text-align:left;margin:4px 0;padding:8px;border-radius:9px;border:1px solid ${r.color};background:#0a121b;color:#fff;cursor:pointer"><b style="color:${r.color}">● ${r.name}</b><br><span style="font-size:9px;opacity:.72">${r.path} • ${r.service}</span></button>`).join('')}<div style="font-size:10px;font-weight:900;color:#9bdcff;margin:12px 0 6px">BUS CORRIDORS</div><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px">${BUS.map(b=>`<button data-bus="${b.route}" style="padding:7px;text-align:left;border:1px solid #33485a;border-radius:8px;background:#0a121b;color:#fff;cursor:pointer"><b>#${b.route}</b> <span style="font-size:9px">${b.corridor}</span></button>`).join('')}</div><div style="font-size:10px;font-weight:900;color:#9bdcff;margin:12px 0 6px">LIVING DISTRICTS</div>${DISTRICTS.map(d=>`<button data-district="${d.name}" style="display:block;width:100%;text-align:left;margin:4px 0;padding:8px;border:1px solid #33485a;border-radius:8px;background:#0a121b;color:#fff;cursor:pointer"><b>${d.name}</b><br><span style="font-size:9px;opacity:.7">${d.look}</span></button>`).join('')}`
 open.onclick=()=>panel.style.display=panel.style.display==='none'?'block':'none'
 panel.querySelectorAll('[data-rail]').forEach(n=>n.addEventListener('click',()=>{const name=(n as HTMLElement).dataset.rail;const rail=RAIL.find(r=>r.name===name);emit('tryamm:streetverse-transit-select',{mode:'rail',...rail});emit('tryamm:accessibility-announce',{text:`Selected ${name}`})}))
 panel.querySelectorAll('[data-bus]').forEach(n=>n.addEventListener('click',()=>{const route=(n as HTMLElement).dataset.bus;const bus=BUS.find(b=>b.route===route);emit('tryamm:streetverse-transit-select',{mode:'bus',...bus});emit('tryamm:accessibility-announce',{text:`Selected bus ${route} ${bus?.corridor||''}`})}))
 panel.querySelectorAll('[data-district]').forEach(n=>n.addEventListener('click',()=>{const name=(n as HTMLElement).dataset.district;const d=DISTRICTS.find(x=>x.name===name);emit('tryamm:streetverse-district-select',{...d});emit('tryamm:streetverse-waypoint',{x:d?.x,z:d?.z,label:name,source:'Chicago district map'});emit('tryamm:accessibility-announce',{text:`Waypoint set for ${name}`})}))
 root.append(open,panel);document.body.appendChild(root)
 emit('tryamm:streetverse-chicago-network-ready',{rail:RAIL,bus:BUS,districts:DISTRICTS,worldFeatures:['brick two-flats','storefronts','downtown towers','service alleys','elevated tracks and stations','Chicago River bridges','lakefront','neighborhood murals','traffic buses and cars','pedestrians','basketball courts','South Side identity','West Side identity','North Side identity']})
}

export function installStreetVerseChicagoTransitDistrictRuntime(){if(installed||typeof window==='undefined'||typeof document==='undefined')return;installed=true;const sync=()=>requestAnimationFrame(mount);window.addEventListener('hashchange',sync);window.addEventListener('tryamm:streetverse-enter',sync);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync()}
