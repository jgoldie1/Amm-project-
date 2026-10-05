'use strict';
// Kingdom of Yahisrael / Judah visible Living World layer.
// Reuses the canonical Kingdom District runtime instead of creating a second game.

const KY_GOLD=0xe8b944, KY_CYAN=0x4fe3ff, KY_STONE=0x443b2b, KY_GREEN=0x315b38;
const KY_DESTINATIONS=[
 {id:'judah-gate',name:'Judah Gate • Where Heaven Meets Earth',shortName:'Judah Gate',x:37,z:14,node:[0,0],missionId:'kingdom-welcome',objective:'Enter the Kingdom path and choose study, service, building, creation or play.',route:'/kingdom-of-yahisrael'},
 {id:'assembly-court',name:'Assembly & Prayer Court',shortName:'Assembly Court',x:-37,z:-37,node:[-1,-1],missionId:'assembly-reflection',objective:'Complete a reflection and service-orientation stop.'},
 {id:'servants-center',name:'Servants of Christ Service Center',shortName:'Service Center',x:-111,z:-37,node:[-2,-1],missionId:'community-service',objective:'Choose a teaching, care or community-service mission.',route:'/servants-of-christ'},
 {id:'kingdom-market',name:'Kingdom Market',shortName:'Kingdom Market',x:111,z:-37,node:[1,-1],missionId:'market-stewardship',objective:'Explore creator commerce, local business and stewardship.'},
 {id:'legacy-workbook',name:'Family Legacy + Kingdom Workbook Hall',shortName:'Legacy Hall',x:37,z:-111,node:[0,-2],missionId:'family-covenant',objective:'Continue the 66-step workbook, family covenant and Book of Remembrance.',route:'/kingdom-workbook'},
 {id:'hebrew-school',name:'Metaverse Bible • Hebrew School + Scripture House',shortName:'Metaverse Bible',x:-37,z:111,node:[-1,1],missionId:'metaverse-bible-study',objective:'Enter Scripture reader, Ethiopian canon, Hebrew/Paleo-Hebrew, Strong’s, KJV 1611 and Faith Chrono.',route:'/metaverse-bible'},
 {id:'garden-farm',name:'Kingdom Garden + Community Farm',shortName:'Kingdom Garden',x:-111,z:111,node:[-2,1],missionId:'garden-service',objective:'Serve the community through planting, food and stewardship.'},
 {id:'press-ai-cafe',name:'Kingdoms Press + AI Café',shortName:'Kingdoms Press',x:111,z:111,node:[1,1],missionId:'publish-remembrance',objective:'Turn lessons, books and testimony into accessible creator-owned publications.',route:'/kingdoms-press'},
 {id:'broadcast-house',name:'All American Network Broadcast House',shortName:'Broadcast House',x:185,z:37,node:[2,0],missionId:'kingdom-broadcast',objective:'Create and distribute LIVE teachings, shows, Reels and Kingdom programming.',route:'/network'},
];
window.YAHISRAEL_DESTINATIONS=KY_DESTINATIONS;
const KY_PATH_KEY='tryamm.kingdom-yahisrael.path.v1';
const KY_PATH_IDS=['judah-gate','hebrew-school','servants-center','garden-farm','press-ai-cafe'];
function kyReadPath(){try{const v=JSON.parse(localStorage.getItem(KY_PATH_KEY)||'{}');return {visited:Array.isArray(v.visited)?v.visited:[],completed:Boolean(v.completed)}}catch{return {visited:[],completed:false}}}
function kyWritePath(v){try{localStorage.setItem(KY_PATH_KEY,JSON.stringify({...v,savedAt:Date.now()}))}catch{};window.YAHISRAEL_PATH_PROGRESS=v}
window.YAHISRAEL_PATH_PROGRESS=kyReadPath();

