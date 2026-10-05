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
function kyTable(x,z,w=4,d=2,color=0x5f4930){
 kyBox(w,.24,d,color,x,1.02,z,false);
 for(const sx of [-1,1])for(const sz of [-1,1])kyBox(.18,.9,.18,0x2e241b,x+sx*(w/2-.25),.55,z+sz*(d/2-.22),false);
}
function kyBench(x,z,w=4,ry=0){
 const g=new T.Group(),mat=kyMaterial(0x664a2e),leg=kyMaterial(0x2d251d);
 const seat=new T.Mesh(new T.BoxGeometry(w,.22,1.05),mat);seat.position.y=.82;g.add(seat);
 const back=new T.Mesh(new T.BoxGeometry(w,.85,.18),mat);back.position.set(0,1.18,.44);g.add(back);
 for(const sx of [-1,1]){const l=new T.Mesh(new T.BoxGeometry(.2,.72,.8),leg);l.position.set(sx*(w/2-.35),.45,0);g.add(l)}
 g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);
}
function kyShelf(x,z,w=5,h=5,ry=0){
 const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);
 const wood=kyMaterial(0x3a2a1f),bookColors=[0x8e3d31,0x2f557d,0x6b5a27,0x6f3b72,0x3c7049];
 for(const y of [.55,1.65,2.75,3.85,4.95]){
  const s=new T.Mesh(new T.BoxGeometry(w,.16,.55),wood);s.position.y=y;g.add(s);
  for(let i=0;i<Math.floor(w/.45)-1;i++){const b=new T.Mesh(new T.BoxGeometry(.28,.7,.38),kyMaterial(bookColors[i%bookColors.length]));b.position.set(-w/2+.45+i*.45,y+.42,0);g.add(b)}
 }
 for(const sx of [-1,1]){const side=new T.Mesh(new T.BoxGeometry(.18,h,.65),wood);side.position.set(sx*w/2,h/2+.25,0);g.add(side)}
}
function kyChair(x,z,ry=0,color=0x2f3a44){
 const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);
 const m=kyMaterial(color);
 const seat=new T.Mesh(new T.BoxGeometry(1.05,.16,1.05),m);seat.position.y=.72;g.add(seat);
 const back=new T.Mesh(new T.BoxGeometry(1.05,1.05,.15),m);back.position.set(0,1.18,.46);g.add(back);
 for(const sx of [-1,1])for(const sz of [-1,1]){const l=new T.Mesh(new T.BoxGeometry(.12,.65,.12),m);l.position.set(sx*.4,.38,sz*.4);g.add(l)}
}
function kyScreen(title,sub,x,y,z,w=7,h=4,ry=0){
 return kySign(title,sub,x,y,z,ry,w,h);
}
function kyCameraRig(x,z,ry=0){
 const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);
 const dark=kyMaterial(0x151a1f),lens=kyMaterial(0x28455d,0x2b91b4,.3,.45);
 const body=new T.Mesh(new T.BoxGeometry(1.2,.8,1.8),dark);body.position.y=2.6;g.add(body);
 const l=new T.Mesh(new T.CylinderGeometry(.32,.42,.55,16),lens);l.rotation.x=Math.PI/2;l.position.set(0,2.6,-1.15);g.add(l);
 for(const sx of [-1,1]){const leg=new T.Mesh(new T.CylinderGeometry(.05,.07,2.2,8),dark);leg.position.set(sx*.45,1.15,.2);leg.rotation.z=sx*.18;g.add(leg)}
}
function kyHoloLectern(x,z,label){
 kyBox(2.4,1.25,1.5,0x2b2118,x,.78,z,false);
 const ring=new T.Mesh(new T.TorusGeometry(.72,.06,8,28),new T.MeshBasicMaterial({color:KY_CYAN,transparent:true,opacity:.8}));
 ring.rotation.x=Math.PI/2;ring.position.set(x,1.65,z);scene.add(ring);kyAnimated.push({mesh:ring,type:'spin'});
 kySign(label,'INTERACTIVE',x,2.75,z+.76,0,4.5,1.7);
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
 kyHall({id:'assembly-court',x:-37,z:-37,w:30,d:22,h:12,color:0x4d402a,title:'ASSEMBLY & PRAYER',sub:'STUDY • REFLECTION • COMMUNITY'});
 for(const zz of [-42,-38,-34]){kyBench(-43,zz,7,Math.PI/2);kyBench(-31,zz,7,Math.PI/2)}
 kyHoloLectern(-37,-46,'REFLECTION');
 for(const ox of [-10,-4,4,10])kyColumn(-37+ox,-24.8,7);
 kyTrim(-37,.46,-37,45,45,0xb69747);
 tree(-57,-57);tree(-17,-57);tree(-57,-17);tree(-17,-17);
}
function kyBuildService(){
 kyHall({id:'servants-center',x:-111,z:-37,w:32,d:22,h:10,color:0x304b3e,title:'SERVANTS OF CHRIST',sub:'TEACHING • CARE • SERVICE'});
 kyTable(-117,-42,5,2.2);kyTable(-105,-42,5,2.2);kyShelf(-125,-37,6,5,Math.PI/2);kyShelf(-97,-37,6,5,Math.PI/2);kyHoloLectern(-111,-46,'SERVICE MISSION');
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
 kyHall({id:'legacy-workbook',x:37,z:-111,w:27,d:20,h:9,color:0x49364a,title:'FAMILY LEGACY HALL',sub:'KINGDOM WORKBOOK • REMEMBRANCE'});
 kyTable(37,-115,7,3);kyChair(33,-111,0,0x5b475e);kyChair(37,-111,0,0x5b475e);kyChair(41,-111,0,0x5b475e);kyShelf(26,-115,6,5,Math.PI/2);kyShelf(48,-115,6,5,Math.PI/2);kyHoloLectern(37,-118,'BOOK OF REMEMBRANCE');
 for(const x of [18,56]){
   kyBox(14,6,13,0x514332,x,3.25,-88,true);
   kyBox(15,.8,14,0x272018,x,6.5,-88,false);
   kySign('LEGACY HOME','FAMILY • TEACHING',x,4.2,-81.25,0,12,3);
 }
}
function kyBuildHebrewSchool(){
 kyHall({id:'hebrew-school',x:-37,z:111,w:34,d:22,h:11,color:0x31475b,title:'METAVERSE BIBLE',sub:'HEBREW • STRONG’S • KJV 1611 • FAITH CHRONO'});
 for(const zz of [106,111,116])for(const xx of [-47,-41,-33,-27]){kyTable(xx,zz,3.4,1.8,0x36485a);kyChair(xx,zz+1.8,Math.PI,0x253746)}
 kyScreen('METAVERSE BIBLE','ETHIOPIAN CANON • HEBREW • STRONG’S',-37,7.7,100.1,20,4.2,Math.PI);
 kyHoloLectern(-37,104,'OPEN SCRIPTURE');kyShelf(-52,111,6,5,Math.PI/2);kyShelf(-22,111,6,5,Math.PI/2);
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
 kyHall({id:'press-ai-cafe',x:111,z:111,w:35,d:23,h:12,color:0x4a3929,title:'KINGDOMS PRESS',sub:'AI CAFÉ • BOOKS • HOLOBOOKS'});
 kyShelf(96,111,7,6,Math.PI/2);kyShelf(126,111,7,6,Math.PI/2);kyTable(105,108,6,2.5);kyTable(117,108,6,2.5);kyScreen('AI CAFÉ','WRITE • EDIT • PUBLISH',111,7.3,99.2,18,4.1,Math.PI);kyHoloLectern(111,105,'PUBLISH');
 kyBox(13,3.2,7,0x2b2118,93,1.85,92,true);
 kySign('AI CAFÉ','CREATE • STUDY • PUBLISH',93,3.5,95.65,0,11,2.8);
 for(const [x,z] of [[95,126],[103,126],[119,126],[127,126]]){const t=kyBox(4,.25,4,0x6b5430,x,.8,z,false);void t;}
}
function kyBuildBroadcast(){
 kyHall({id:'broadcast-house',x:185,z:37,w:34,d:23,h:15,color:0x263f54,title:'ALL AMERICAN NETWORK',sub:'LIVE • REELS • ISAIAH AI TV'});
 kyBox(16,.55,7,0x202c3a,185,.55,31,false);kyScreen('ON AIR','ALL AMERICAN NETWORK',185,8,25.3,16,5,Math.PI);kyCameraRig(176,43,.25);kyCameraRig(194,43,-.25);kyTable(185,45,10,2.6,0x2e3946);kyHoloLectern(185,39,'START SHOW');
 const tower=kyBox(2,24,2,0x536b7a,201,12.25,20,true);
 void tower;
 for(const y of [17,22,27]){
  const ring=new T.Mesh(new T.TorusGeometry(4.2,.18,8,32),new T.MeshBasicMaterial({color:KY_CYAN,transparent:true,opacity:.55}));
  ring.position.set(201,y,20);ring.rotation.x=Math.PI/2;scene.add(ring);kyAnimated.push({mesh:ring,type:'spin'});
 }
}
kyBuildJudahGate();kyBuildAssembly();kyBuildService();kyBuildMarket();kyBuildLegacy();kyBuildHebrewSchool();kyBuildGarden();kyBuildPress();kyBuildBroadcast();

