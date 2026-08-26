import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function StreetVerseVisualUpgrade(){
  const mountRef=useRef<HTMLDivElement|null>(null)

  useEffect(()=>{
    const mount=mountRef.current
    if(!mount)return

    const scene=new THREE.Scene()
    scene.background=new THREE.Color(0x07111f)
    scene.fog=new THREE.Fog(0x07111f,55,220)

    const camera=new THREE.PerspectiveCamera(60,1,.1,600)
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    renderer.shadowMap.enabled=true
    renderer.shadowMap.type=THREE.PCFSoftShadowMap
    renderer.toneMapping=THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure=1.18
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0x90cfff,0x121118,2.2))
    const sun=new THREE.DirectionalLight(0xfff4db,3.2)
    sun.position.set(-55,85,30)
    sun.castShadow=true
    sun.shadow.mapSize.set(1024,1024)
    scene.add(sun)

    const city=new THREE.Group();scene.add(city)
    const roadMat=new THREE.MeshStandardMaterial({color:0x1f252d,roughness:.96})
    const sidewalkMat=new THREE.MeshStandardMaterial({color:0x737a80,roughness:.9})
    const grassMat=new THREE.MeshStandardMaterial({color:0x183b2d,roughness:1})
    const laneMat=new THREE.MeshBasicMaterial({color:0xf2d06b})
    const concrete=new THREE.MeshStandardMaterial({color:0xa8adb2,roughness:.88})

    const ground=new THREE.Mesh(new THREE.PlaneGeometry(210,170),grassMat)
    ground.rotation.x=-Math.PI/2;ground.position.z=10;ground.receiveShadow=true;city.add(ground)

    for(const z of [-48,0,48]){
      const road=new THREE.Mesh(new THREE.BoxGeometry(205,.18,14),roadMat);road.position.set(0,.09,z);road.receiveShadow=true;city.add(road)
      for(let x=-92;x<95;x+=11){const line=new THREE.Mesh(new THREE.BoxGeometry(5,.03,.18),laneMat);line.position.set(x,.2,z);city.add(line)}
      for(const off of [-9,9]){const sw=new THREE.Mesh(new THREE.BoxGeometry(205,.28,4),sidewalkMat);sw.position.set(0,.14,z+off);sw.receiveShadow=true;city.add(sw)}
    }
    for(const x of [-50,0,50]){
      const road=new THREE.Mesh(new THREE.BoxGeometry(14,.18,142),roadMat);road.position.set(x,.09,7);road.receiveShadow=true;city.add(road)
      for(let z=-56;z<73;z+=11){const line=new THREE.Mesh(new THREE.BoxGeometry(.18,.03,5),laneMat);line.position.set(x,.2,z);city.add(line)}
      for(const off of [-9,9]){const sw=new THREE.Mesh(new THREE.BoxGeometry(4,.28,142),sidewalkMat);sw.position.set(x+off,.14,7);sw.receiveShadow=true;city.add(sw)}
    }

    const waterMat=new THREE.MeshStandardMaterial({color:0x0c6288,roughness:.2,metalness:.18,transparent:true,opacity:.94})
    const water=new THREE.Mesh(new THREE.PlaneGeometry(210,38),waterMat)
    water.rotation.x=-Math.PI/2;water.position.set(0,.05,-80);city.add(water)
    const promenade=new THREE.Mesh(new THREE.BoxGeometry(210,.35,8),concrete);promenade.position.set(0,.18,-59);city.add(promenade)

    const makeLabel=(text:string,bg:string,fg='#ffffff')=>{
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128
      const ctx=canvas.getContext('2d')!;ctx.fillStyle=bg;ctx.fillRect(0,0,512,128)
      ctx.fillStyle=fg;ctx.font='900 42px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64)
      const tex=new THREE.CanvasTexture(canvas)
      const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true})
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(10,2.5),mat)
      mesh.userData.texture=tex
      return mesh
    }

    const buildingBoxes:THREE.Box3[]=[]
    const facadeColors=[0x223244,0x343142,0x34403a,0x4a382f,0x263a47,0x343c50]
    for(let gx=-3;gx<=3;gx++)for(let gz=-2;gz<=2;gz++){
      if(gx===0||gz===0)continue
      const x=gx*25+(gx%2?2:-2),z=gz*24+(gz%2?-2:2)
      if(z<-50)continue
      const h=16+((Math.abs(gx*17+gz*11)*7)%34)
      const w=13+(Math.abs(gz)%2)*3
      const d=13+(Math.abs(gx)%2)*2
      const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:facadeColors[(gx+gz+12)%facadeColors.length],metalness:.18,roughness:.58}))
      b.position.set(x,h/2,z);b.castShadow=true;b.receiveShadow=true;city.add(b)
      buildingBoxes.push(new THREE.Box3().setFromObject(b).expandByScalar(1))
      const roof=new THREE.Mesh(new THREE.BoxGeometry(w*.72,.8,d*.72),new THREE.MeshStandardMaterial({color:0x111820,roughness:.8}))
      roof.position.set(x,h+.4,z);city.add(roof)
      const windowMat=new THREE.MeshBasicMaterial({color:((gx+gz)%3===0)?0xffca70:0x77d8ff})
      for(let y=4;y<h-2;y+=4){
        for(const side of [-1,1]){
          const strip=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.75),windowMat)
          strip.position.set(x+side*(w/2+.01),y,z+(y%8?2.3:-2.3));strip.rotation.y=side>0?Math.PI/2:-Math.PI/2;city.add(strip)
        }
      }
    }

    const tower=new THREE.Group()
    const towerBody=new THREE.Mesh(new THREE.CylinderGeometry(5.2,7.8,62,6),new THREE.MeshStandardMaterial({color:0x27384f,metalness:.42,roughness:.35}))
    towerBody.position.y=31;towerBody.castShadow=true;tower.add(towerBody)
    const crown=new THREE.Mesh(new THREE.CylinderGeometry(3.8,5.2,8,6),new THREE.MeshStandardMaterial({color:0x17314a,emissive:0x0a2740,emissiveIntensity:.8}))
    crown.position.y=66;tower.add(crown)
    const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.25,.45,18,8),new THREE.MeshStandardMaterial({color:0xb8c7d5,metalness:.8,roughness:.25}))
    antenna.position.y=79;tower.add(antenna);tower.position.set(-78,0,42);city.add(tower)

    const storefronts=[
      {text:'64 TRACK STUDIO',x:-38,z:-28,bg:'#5b1ca8'},
      {text:'ALL AMERICAN MARKET',x:36,z:-22,bg:'#0f7b45'},
      {text:'ALL AMERICAN NETWORK',x:34,z:34,bg:'#174ea6'},
      {text:'LAKEFRONT MARINA',x:-42,z:-57,bg:'#0b668a'},
    ]
    storefronts.forEach(s=>{const label=makeLabel(s.text,s.bg);label.position.set(s.x,4.5,s.z);label.rotation.y=Math.PI;city.add(label)})

    const makeTree=(x:number,z:number,scale=1)=>{
      const g=new THREE.Group()
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.25,.35,3.1,8),new THREE.MeshStandardMaterial({color:0x5a3d28,roughness:1}));trunk.position.y=1.55;g.add(trunk)
      const leaves=new THREE.Mesh(new THREE.IcosahedronGeometry(1.65,1),new THREE.MeshStandardMaterial({color:0x2f7047,roughness:.95}));leaves.position.y=3.8;leaves.scale.set(1,1.25,1);g.add(leaves)
      g.position.set(x,0,z);g.scale.setScalar(scale);city.add(g)
    }
    for(const z of [-31,17,65])for(const x of [-83,-67,-33,33,67,83])makeTree(x,z,.9+(Math.abs(x+z)%3)*.08)

    const lampBulbs:THREE.PointLight[]=[]
    const makeLamp=(x:number,z:number)=>{
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.09,.13,5.5,8),new THREE.MeshStandardMaterial({color:0x252a30,metalness:.6,roughness:.45}));pole.position.set(x,2.75,z);city.add(pole)
      const bulb=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),new THREE.MeshBasicMaterial({color:0xffe6a8}));bulb.position.set(x,5.35,z);city.add(bulb)
      const light=new THREE.PointLight(0xffd894,18,16,2);light.position.set(x,5.1,z);city.add(light);lampBulbs.push(light)
    }
    for(const z of [-57,-39,-9,9,39,57])for(const x of [-58,-8,42,92])makeLamp(x,z)

    const npcColors=[0xf05278,0x52a7ff,0x7fe080,0xffb458,0xb07cff,0xeaeaea]
    const npcs:{g:THREE.Group;baseX:number;baseZ:number;phase:number}[]=[]
    for(let i=0;i<18;i++){
      const g=new THREE.Group()
      const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,1.15,4,8),new THREE.MeshStandardMaterial({color:npcColors[i%npcColors.length],roughness:.75}));body.position.y=1.35;body.castShadow=true;g.add(body)
      const head=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),new THREE.MeshStandardMaterial({color:[0x8b5d45,0xb77d5c,0xd49a79,0x6f4937][i%4]}));head.position.y=2.55;g.add(head)
      const baseX=-82+(i%9)*20,baseZ=i%2?17:-17;g.position.set(baseX,0,baseZ);city.add(g);npcs.push({g,baseX,baseZ,phase:i*.7})
    }

    const makeCar=(color:number,scale=1)=>{
      const g=new THREE.Group();const paint=new THREE.MeshStandardMaterial({color,metalness:.76,roughness:.18})
      const lower=new THREE.Mesh(new THREE.BoxGeometry(4.8*scale,.72*scale,2.15*scale),paint);lower.position.y=.72*scale;lower.castShadow=true;g.add(lower)
      const hood=new THREE.Mesh(new THREE.BoxGeometry(1.45*scale,.38*scale,1.95*scale),paint);hood.position.set(1.55*scale,1.16*scale,0);g.add(hood)
      const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.1*scale,.8*scale,1.72*scale),new THREE.MeshStandardMaterial({color:0x182c3b,metalness:.6,roughness:.08}));cabin.position.set(-.25*scale,1.42*scale,0);g.add(cabin)
      for(const x of [-1.45,1.45])for(const z of [-.98,.98]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.43*scale,.43*scale,.28*scale,16),new THREE.MeshStandardMaterial({color:0x08090a,roughness:1}));wheel.rotation.x=Math.PI/2;wheel.position.set(x*scale,.48*scale,z*scale);g.add(wheel)}
      for(const z of [-.72,.72]){const light=new THREE.Mesh(new THREE.SphereGeometry(.12*scale,8,6),new THREE.MeshBasicMaterial({color:0xfff3c4}));light.position.set(2.43*scale,.93*scale,z*scale);g.add(light)}
      return g
    }
    const cars=[
      {mesh:makeCar(0x2c66ff,1),z:-48,speed:14,start:-90},
      {mesh:makeCar(0xd9dde7,1.08),z:-48,speed:-18,start:55},
      {mesh:makeCar(0xbf1f2b,.92),z:0,speed:22,start:-72},
      {mesh:makeCar(0x101216,.9),z:0,speed:-25,start:70},
      {mesh:makeCar(0x325a3e,1.12),z:48,speed:12,start:-38},
      {mesh:makeCar(0xe0a634,.96),z:48,speed:-17,start:88},
      {mesh:makeCar(0x6b3bbd,.94),z:0,speed:16,start:-15},
      {mesh:makeCar(0xf3f3f3,1.04),z:-48,speed:-13,start:10},
    ]
    cars.forEach((c,i)=>{c.mesh.position.set(c.start,0,c.z+(i%2?2.6:-2.6));city.add(c.mesh)})

    const makeBoat=(color:number,scale=1)=>{
      const g=new THREE.Group();const hull=new THREE.Mesh(new THREE.BoxGeometry(6.2*scale,.75*scale,2.25*scale),new THREE.MeshStandardMaterial({color,metalness:.22,roughness:.28}));hull.position.y=.48*scale;g.add(hull)
      const bow=new THREE.Mesh(new THREE.ConeGeometry(1.13*scale,2.8*scale,4),new THREE.MeshStandardMaterial({color,metalness:.22,roughness:.28}));bow.rotation.z=-Math.PI/2;bow.position.set(4.1*scale,.48*scale,0);g.add(bow)
      const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.35*scale,1.1*scale,1.7*scale),new THREE.MeshStandardMaterial({color:0xdcecf4,metalness:.2,roughness:.16}));cabin.position.set(-.4*scale,1.35*scale,0);g.add(cabin);return g
    }
    const boats=[{mesh:makeBoat(0xff7a2d,.8),speed:9,z:-74,start:-70},{mesh:makeBoat(0xf3f4f7,1.2),speed:-6,z:-84,start:58},{mesh:makeBoat(0x18324d,.72),speed:12,z:-91,start:-5}]
    boats.forEach(b=>{b.mesh.position.set(b.start,.2,b.z);city.add(b.mesh)})

    const animals:{g:THREE.Group;baseX:number;baseZ:number;phase:number;range:number}[]=[]
    const makeAnimal=(color:number,scale:number)=>{const g=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color,roughness:.9});const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48*scale,1.45*scale,4,8),mat);body.rotation.z=Math.PI/2;body.position.y=1.05*scale;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.48*scale,10,8),mat);head.position.set(1.18*scale,1.42*scale,0);g.add(head);for(const x of [-.65,.65])for(const z of [-.28,.28]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.18*scale,.8*scale,.18*scale),mat);leg.position.set(x*scale,.45*scale,z*scale);g.add(leg)}return g}
    ;[[0x9a6840,.65,-73,24,0,5],[0x7e573c,.9,74,28,1,7],[0x3b281c,1.08,70,-28,2,6],[0xc6a26d,.58,-66,35,3,4]].forEach((a:any[])=>{const g=makeAnimal(a[0],a[1]);g.position.set(a[2],0,a[3]);city.add(g);animals.push({g,baseX:a[2],baseZ:a[3],phase:a[4],range:a[5]})})

    const birds:THREE.Mesh[]=[]
    for(let i=0;i<9;i++){const bird=new THREE.Mesh(new THREE.ConeGeometry(.28,.78,5),new THREE.MeshBasicMaterial({color:0xe9f5ff}));bird.rotation.z=Math.PI/2;city.add(bird);birds.push(bird)}

    const clock=new THREE.Clock();let raf=0
    const resize=()=>{const w=mount.clientWidth,h=Math.max(420,mount.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
    const ro=new ResizeObserver(resize);ro.observe(mount);resize()
    camera.position.set(0,34,86);camera.lookAt(0,5,0)

    const animate=()=>{
      const dt=Math.min(.033,clock.getDelta());const t=performance.now()/1000
      cars.forEach((c,i)=>{c.mesh.position.x+=c.speed*dt;if(c.speed>0&&c.mesh.position.x>105)c.mesh.position.x=-105;if(c.speed<0&&c.mesh.position.x<-105)c.mesh.position.x=105;c.mesh.rotation.y=c.speed>0?0:Math.PI;c.mesh.position.y=.04+Math.sin(t*4+i)*.02})
      boats.forEach((b,i)=>{b.mesh.position.x+=b.speed*dt;if(b.speed>0&&b.mesh.position.x>105)b.mesh.position.x=-105;if(b.speed<0&&b.mesh.position.x<-105)b.mesh.position.x=105;b.mesh.rotation.y=b.speed>0?0:Math.PI;b.mesh.position.y=.15+Math.sin(t*1.8+i)*.14})
      npcs.forEach((n,i)=>{n.g.position.x=n.baseX+Math.sin(t*.32+n.phase)*7;n.g.position.z=n.baseZ+Math.cos(t*.24+n.phase)*2.2;n.g.rotation.y=Math.sin(t*.32+n.phase)>0?Math.PI/2:-Math.PI/2})
      animals.forEach((a,i)=>{a.g.position.x=a.baseX+Math.sin(t*.35+a.phase)*a.range;a.g.position.z=a.baseZ+Math.cos(t*.28+a.phase)*a.range*.45;a.g.rotation.y=Math.sin(t*.35+a.phase)>0?0:Math.PI})
      birds.forEach((b,i)=>{const ang=t*.22+i*.7;b.position.set(Math.cos(ang)*(30+i*3),15+(i%4)*2.2,Math.sin(ang)*(28+i*2)-8);b.rotation.y=-ang})
      waterMat.color.setHSL(.55,.78,.25+Math.sin(t*.7)*.015)
      camera.position.x=Math.sin(t*.055)*18;camera.lookAt(0,6,-4)
      renderer.render(scene,camera);raf=requestAnimationFrame(animate)
    }
    animate()
    return()=>{cancelAnimationFrame(raf);ro.disconnect();scene.traverse((obj:any)=>{if(obj.geometry)obj.geometry.dispose?.();if(obj.material){const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach((m:any)=>{m.map?.dispose?.();m.dispose?.()})}});renderer.dispose();renderer.domElement.remove()}
  },[])

  return <div ref={mountRef} aria-label="StreetVerse enhanced living city preview" style={{position:'absolute',inset:0,minHeight:420,pointerEvents:'none'}}/>
}