const kyAnimated=[];
const kyCitizens=[];
const kyActivityMarkers=[];
const kyArchitectureModels=new Map();
const KY_ARCH_ASSET_BASE='/tryamm-assets/meshy/kingdom';
const KY_ARCH_ASSETS={
 'assembly-court':'KY_ASSEMBLY_PRAYER_COURT.glb',
 'servants-center':'KY_SERVANTS_SERVICE_CENTER.glb',
 'legacy-workbook':'KY_FAMILY_LEGACY_HALL.glb',
 'hebrew-school':'KY_METAVERSE_BIBLE_HEBREW_SCHOOL.glb',
 'press-ai-cafe':'KY_KINGDOMS_PRESS_AI_CAFE.glb',
 'broadcast-house':'KY_ALL_AMERICAN_NETWORK_BROADCAST.glb',
};
function kyMaterial(color,emissive=0,roughness=.72,metalness=.04){
 if(T.MeshStandardMaterial)return new T.MeshStandardMaterial({color,emissive,emissiveIntensity:emissive?.28:0,roughness,metalness});
 return new T.MeshLambertMaterial({color,emissive,emissiveIntensity:emissive?.28:0});
}
function kyGlass(color=0x65c9e8,opacity=.38){
 return new T.MeshPhongMaterial({color,transparent:true,opacity,shininess:90,side:T.DoubleSide});
}
function kyBox(w,h,d,color,x,y,z,collideIt=true,material){
 const m=new T.Mesh(new T.BoxGeometry(w,h,d),material||kyMaterial(color));
 m.position.set(x,y,z);scene.add(m);
 if(collideIt)addCollider(x,z,w,d,h);
 return m;
}
function kyArchitecturalAsset(id,x,z,targetHeight){
 const file=KY_ARCH_ASSETS[id];
 if(!file||!T.GLTFLoader)return;
 const url=KY_ARCH_ASSET_BASE+'/'+file;
 const attach=gltf=>{
  if(!gltf?.scene)return;
  const clone=gltf.scene.clone(true),box=new T.Box3().setFromObject(clone),size=new T.Vector3();
  box.getSize(size);clone.scale.setScalar(size.y>0?targetHeight/size.y:1);clone.position.set(x,0,z);
  scene.add(clone);kyArchitectureModels.set(id,clone);
 };
 if(humanAssetCache?.has&&humanAssetCache.has(url)){attach(humanAssetCache.get(url));return}
 const loader=new T.GLTFLoader();loader.load(url,gltf=>attach(gltf),undefined,()=>{});
}
function kyLabelTexture(title,sub,bg='#0b0c12',fg='#ffffff'){
 const c=document.createElement('canvas');c.width=1024;c.height=256;
 const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);
 g.strokeStyle='#e8b944';g.lineWidth=10;g.strokeRect(8,8,c.width-16,c.height-16);
 g.textAlign='center';g.textBaseline='middle';g.fillStyle=fg;g.font='900 72px Arial';
 g.fillText(title,512,92);
 if(sub){g.fillStyle='#8eeeff';g.font='700 34px Arial';g.fillText(sub,512,174)}
 const tex=new T.CanvasTexture(c);tex.minFilter=T.LinearFilter;tex.magFilter=T.LinearFilter;return tex;
}
function kySign(title,sub,x,y,z,ry=0,w=24,h=6){
 const mat=new T.MeshBasicMaterial({map:kyLabelTexture(title,sub),side:T.DoubleSide});
 const m=new T.Mesh(new T.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);return m;
}
function kyTrim(x,y,z,w,d,color=KY_GOLD){
 const m=new T.Mesh(new T.BoxGeometry(w,.26,d),new T.MeshBasicMaterial({color}));m.position.set(x,y,z);scene.add(m);return m;
}
function kyColumn(x,z,h=8,color=0xd6c08b){
 const base=kyBox(1.15,h,1.15,color,x,h/2+.25,z,true);return base;
}
function kyHall({id,x,z,w=30,d=22,h=11,color=0x493d2e,title,sub}){
 const wall=.55,doorW=6.4,frontZ=z+d/2;
 // Walkable shell: floor + back/side walls + two front wall segments, not one solid collider.
 kyBox(w,.28,d,0x241f19,x,.36,z,false);
 kyBox(w,h,wall,color,x,h/2+.25,z-d/2,true);
 kyBox(wall,h,d,color,x-w/2,h/2+.25,z,true);
 kyBox(wall,h,d,color,x+w/2,h/2+.25,z,true);
 const seg=(w-doorW)/2;
 kyBox(seg,h,wall,color,x-(doorW+seg)/2,h/2+.25,frontZ,true);
 kyBox(seg,h,wall,color,x+(doorW+seg)/2,h/2+.25,frontZ,true);
 kyBox(doorW,1.4,wall,color,x,h-.45,frontZ,true);
 kyBox(w+1.2,.7,d+1.2,0x241f19,x,h+.32,z,false);
 // façade depth, windows and gold/cyan trim to move beyond plain boxes.
 kyTrim(x,h-.1,frontZ+.12,w*.84,.18);
 for(const sx of [-1,1]){
  const wx=x+sx*(doorW/2+(w-doorW)/4);
  const win=new T.Mesh(new T.PlaneGeometry(Math.max(4,(w-doorW)/2-2),Math.min(4.3,h*.36)),kyGlass());
  win.position.set(wx,h*.55,frontZ+.31);scene.add(win);
 }
 kySign(title,sub,x,h-2.0,frontZ+.36,0,Math.min(w*.86,28),4.8);
 // Interior lighting marker.
 const light=new T.PointLight(0xffddb0,.72,32);light.position.set(x,h*.65,z);scene.add(light);
 if(id)kyArchitecturalAsset(id,x,z,h);
 return {id,x,z,w,d,h,frontZ,doorW};
}