const KY_ACTIVITY_KEY='tryamm.kingdom-yahisrael.activities.v1';
const KY_ACTIVITIES=[
 {id:'assembly-reflection',label:'Complete Assembly Reflection',shortLabel:'Reflect / Pray',x:-37,z:-46,missionId:'assembly-reflection',destinationId:'assembly-court',action:'pray-standing'},
 {id:'service-intake',label:'Choose a Servants of Christ Service Mission',shortLabel:'Choose Service Mission',x:-111,z:-46,missionId:'community-service',destinationId:'servants-center',action:'security-scan',route:'/servants-of-christ'},
 {id:'market-stewardship',label:'Run a Kingdom Market Stewardship Check',shortLabel:'Market Stewardship',x:111,z:-38,missionId:'market-stewardship',destinationId:'kingdom-market',action:'creator-pose'},
 {id:'family-covenant',label:'Open Family Covenant + Book of Remembrance',shortLabel:'Open Kingdom Workbook',x:37,z:-118,missionId:'family-covenant',destinationId:'legacy-workbook',action:'pray-standing',route:'/kingdom-workbook'},
 {id:'metaverse-bible-study',label:'Begin Metaverse Bible Study Session',shortLabel:'Open Metaverse Bible',x:-37,z:104,missionId:'metaverse-bible-study',destinationId:'hebrew-school',action:'creator-pose',route:'/metaverse-bible'},
 {id:'garden-service',label:'Plant / Water Kingdom Garden',shortLabel:'Garden Service',x:-111,z:106,missionId:'garden-service',destinationId:'garden-farm',action:'mechanic-work'},
 {id:'publish-remembrance',label:'Publish through Kingdoms Press',shortLabel:'Start Publishing',x:111,z:105,missionId:'publish-remembrance',destinationId:'press-ai-cafe',action:'creator-pose',route:'/kingdoms-press'},
 {id:'kingdom-broadcast',label:'Start Kingdom Broadcast / Reel',shortLabel:'Start Broadcast',x:185,z:39,missionId:'kingdom-broadcast',destinationId:'broadcast-house',action:'mic-performance',route:'/network'},
];
window.YAHISRAEL_ACTIVITIES=KY_ACTIVITIES;

