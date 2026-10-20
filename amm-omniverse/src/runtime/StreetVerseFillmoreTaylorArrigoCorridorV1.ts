import * as THREE from 'three'

/**
 * Game-local, non-surveyed neighborhood route from the modeled Circle Park gate
 * to Fillmore Street, Taylor Street/Little Italy and Arrigo Park.
 * Actual geography: Fillmore and Taylor are east-west streets; Arrigo Park
 * is at 801 S Loomis St, north of Taylor near Polk. Scene coordinates are
 * schematic for the current mobile-world slice, NOT turn-by-turn directions.
 */
export const STREETVERSE_FILLMORE_TAYLOR_ARRIGO_STOPS=[
 {id:'fillmore',label:'W FILLMORE STREET',x:-8,z:19,description:'Find the west-side Fillmore Street marker and street crossing'},
 {id:'taylor',label:'W TAYLOR STREET',x:-8,z:-8,description:'Follow the Little Italy and UIC Taylor Street corridor'},
 {id:'little-italy',label:'LITTLE ITALY',x:24,z:-8,description:'Explore the Taylor Street neighborhood history and businesses'},
 {id:'arrigo-park',label:'ARRIGO PARK',x:67,z:-10,description:'Reach the public green space at the modeled Arrigo Park landmark'},
] as const

export function installStreetVerseFillmoreTaylorArrigoCorridorV1(root:THREE.Group){
 const group=new THREE.Group()
 group.name='streetverse-fillmore-taylor-arrigo-schematic-v1'
 group.userData={reference:'Chicago street naming, Chicago Park District Arrigo Park, user Circle Park photos',surveyed:false,routeIsRealWorldNavigation:false,gateSecurityMap:false}
 root.add(group)
 const mats:THREE.Material[]=[],textures:THREE.CanvasTexture[]=[]
 const makeMat=(color:number)=>{const m=new THREE.MeshLambertMaterial({color});mats.push(m);return m}
 const brick=makeMat(0x8c5341),blackIron=makeMat(0x252b2d),grass=makeMat(0x597b49),
       concrete=makeMat(0xbcb5a8),darkPath=makeMat(0x586168),treeBark=makeMat(0x625244),
       foliage=makeMat(0x447c45),white=makeMat(0xe6e5dd)
 const box=(name:string,size:[number,number,number],pos:[number,number,number],material:THREE.Material)=>{
  const item=new THREE.Mesh(new THREE.BoxGeometry(...size),material)
  item.name=name;item.position.set(...pos);item.castShadow=false;item.receiveShadow=false;group.add(item);return item
 }
 const sign=(text:string,x:number,z:number)=>{
  if(typeof document==='undefined')return
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=110
  const ctx=canvas.getContext('2d');if(!ctx)return
  ctx.fillStyle='#102531';ctx.fillRect(0,0,512,110)
  ctx.strokeStyle='#e6cc7a';ctx.lineWidth=4;ctx.strokeRect(4,4,504,102)
  ctx.fillStyle='#fff';ctx.font='bold 37px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle'
  ctx.fillText(text,256,55)
  const texture=new THREE.CanvasTexture(canvas);textures.push(texture)
  const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false});mats.push(material)
  const sprite=new THREE.Sprite(material);sprite.name='little-italy-route-wayfinding-sign'
  sprite.position.set(x,3.8,z);sprite.scale.set(8.4,1.8,1);group.add(sprite)
 }
 sign('W FILLMORE ST',-8,19)
 sign('W TAYLOR ST',-8,-8)
 sign('LITTLE ITALY',24,-8)
 sign('ARRIGO PARK',67,-10)
 // Pathside paint and crossing details are visual only; existing traversal and
 // original city roads remain authoritative for physics and movement.
 for(const [x,z] of [[-8,19],[-8,-8],[24,-8],[60,-8]]){
  box('little-italy-walkway-waypoint',[2.8,.065,1.3],[x,.185,z+7.3],concrete)
 }
 for(let i=0;i<6;i++)box('fillmore-street-pedestrian-crosswalk',[.65,.03,2.2],[-10.7+i*1.0,.18,17.3],white)
 // Park is a small playable landmark silhouette, not an exact 7.23-acre copy.
 // Keep it beyond the x=48 street margin to preserve the existing car lanes.
 box('arrigo-park-grass-pocket',[15,.1,18],[70,.14,-12],grass)
 box('arrigo-park-cross-path',[3.1,.035,16],[70,.22,-12],concrete)
 box('arrigo-park-side-path',[12,.035,2.2],[70,.23,-12],concrete)
 for(const [x,z] of [[64,-19],[76,-18],[63,-4],[77,-5]]){
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.20,.34,3.7,7),treeBark)
  trunk.name='arrigo-park-mature-tree-trunk';trunk.position.set(x,1.9,z);group.add(trunk)
  for(const [dx,dy,r] of [[0,4.7,1.8],[-1.0,4.3,1.2],[.8,4.5,1.3]]){
   const leaf=new THREE.Mesh(new THREE.DodecahedronGeometry(r,1),foliage)
   leaf.name='arrigo-park-mature-tree-canopy';leaf.position.set(x+dx,dy,z);group.add(leaf)
  }
 }
 for(const [x,z] of [[66,-12],[74,-13]]){
  box('arrigo-park-public-bench-seat',[2.3,.16,.55],[x,.75,z],blackIron)
  box('arrigo-park-public-bench-back',[2.3,.75,.12],[x,1.11,z+.32],blackIron)
  for(const offset of [-.8,.8])box('arrigo-park-public-bench-leg',[.12,.68,.13],[x+offset,.34,z],blackIron)
 }
 box('arrigo-park-heritage-plinth',[1.4,.6,1.2],[70,.55,-4.2],brick)
 box('arrigo-park-heritage-panel',[1.1,1,.12],[70,1.35,-3.5],darkPath)
 sign('ARRIGO • LITTLE ITALY',70,-3.5)
 group.userData={...group.userData,fillmoreVisible:true,taylorVisible:true,arrigoPocketVisible:true,parkAddress:'801 S Loomis St',noNewExternalAssetRequests:true}
 return{group,disposeMaterials:()=>{textures.forEach(t=>t.dispose());mats.forEach(m=>m.dispose())}}
}