function kyBuildJudahGate(){
 const x=37,z=14;
 kyColumn(x-8,z,12,0x8a6b22);kyColumn(x+8,z,12,0x8a6b22);
 kyBox(18,2.2,1.6,0x8a6b22,x,11.4,z,true);
 kySign('JUDAH GATE','WHERE HEAVEN MEETS EARTH',x,8.4,z+.86,0,17,4.3);
 const ring=new T.Mesh(new T.TorusGeometry(6.3,.28,10,48),new T.MeshBasicMaterial({color:KY_CYAN,transparent:true,opacity:.72}));
 ring.position.set(x,6.1,z+.35);scene.add(ring);kyAnimated.push({mesh:ring,type:'spin'});
 const crown=new T.Mesh(new T.ConeGeometry(2.2,2.6,4),new T.MeshBasicMaterial({color:KY_GOLD}));
 crown.position.set(x,14,z);crown.rotation.y=Math.PI/4;scene.add(crown);kyAnimated.push({mesh:crown,type:'pulse'});
}
function kyBuildAssembly(){
 kyHall({x:-37,z:-37,w:30,d:22,h:12,color:0x4d402a,title:'ASSEMBLY & PRAYER',sub:'STUDY • REFLECTION • COMMUNITY'});
 for(const ox of [-10,-4,4,10])kyColumn(-37+ox,-24.8,7);
 kyTrim(-37,.46,-37,45,45,0xb69747);
 tree(-57,-57);tree(-17,-57);tree(-57,-17);tree(-17,-17);
}
function kyBuildService(){
 kyHall({x:-111,z:-37,w:32,d:22,h:10,color:0x304b3e,title:'SERVANTS OF CHRIST',sub:'TEACHING • CARE • SERVICE'});
 kyBox(11,3,7,0x203329,-111,1.75,-21,false);
 kySign('SERVICE DESK','COMMUNITY MISSIONS',-111,3.4,-17.35,0,10,2.8);
}
function kyBuildMarket(){
 kySign('KINGDOM MARKET','CREATE • TRADE • STEWARDSHIP',111,8,-65,0,29,5.4);
 const stallColors=[0x64452a,0x4a5962,0x5d3c55,0x465b3c,0x625833,0x3c4d65];
 let k=0;
 for(const z of [-49,-29])for(const x of [94,111,128]){
   kyBox(12,3.3,8,stallColors[k++%stallColors.length],x,1.9,z,true);
   kyBox(13,.45,9,KY_GOLD,x,3.8,z,false);
 }
}
function kyBuildLegacy(){
 kyHall({x:37,z:-111,w:27,d:20,h:9,color:0x49364a,title:'FAMILY LEGACY HALL',sub:'KINGDOM WORKBOOK • REMEMBRANCE'});
 for(const x of [18,56]){
   kyBox(14,6,13,0x514332,x,3.25,-88,true);
   kyBox(15,.8,14,0x272018,x,6.5,-88,false);
   kySign('LEGACY HOME','FAMILY • TEACHING',x,4.2,-81.25,0,12,3);
 }
}
function kyBuildHebrewSchool(){
 kyHall({x:-37,z:111,w:34,d:22,h:11,color:0x31475b,title:'METAVERSE BIBLE',sub:'HEBREW • STRONG’S • KJV 1611 • FAITH CHRONO'});
 for(const x of [-49,-43,-31,-25])kyBox(3.5,2,.3,KY_CYAN,x,6.8,122.2,false);
 kySign('SCRIPTURE HOUSE','READ • HEBREW • EXPLORE',-37,3.5,98.9,Math.PI,20,3.5);
}
function kyBuildGarden(){
 kySign('KINGDOM GARDEN','FOOD • SERVICE • STEWARDSHIP',-111,7,83,0,29,5);
 const soil=new T.MeshLambertMaterial({color:0x4b321f});
 const crop=new T.MeshLambertMaterial({color:0x4c8d45});
 for(let r=0;r<6;r++){
   const z=90+r*8;
   const bed=new T.Mesh(new T.BoxGeometry(38,.22,4.8),soil);bed.position.set(-111,.36,z);scene.add(bed);
   for(let x=-127;x<=-95;x+=4){
     const p=new T.Mesh(new T.ConeGeometry(.5,1.5,6),crop);p.position.set(x,1.1,z);scene.add(p);
   }
 }
 tree(-134,86);tree(-88,86);tree(-134,132);tree(-88,132);
}
function kyBuildPress(){
 kyHall({x:111,z:111,w:35,d:23,h:12,color:0x4a3929,title:'KINGDOMS PRESS',sub:'AI CAFÉ • BOOKS • HOLOBOOKS'});
 kyBox(13,3.2,7,0x2b2118,93,1.85,92,true);
 kySign('AI CAFÉ','CREATE • STUDY • PUBLISH',93,3.5,95.65,0,11,2.8);
 for(const [x,z] of [[95,126],[103,126],[119,126],[127,126]]){const t=kyBox(4,.25,4,0x6b5430,x,.8,z,false);void t;}
}
function kyBuildBroadcast(){
 kyHall({x:185,z:37,w:34,d:23,h:15,color:0x263f54,title:'ALL AMERICAN NETWORK',sub:'LIVE • REELS • ISAIAH AI TV'});
 const tower=kyBox(2,24,2,0x536b7a,201,12.25,20,true);
 void tower;
 for(const y of [17,22,27]){
  const ring=new T.Mesh(new T.TorusGeometry(4.2,.18,8,32),new T.MeshBasicMaterial({color:KY_CYAN,transparent:true,opacity:.55}));
  ring.position.set(201,y,20);ring.rotation.x=Math.PI/2;scene.add(ring);kyAnimated.push({mesh:ring,type:'spin'});
 }
}
kyBuildJudahGate();kyBuildAssembly();kyBuildService();kyBuildMarket();kyBuildLegacy();kyBuildHebrewSchool();kyBuildGarden();kyBuildPress();kyBuildBroadcast();