function kyReadActivities(){try{const v=JSON.parse(localStorage.getItem(KY_ACTIVITY_KEY)||'{}');return {completed:Array.isArray(v.completed)?v.completed:[]}}catch{return {completed:[]}}}
function kyWriteActivities(v){try{localStorage.setItem(KY_ACTIVITY_KEY,JSON.stringify({...v,savedAt:Date.now()}))}catch{};window.YAHISRAEL_ACTIVITY_PROGRESS=v}
window.YAHISRAEL_ACTIVITY_PROGRESS=kyReadActivities();

function kyActivityMarker(a){
 const ring=new T.Mesh(new T.TorusGeometry(1.25,.09,8,36),new T.MeshBasicMaterial({color:KY_CYAN,transparent:true,opacity:.76}));
 ring.rotation.x=Math.PI/2;ring.position.set(a.x,.16,a.z);scene.add(ring);
 const beamMat=new T.MeshBasicMaterial({color:KY_GOLD,transparent:true,opacity:.14,depthWrite:false});
 const beam=new T.Mesh(new T.CylinderGeometry(.58,.58,4.5,14,1,true),beamMat);beam.position.set(a.x,2.3,a.z);scene.add(beam);
 kyActivityMarkers.push({activity:a,ring,beam,baseY:.16});
}
for(const a of KY_ACTIVITIES)kyActivityMarker(a);

