import * as THREE from 'three'

/**
 * Circle Park's Taylor Street/South Laflin approach: an original game
 * reconstruction, NOT a surveyed security map or description of active gates.
 * The route is grounded in historical apartment directions; precise placement,
 * booth, staff, and access rules are fictional for StreetVerse.
 */
export function installCircleParkTaylorGuardGateV1(
 root:THREE.Group,opts:{x:number;z:number;reference:string}
){
 const group=new THREE.Group()
 group.name='circle-park-taylor-laflin-guard-entrance-v1'
 group.position.set(opts.x,0,opts.z)
 group.userData={reference:opts.reference,realWorldSecurityMap:false,gameplayOnly:true,open:false}
 root.add(group)
 const owned:THREE.Material[]=[]
 const mat=(color:number,roughness=.86,metalness=0)=>{
  const m=new THREE.MeshStandardMaterial({color,roughness,metalness})
  owned.push(m);return m
 }
 const brick=mat(0x895e4e),concrete=mat(0xb9b2a5),metal=mat(0x30373a,.55,.36)
 const yellow=mat(0xd6a441),paving=mat(0x50565a),white=mat(0xe3e0d6)
 const signPaint=mat(0x486078),windowGlass=mat(0x7498a6,.26,.12)
 const box=(name:string,size:[number,number,number],pos:[number,number,number],surface:THREE.Material,parent=group)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),surface)
  mesh.name=name;mesh.position.set(...pos);parent.add(mesh)
  return mesh
 }
 box('taylor-laflin-entry-approach-pavement',[10,.08,14],[0,.12,-6],paving)
 box('taylor-laflin-entry-accessible-ramp',[3.4,.07,3.5],[2.9,.18,-9],concrete)
 box('taylor-laflin-entry-pedestrian-walk',[3.0,.08,10],[2.9,.18,-3],concrete)
 box('taylor-laflin-entry-vehicle-stop-line',[8,.025,.22],[0,.22,-12],white)
 for(let i=0;i<5;i++)box('taylor-laflin-entry-crosswalk-stripe',[.48,.025,2.4],[-2.8+i*.9,.22,-10],white)
 for(let i=0;i<6;i++)box('taylor-laflin-entry-tactile-ramp',[.075,.04,1.3],[1.9+i*.34,.25,-9.4],yellow)
 for(const side of [-1,1]){
  box('taylor-laflin-entry-brick-pillar',[.75,3.1,.75],[side*4.8,1.55,1],brick)
  box('taylor-laflin-entry-pillar-cap',[.92,.2,.92],[side*4.8,3.2,1],concrete)
  box('taylor-laflin-entry-fence-rail',[3.6,.12,.12],[side*6.9,1.2,1],metal)
  box('taylor-laflin-entry-safety-bollard',[.3,.95,.3],[side*3.8,.48,-3],yellow)
 }
 // Exterior reference photos show masonry piers with narrow black iron pickets.
 // These are fictionalized sections; no real gate hardware or security controls.
 const picketPositions:Array<[number,number,number]>=[]
 for(const side of [-1,1]){
  box('taylor-laflin-entry-outer-masonry-pier',[.74,2.7,.74],[side*13.1,1.35,1],brick)
  for(const y of [.43,1.82])box('taylor-laflin-entry-wrought-iron-horiz-rail',[7.05,.11,.11],[side*8.90,y,1],metal)
  for(let i=0;i<14;i++)picketPositions.push([side*(5.2+i*.56),1.04,1])
 }
 const ironGeometry=new THREE.BoxGeometry(.105,1.95,.10)
 const ironPickets=new THREE.InstancedMesh(ironGeometry,metal,picketPositions.length)
 ironPickets.name='circle-park-reference-black-iron-fence'
 const actor=new THREE.Object3D()
 picketPositions.forEach(([x,y,z],i)=>{actor.position.set(x,y,z);actor.updateMatrix();ironPickets.setMatrixAt(i,actor.matrix)})
 ironPickets.instanceMatrix.needsUpdate=true;group.add(ironPickets)
 box('taylor-laflin-entry-overhead-beam',[10.2,.38,.8],[0,3.42,1],concrete)
 box('taylor-laflin-entry-guard-canopy',[3.9,.20,2.65],[-6.3,3,-.6],concrete)
 box('taylor-laflin-entry-guard-window',[2.65,1.2,.09],[-6.3,1.89,1.35],windowGlass)
 box('taylor-laflin-entry-visitor-checkin-plaque',[3.0,.54,.1],[-6.3,2.75,1.45],signPaint)
 const left=new THREE.Group(),right=new THREE.Group()
 left.name='taylor-laflin-entry-left-swing-gate'
 right.name='taylor-laflin-entry-right-swing-gate'
 left.position.set(-4.22,0,1.0);right.position.set(4.22,0,1.0)
 group.add(left,right)
 const panel=(pivot:THREE.Group,side:number)=>{
  box('taylor-laflin-entry-moving-gate',[3.65,1.75,.13],[side*1.82,1.08,0],metal,pivot)
  for(const y of [.57,1.65])box('taylor-laflin-entry-gate-rail',[3.63,.10,.16],[side*1.82,y,.1],concrete,pivot)
  for(let i=0;i<7;i++)box('taylor-laflin-entry-gate-bar',[.095,1.72,.14],[side*(.25+i*.51),1.08,.14],metal,pivot)
 }
 panel(left,1);panel(right,-1)
 // Text is original and sign is rendered locally, with no image download.
 let signTexture:THREE.CanvasTexture|null=null
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=160
  const ctx=canvas.getContext('2d')
  if(ctx){
   ctx.fillStyle='#182932';ctx.fillRect(0,0,768,160)
   ctx.strokeStyle='#ffc65b';ctx.lineWidth=8;ctx.strokeRect(6,6,756,148)
   ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle'
   ctx.font='bold 47px sans-serif';ctx.fillText('CIRCLE PARK',384,62)
   ctx.font='bold 28px sans-serif';ctx.fillText('TAYLOR ST / LAFLIN • VISITOR ENTRY',384,119)
   signTexture=new THREE.CanvasTexture(canvas)
   const spriteMat=new THREE.SpriteMaterial({map:signTexture,transparent:true,depthWrite:false})
   owned.push(spriteMat)
   const sprite=new THREE.Sprite(spriteMat);sprite.name='taylor-laflin-entry-visible-sign'
   sprite.position.set(0,4.45,1);sprite.scale.set(10,2.08,1);group.add(sprite)
  }
 }
 const setOpen=(open:boolean)=>{
  left.rotation.y=open?-1.06:0;right.rotation.y=open?1.06:0
  group.userData.open=open
 }
 return{setOpen,disposeMaterials:()=>{signTexture?.dispose();owned.forEach(m=>m.dispose())}}
}
