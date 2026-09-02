let installed=false
const ID='tryamm-chicago-living-world'
const FEATURES=[
{id:'two-flats',label:'Chicago brick two-flats + greystones',district:'South/West/North neighborhoods'},
{id:'storefronts',label:'Corner storefront corridors',district:'Neighborhood commercial streets'},
{id:'towers',label:'Downtown stone/glass tower canyons',district:'Loop/River North'},
{id:'alleys',label:'Service alleys + garage rows',district:'City blocks'},
{id:'el',label:'Elevated steel tracks + stations',district:'Loop/North/West/South corridors'},
{id:'river',label:'Chicago River + movable bridge corridors',district:'Downtown'},
{id:'lake',label:'Lake Michigan lakefront + parks',district:'East edge'},
{id:'murals',label:'Neighborhood mural walls',district:'South/West/North'},
{id:'traffic',label:'Bus/car traffic streams',district:'Arterials'},
{id:'pedestrians',label:'Pedestrian sidewalk populations',district:'All districts'},
{id:'courts',label:'Neighborhood basketball courts',district:'Parks/school blocks'}]
function active(){const h=location.hash.replace(/^#/,'');return h==='/streetverse'||h==='/city'}
function emit(name:string,detail:any){window.dispatchEvent(new CustomEvent(name,{detail}))}
function mount(){if(!active()){document.getElementById(ID)?.remove();return}if(document.getElementById(ID))return;const root=document.createElement('div');root.id=ID;root.style.cssText='position:fixed;right:12px;bottom:12px;z-index:2147482250;pointer-events:auto;font-family:Inter,Arial,sans-serif';const b=document.createElement('button');b.textContent='🏙️ CHICAGO WORLD';b.style.cssText='padding:9px 12px;border-radius:999px;border:1px solid #b9c3ca;background:#111820e8;color:#fff;font-size:10px;font-weight:900;cursor:pointer';const p=document.createElement('div');p.style.cssText='display:none;margin-top:6px;width:min(88vw,340px);max-height:52vh;overflow:auto;padding:10px;border:1px solid #40515e;border-radius:14px;background:#071019f2;color:#fff;box-shadow:0 18px 50px #000b';p.innerHTML='<b>CHICAGO LIVING-WORLD SYSTEMS</b><div style="font-size:9px;opacity:.65;margin:4px 0 8px">World-generation targets installed</div>'+FEATURES.map(f=>`<div style="padding:6px;margin:4px 0;border-radius:8px;background:#101c26"><b style="font-size:10px">${f.label}</b><br><span style="font-size:9px;opacity:.65">${f.district}</span></div>`).join('');b.onclick=()=>p.style.display=p.style.display==='none'?'block':'none';root.append(b,p);document.body.appendChild(root);emit('tryamm:streetverse-world-generation-targets',{city:'Chicago',features:FEATURES,districtStyles:{southSide:['brick two-flats','greystones','bungalow blocks','storefront corridors','murals','courts'],westSide:['brick flats','boulevards','industrial edges','corner stores','murals','courts'],northSide:['two/three-flats','dense mixed use','elevated stations','lakefront connections','nightlife storefronts'],downtown:['historic stone towers','modern glass towers','elevated Loop','river bridges','riverwalk'],lakefront:['Lake Michigan','parks','beaches','Lake Shore traffic']},mobility:['8 color-coded rail routes','bus corridors','cars','pedestrians','stations','stops']})}
export function installStreetVerseChicagoLivingWorldRuntime(){if(installed||typeof window==='undefined'||typeof document==='undefined')return;installed=true;const sync=()=>requestAnimationFrame(mount);window.addEventListener('hashchange',sync);window.addEventListener('tryamm:streetverse-enter',sync);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync()}