const KY_CITIZEN_SPECS=[
 {id:'assembly-elder',name:'Assembly Elder',role:'teacher',ageLane:'senior',file:'SV_NPC_BLACK_MAN_SENIOR_01.glb',height:1.76,x:-37,z:-43,action:'pray-standing',shirt:0x3a2c1d,pants:0x171717},
 {id:'assembly-mother',name:'Family Mentor',role:'parent',ageLane:'adult',file:'SV_NPC_BLACK_WOMAN_ADULT_01.glb',height:1.69,x:-31,z:-39,action:'creator-pose',shirt:0x5b354b,pants:0x24202e},
 {id:'assembly-father',name:'Family Mentor',role:'parent',ageLane:'adult',file:'SV_NPC_BLACK_MAN_ADULT_01.glb',height:1.82,x:-43,z:-39,action:'creator-pose',shirt:0x394d67,pants:0x1e2530},
 {id:'assembly-teen',name:'Youth Student',role:'student',ageLane:'teen',file:'SV_NPC_TEEN_01.glb',height:1.62,x:-32,z:-34,action:'sit-relaxed',shirt:0x2f5c6b,pants:0x262936},
 {id:'service-coordinator',name:'Service Coordinator',role:'community-leader',ageLane:'adult',file:'SV_NPC_BLACK_WOMAN_ADULT_01.glb',height:1.69,x:-111,z:-43,action:'security-scan',shirt:0x315944,pants:0x202a26},
 {id:'service-volunteer-1',name:'Community Volunteer',role:'volunteer',ageLane:'young-adult',file:'SV_NPC_BLACK_MAN_YOUNGADULT_01.glb',height:1.80,x:-118,z:-37,wander:3.5,shirt:0x315944,pants:0x1d2632},
 {id:'service-volunteer-2',name:'Care Volunteer',role:'volunteer',ageLane:'young-adult',file:'SV_NPC_BLACK_WOMAN_YOUNGADULT_01.glb',height:1.68,x:-104,z:-37,wander:3.5,shirt:0x315944,pants:0x292332},
 {id:'market-merchant-1',name:'Kingdom Merchant',role:'merchant',ageLane:'adult',file:'SV_NPC_BLACK_MAN_ADULT_01.glb',height:1.82,x:96,z:-47,action:'creator-pose',shirt:0x704c2b,pants:0x27231f},
 {id:'market-merchant-2',name:'Kingdom Merchant',role:'merchant',ageLane:'adult',file:'SV_NPC_BLACK_WOMAN_ADULT_01.glb',height:1.69,x:111,z:-47,action:'creator-pose',shirt:0x6c3d57,pants:0x28212c},
 {id:'market-creator',name:'Creator Vendor',role:'creator',ageLane:'young-adult',file:'SV_NPC_MULTIRACIAL_YOUNGADULT_01.glb',height:1.72,x:126,z:-31,action:'creator-pose',shirt:0x2c566c,pants:0x1f2530},
 {id:'legacy-senior',name:'Family Historian',role:'mentor',ageLane:'senior',file:'SV_NPC_BLACK_WOMAN_SENIOR_01.glb',height:1.64,x:31,z:-114,action:'sit-relaxed',shirt:0x674b39,pants:0x2b2522},
 {id:'legacy-parent',name:'Legacy Parent',role:'parent',ageLane:'adult',file:'SV_NPC_BLACK_MAN_ADULT_01.glb',height:1.82,x:43,z:-114,action:'creator-pose',shirt:0x463a63,pants:0x1f1f28},
 {id:'legacy-child',name:'Family Learner',role:'family',ageLane:'child',file:'SV_NPC_CHILD_01.glb',height:1.33,x:37,z:-109,wander:2.4,shirt:0x3b6f7e,pants:0x313747},
 {id:'hebrew-teacher',name:'Hebrew Teacher',role:'teacher',ageLane:'adult',file:'SV_NPC_BLACK_WOMAN_ADULT_01.glb',height:1.69,x:-37,z:102,action:'creator-pose',shirt:0x354f70,pants:0x1e2734},
 {id:'hebrew-student-1',name:'Scripture Student',role:'student',ageLane:'teen',file:'SV_NPC_TEEN_01.glb',height:1.62,x:-47,z:111,action:'sit-relaxed',shirt:0x314f61,pants:0x252b39},
 {id:'hebrew-student-2',name:'Scripture Student',role:'student',ageLane:'young-adult',file:'SV_NPC_BLACK_MAN_YOUNGADULT_01.glb',height:1.80,x:-33,z:111,action:'sit-relaxed',shirt:0x314f61,pants:0x252b39},
 {id:'hebrew-student-3',name:'Scripture Student',role:'student',ageLane:'young-adult',file:'SV_NPC_BLACK_WOMAN_YOUNGADULT_01.glb',height:1.68,x:-27,z:116,action:'sit-relaxed',shirt:0x314f61,pants:0x252b39},
 {id:'garden-farmer',name:'Garden Steward',role:'farmer',ageLane:'adult',file:'SV_NPC_BLACK_MAN_ADULT_01.glb',height:1.82,x:-111,z:104,action:'mechanic-work',shirt:0x3e6537,pants:0x3a3428},
 {id:'garden-volunteer',name:'Garden Volunteer',role:'volunteer',ageLane:'adult',file:'SV_NPC_BLACK_WOMAN_ADULT_01.glb',height:1.69,x:-121,z:112,wander:5.5,shirt:0x4f733b,pants:0x3a3428},
 {id:'garden-student',name:'Garden Student',role:'student',ageLane:'teen',file:'SV_NPC_TEEN_01.glb',height:1.62,x:-101,z:119,wander:4.5,shirt:0x50763e,pants:0x31372b},
 {id:'press-editor',name:'Kingdoms Press Editor',role:'editor',ageLane:'adult',file:'SV_NPC_BLACK_WOMAN_ADULT_01.glb',height:1.69,x:111,z:103,action:'creator-pose',shirt:0x604a35,pants:0x272322},
 {id:'press-writer',name:'Writer',role:'writer',ageLane:'young-adult',file:'SV_NPC_BLACK_MAN_YOUNGADULT_01.glb',height:1.80,x:105,z:109,action:'sit-relaxed',shirt:0x4d3a2c,pants:0x20242a},
 {id:'press-host',name:'AI Café Host',role:'host',ageLane:'young-adult',file:'SV_NPC_BLACK_WOMAN_YOUNGADULT_01.glb',height:1.68,x:117,z:109,wander:2.8,shirt:0x5f4536,pants:0x2e2930},
 {id:'broadcast-host',name:'Broadcast Host',role:'host',ageLane:'adult',file:'SV_NPC_BLACK_MAN_ADULT_01.glb',height:1.82,x:185,z:34,action:'mic-performance',shirt:0x213f5d,pants:0x171d28},
 {id:'broadcast-producer',name:'Show Producer',role:'producer',ageLane:'adult',file:'SV_NPC_BLACK_WOMAN_ADULT_01.glb',height:1.69,x:185,z:44,action:'security-scan',shirt:0x2e4a62,pants:0x1b2330},
 {id:'broadcast-camera',name:'Camera Operator',role:'camera-operator',ageLane:'young-adult',file:'SV_NPC_BLACK_MAN_YOUNGADULT_01.glb',height:1.80,x:176,z:42,action:'creator-pose',shirt:0x252c36,pants:0x171b20},
];

