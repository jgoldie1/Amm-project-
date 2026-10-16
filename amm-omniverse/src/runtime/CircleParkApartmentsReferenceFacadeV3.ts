import * as THREE from 'three'

/**
 * Circle Park 1111 S Ashland architectural study, based on the property's
 * publicly visible exterior gallery (circleparkchicago.com/gallery).
 * This is an original low-poly interpretation: not a measured/surveyed replica,
 * not photo-textured property imagery, and not a claim of site authorization.
 */
export type CircleParkReferenceFacadeV3={
 towerFloors:number
 windowBays:number
 visibleWindows:number
 facadeVents:number
 brickTownhomes:number
 source:string
 decorateTownhome:(home:THREE.Group,index:number)=>void
 disposeMaterials:()=>void
}

export function installCircleParkApartmentsReferenceFacadeV3(root:THREE.Group):CircleParkReferenceFacadeV3{
 const ownedMaterials:THREE.Material[]=[]
 const mat=(hex:number,roughness=0.84,metalness=0)=>{
  const m=new THREE.MeshStandardMaterial({color:hex,roughness,metalness})
  ownedMaterials.push(m)
  return m
 }
 const limestone=mat(0xaba597,.91),concrete=mat(0x999185,.95),ribbed=mat(0x817d74,.93)
 const bronzeFrame=mat(0x373b3a,.65,.30),ventMetal=mat(0x4d514f,.85,.15)
 const glass=mat(0xffffff,.26,.11),curtain=mat(0xc2c4bc,.96)
 const darkGlass=mat(0x344b54,.25,.12),brickRed=mat(0x8c483c,.96),sidingRed=mat(0x754338,.9)
 const roofDark=mat(0x4a4642,.9),entryMetal=mat(0x323738,.59,.20),plant=mat(0x476b43,.98),treeBark=mat(0x585049,.98)
 const facade=new THREE.Group()
 facade.name='circle-park-1111-photo-reference-facade-v3'
 facade.userData={site:'1111 S Ashland Ave, Chicago',reference:'circleparkchicago.com/gallery',surveyed:false,photoTextureUsed:false,style:'eight-story-concrete-grid-and-brick-townhomes'}
 root.add(facade)
 const box=(parent:THREE.Group,name:string,size:[number,number,number],pos:[number,number,number],material:THREE.Material)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material)
  mesh.name=name;mesh.position.set(...pos);mesh.castShadow=false;mesh.receiveShadow=true
  parent.add(mesh)
  return mesh
 }
 const instanced=(name:string,geometry:THREE.BufferGeometry,material:THREE.Material,count:number,positions:Array<[number,number,number]>,scale?:[number,number,number])=>{
  const inst=new THREE.InstancedMesh(geometry,material,count)
  inst.name=name;inst.castShadow=false;inst.receiveShadow=false
  const actor=new THREE.Object3D()
  positions.forEach(([x,y,z],i)=>{actor.position.set(x,y,z);actor.scale.set(...(scale||[1,1,1]));actor.updateMatrix();inst.setMatrixAt(i,actor.matrix)})
  inst.instanceMatrix.needsUpdate=true;inst.computeBoundingSphere();facade.add(inst)
  return inst
 }
 // Opaque skin hides the old oversized blue-glass strips without changing
 // building placement, collisions, senior commons, or the historical layers.
 box(facade,'circle-park-1111-concrete-facade-skin',[19.72,20.22,.18],[-38,13.80,49.43],limestone)
 const floors=7,bays=6,windowCenters:Array<[number,number,number]>=[]
 const curtainPositions:Array<[number,number,number]>=[]
 const ventPositions:Array<[number,number,number]>=[]
 for(let floor=0;floor<floors;floor++){
  const y=4.81+floor*2.7
  // Thin ochre spandrels alternate with windows in the actual 8-story block.
  box(facade,'circle-park-1111-spandrel-band',[19.45,.82,.12],[-38,y-1.01,49.59],concrete)
  box(facade,'circle-park-1111-window-lintel',[19.45,.18,.14],[-38,y+.80,49.60],limestone)
  for(let bay=0;bay<bays;bay++){
   const x=-45.32+bay*2.93
   windowCenters.push([x,y,49.66])
   if((floor*3+bay*7)%5<=1)curtainPositions.push([x,y+.29,49.729])
   ventPositions.push([x,y-1.01,49.675])
  }
 }
 box(facade,'circle-park-1111-roof-parapet',[20.15,.55,10.25],[-38,24.12,44.15],concrete)
 const pane=instanced('circle-park-1111-individual-windows-v3',new THREE.BoxGeometry(2.55,1.36,.10),glass,windowCenters.length,windowCenters)
 const windowPalette=[0x5c7887,0x9baeb1,0x768990,0x516d80,0xb0afb0,0x647d84]
 windowCenters.forEach((_,i)=>pane.setColorAt(i,new THREE.Color(windowPalette[(i*7+Math.floor(i/bays)*3)%windowPalette.length])))
 if(pane.instanceColor)pane.instanceColor.needsUpdate=true
 const mullions=windowCenters.map(([x,y,z])=>[x+.33,y,z+.092] as [number,number,number])
 instanced('circle-park-1111-bronze-mullions-v3',new THREE.BoxGeometry(.085,1.37,.065),bronzeFrame,mullions.length,mullions)
 const windowTops=windowCenters.map(([x,y,z])=>[x,y+.71,z+.083] as [number,number,number])
 const windowBottoms=windowCenters.map(([x,y,z])=>[x,y-.71,z+.083] as [number,number,number])
 instanced('circle-park-1111-window-headers-v3',new THREE.BoxGeometry(2.67,.08,.12),bronzeFrame,windowTops.length,windowTops)
 instanced('circle-park-1111-window-sills-v3',new THREE.BoxGeometry(2.67,.09,.13),bronzeFrame,windowBottoms.length,windowBottoms)
 const shade=instanced('circle-park-1111-interior-blinds-v3',new THREE.BoxGeometry(2.37,.68,.025),curtain,curtainPositions.length,curtainPositions)
 shade.material.transparent=true
 ;(shade.material as THREE.MeshStandardMaterial).opacity=.79
 // Actual windows have repetitive narrow wall AC / ventilation grilles below them.
 instanced('circle-park-1111-wall-ac-vents-v3',new THREE.BoxGeometry(.86,.30,.12),ventMetal,ventPositions.length,ventPositions)
 const grillePositions=ventPositions.flatMap(([x,y,z])=>[-.24,-.08,.08,.24].map(d=>[x+d,y,z+.078] as [number,number,number]))
 instanced('circle-park-1111-ac-grille-slats-v3',new THREE.BoxGeometry(.044,.22,.032),bronzeFrame,grillePositions.length,grillePositions)
 const piers=Array.from({length:7},(_,i)=>[-47.43+i*3.03,13.75,49.66] as [number,number,number])
 instanced('circle-park-1111-vertical-concrete-piers-v3',new THREE.BoxGeometry(.28,20.30,.26),ribbed,piers.length,piers)
 // Entry remains at the original in-game 1111 anchor, with recessed glazing.
 box(facade,'circle-park-1111-dark-entry-surround',[9.4,3.24,.26],[-38,1.66,49.57],entryMetal)
 box(facade,'circle-park-1111-recessed-glass-entrance',[8.80,2.95,.09],[-38,1.65,49.76],darkGlass)
 box(facade,'circle-park-1111-double-door-left',[1.60,2.52,.08],[-38.86,1.44,49.88],glass)
 box(facade,'circle-park-1111-double-door-right',[1.60,2.52,.08],[-37.14,1.44,49.88],glass)
 box(facade,'circle-park-1111-entry-center-mullion',[.12,2.62,.14],[-38,1.44,49.97],bronzeFrame)
 box(facade,'circle-park-1111-address-plaque',[2.55,.60,.13],[-38,3.43,50.25],concrete)
 for(const x of [-41.65,-34.35])box(facade,'circle-park-1111-lobby-light',[.20,.18,.16],[x,3.35,51.12],limestone)

 // Mature landscaped tree canopy and entry planters frame the frontage photo.
 const treeSites:[number,number,number][]=[[-53.2,36,1.0],[-25.0,38,.91],[-52.5,53,.93]]
 treeSites.forEach(([x,z,size],i)=>{
  const tree=new THREE.Group();tree.name='circle-park-mature-entry-tree-'+(i+1);tree.position.set(x,0,z)
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.23*size,.36*size,5.6*size,8),treeBark)
  trunk.name='circle-park-entry-tree-trunk';trunk.position.y=2.8*size;tree.add(trunk)
  const lobes:[[number,number,number,number],[number,number,number,number],[number,number,number,number]]=[
   [0,6.2,0,2.45],[1.5,6.5,-.7,1.78],[-1.5,6.3,.7,1.86]
  ]
  lobes.forEach(([dx,y,dz,r],n)=>{const crown=new THREE.Mesh(new THREE.DodecahedronGeometry(r*size,1),plant);crown.name='circle-park-entry-tree-crown-'+n;crown.position.set(dx*size,y*size,dz*size);crown.scale.set(1.1,.82,1);tree.add(crown)})
  facade.add(tree)
 })

 let decorated=0
 const decorateTownhome=(home:THREE.Group,index:number)=>{
  decorated++
  home.userData={...home.userData,architecturalReference:'circle-park-1980s-brick-red-siding-v3',surveyed:false}
  const prefix='circle-park-townhome-photo-v3-'
  const add=(name:string,size:[number,number,number],pos:[number,number,number],m:THREE.Material)=>box(home,prefix+name,size,pos,m)
  // Original townhome keeps its brick mass and roof; overlay painted siding and
  // symmetrical casement windows so it no longer reads as a featureless cube.
  add('red-siding-upper',[5.25,1.55,.12],[0,4.41,3.79],sidingRed)
  add('red-siding-lower',[5.25,.62,.12],[0,2.84,3.79],sidingRed)
  for(const side of [-1,1]){
   add('vertical-brick-pier',[.37,5.55,.27],[side*2.87,2.78,3.82],brickRed)
   for(const level of [1,2]){
    const y=level===1?2.08:4.55
    const x=side*1.60
    add('black-casement-frame',[1.85,1.45,.12],[x,y,3.95],bronzeFrame)
    add('casement-blue-glass',[1.59,1.21,.13],[x,y,4.045],glass)
    add('window-center-mullion',[.085,1.21,.14],[x,y,4.14],bronzeFrame)
    add('window-sill',[2.0,.12,.27],[x,y-.78,4.035],limestone)
   }
   add('wall-ac-vent',[.62,.33,.15],[side*2.35,3.45,3.92],ventMetal)
  }
  add('recessed-entry',[1.55,2.52,.10],[0,1.32,3.97],entryMetal)
  add('entry-canopy',[2.65,.18,1.45],[0,2.73,4.40],roofDark)
  add('address-step',[2.40,.18,1.35],[0,.15,4.34],limestone)
  if(index%2===0)add('side-masonry-utility-panel',[.18,.75,1.65],[3.12,2.3,-1.75],concrete)
 }
 return{
  towerFloors:8,windowBays:bays,visibleWindows:windowCenters.length,facadeVents:ventPositions.length,
  get brickTownhomes(){return decorated},
  source:'Circle Park official exterior gallery; original geometry; approximate placement',
  decorateTownhome,
  disposeMaterials:()=>ownedMaterials.forEach(m=>m.dispose())
 }
}