for(const d of KY_DESTINATIONS){
 if(!LANDMARKS.some(l=>l.name===d.name))LANDMARKS.push({name:d.name,node:d.node,pos:[d.x,d.z],kingdomId:d.id});
}

function nearestKingdomDestination(radius=8){
 let best=null,dist=radius;
 for(const d of KY_DESTINATIONS){
  const dd=Math.hypot(player.pos.x-d.x,player.pos.z-d.z);
  if(dd<dist){dist=dd;best=d}
 }
 return best;
}
function setKingdomDestinationWaypoint(id){
 const d=KY_DESTINATIONS.find(x=>x.id===id);if(!d)return;
 setWaypointNode(d.node[0],d.node[1],d.name,[d.x,d.z]);
}
function kyPost(type,detail){
 try{
  if(window.parent&&window.parent!==window)window.parent.postMessage({channel:'tryamm:streetverse-kingdom',type,source:'kingdom-yahisrael-living-world',...detail},window.location.origin);
 }catch{}
}
function kyMarkVisited(d){
 const state=kyReadPath();
 if(!state.visited.includes(d.id))state.visited.push(d.id);
 const complete=KY_PATH_IDS.every(id=>state.visited.includes(id));
 if(complete&&!state.completed){
   state.completed=true;
   kyPost('MISSION_COMPLETED',{missionId:'where-heaven-meets-earth-kingdom-path',destination:'Kingdom of Yahisrael',district:'Yahisrael',contentId:'kingdom-path-v1'});
   toast('Kingdom Path complete • server verification requested');
 }
 kyWritePath(state);
 try{window.dispatchEvent(new CustomEvent('tryamm:kingdom-path-progress',{detail:{...state,total:KY_PATH_IDS.length,required:KY_PATH_IDS}}))}catch{}
 return state;
}
function visitKingdomDestination(d){
 if(!d)return;
 const progress=kyMarkVisited(d);
 toast(d.name+': '+d.objective+' • Path '+progress.visited.filter(id=>KY_PATH_IDS.includes(id)).length+'/'+KY_PATH_IDS.length);
 kyPost('KINGDOM_DESTINATION_ENTERED',{destination:d.name,district:d.shortName,x:d.x,y:0,z:d.z,missionId:d.missionId,contentId:d.id});
 kyPost('MISSION_STARTED',{destination:d.name,district:d.shortName,x:d.x,y:0,z:d.z,missionId:d.missionId,contentId:d.id});
 try{window.dispatchEvent(new CustomEvent('tryamm:kingdom-destination-entered',{detail:d}))}catch{}
 if(d.route)setTimeout(()=>kyPost('KINGDOM_PORTAL_REQUEST',{destination:d.route,district:d.shortName,missionId:d.missionId,contentId:d.id}),180);
}
function updateYahisraelLivingWorld(dt,now){
 const t=now*.001;
 for(let i=0;i<kyAnimated.length;i++){
  const a=kyAnimated[i];
  if(a.type==='spin')a.mesh.rotation.z=t*(i%2?-.24:.24);
  else if(a.type==='pulse')a.mesh.position.y=14+Math.sin(t*1.5)*.22;
 }
}
window.updateYahisraelLivingWorld=updateYahisraelLivingWorld;