function kyCitizenAccessory(person,spec){
 person.mesh.userData.kingdomCitizenId=spec.id;person.mesh.userData.kingdomRole=spec.role;person.displayName=spec.name;person.role=spec.role;person.ageLane=spec.ageLane;
 if(spec.role==='teacher'||spec.role==='editor'||spec.role==='writer'){
  const book=new T.Mesh(new T.BoxGeometry(.34,.05,.46),kyMaterial(0x8a6b2e));book.position.set(.24,.12,-.38);book.rotation.x=-.5;person.torso.add(book);
 }else if(spec.role==='farmer'||spec.role==='volunteer'){
  const badge=new T.Mesh(new T.BoxGeometry(.12,.12,.03),new T.MeshBasicMaterial({color:0x76c96b}));badge.position.set(.16,.1,-.35);person.torso.add(badge);
 }else if(spec.role==='host'||spec.role==='camera-operator'){
  const mic=new T.Mesh(new T.CylinderGeometry(.025,.035,.32,8),kyMaterial(0x1b1b1e));mic.position.set(.22,-.05,-.36);mic.rotation.z=.5;person.torso.add(mic);
 }
}
function kySpawnCitizen(spec,index){
 const person=makePerson(spec.shirt||pick(SHIRTS),spec.pants||pick(PANTS),pick(SKINS));
 const fallbackScale=Number(spec.height||1.75)/1.75;person.mesh.scale.multiplyScalar(fallbackScale);
 attachProductionHuman(person,index,{file:spec.file,targetHeight:spec.height,role:spec.role,ageLane:spec.ageLane});
 kyCitizenAccessory(person,spec);
 person.anchor=new T.Vector3(spec.x,0,spec.z);person.pos=person.anchor.clone();person.mesh.position.copy(person.pos);
 person.heading=Number(spec.heading||0);person.mesh.rotation.y=person.heading;person.spd=Number(spec.speed||.45);person.wander=Number(spec.wander||0);person.angle=index*.73;
 if(spec.action)setPersonRpAction(person,spec.action,{loop:true,durationMs:600000});
 kyCitizens.push(person);return person;
}
KY_CITIZEN_SPECS.forEach(kySpawnCitizen);
window.YAHISRAEL_CITIZEN_COUNT=kyCitizens.length;

function nearestKingdomActivity(radius=4.5){
 let best=null,dist=radius;
 for(const a of KY_ACTIVITIES){const dd=Math.hypot(player.pos.x-a.x,player.pos.z-a.z);if(dd<dist){dist=dd;best=a}}
 return best;
}
function kyPlantServiceCrop(a){
 if(a.id!=='garden-service')return;
 const state=kyReadActivities(),count=state.completed.includes(a.id)?2:1;
 for(let i=0;i<count;i++){
  const plant=new T.Mesh(new T.ConeGeometry(.55,1.9,7),kyMaterial(0x58a850,0x173a17));
  plant.position.set(a.x-1.2+i*2.4,1.05,a.z-.8);scene.add(plant);
 }
}
function completeKingdomActivity(a){
 if(!a)return;
 const state=kyReadActivities(),first=!state.completed.includes(a.id);
 kyPost('MISSION_STARTED',{missionId:a.missionId,destination:a.label,district:a.destinationId,contentId:a.id});
 if(first){
  state.completed.push(a.id);kyWriteActivities(state);kyPlantServiceCrop(a);
  kyPost('MISSION_COMPLETED',{missionId:a.missionId,destination:a.label,district:a.destinationId,contentId:a.id});
 }
 const nearby=kyCitizens.filter(p=>Math.hypot(p.anchor.x-a.x,p.anchor.z-a.z)<12);
 for(const p of nearby)if(a.action)setPersonRpAction(p,a.action,{loop:false,durationMs:4200});
 toast((first?'Activity complete • server verification requested: ':'Already completed: ')+a.shortLabel);
 try{window.dispatchEvent(new CustomEvent('tryamm:kingdom-activity-completed',{detail:{...a,first,serverVerified:false}}))}catch{}
 if(a.route)setTimeout(()=>kyPost('KINGDOM_PORTAL_REQUEST',{destination:a.route,district:a.destinationId,missionId:a.missionId,contentId:a.id}),260);
}
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
 if(d.id==='judah-gate'&&d.route)setTimeout(()=>kyPost('KINGDOM_PORTAL_REQUEST',{destination:d.route,district:d.shortName,missionId:d.missionId,contentId:d.id}),180);
}
function updateYahisraelLivingWorld(dt,now){
 const t=now*.001;
 for(let i=0;i<kyAnimated.length;i++){
  const a=kyAnimated[i];
  if(a.type==='spin')a.mesh.rotation.z=t*(i%2?-.24:.24);
  else if(a.type==='pulse')a.mesh.position.y=14+Math.sin(t*1.5)*.22;
 }
 for(let i=0;i<kyActivityMarkers.length;i++){
  const m=kyActivityMarkers[i],done=(window.YAHISRAEL_ACTIVITY_PROGRESS?.completed||[]).includes(m.activity.id);
  m.ring.rotation.z=t*.55+i*.2;m.ring.material.opacity=done?.28:(.6+.18*Math.sin(t*2+i));
  m.beam.material.opacity=done?.05:(.10+.05*Math.sin(t*1.6+i));
 }
 for(const p of kyCitizens){
  if(p.wander>0&&!p.rpAction){
   p.angle+=dt*p.spd*.35;
   const nx=p.anchor.x+Math.cos(p.angle)*p.wander,nz=p.anchor.z+Math.sin(p.angle)*p.wander;
   const dx=nx-p.pos.x,dz=nz-p.pos.z;p.heading=Math.atan2(-dx,-dz);p.pos.x=nx;p.pos.z=nz;
   p.phase+=dt*2.2;animatePerson(p,p.phase,.55);p.mesh.position.copy(p.pos);p.mesh.rotation.y=p.heading;
  }else{
   p.phase+=dt*1.4;animatePerson(p,p.phase,.18);p.mesh.position.copy(p.pos);p.mesh.rotation.y=p.heading;
  }
 }
}
window.updateYahisraelLivingWorld=updateYahisraelLivingWorld;
