import * as THREE from 'three'

export type StreetVerseNeonFutureLayer={
  group:THREE.Group
  setEnabled:(enabled:boolean)=>void
  dispose:()=>void
}

function makeSign(text:string,color:string){
  const canvas=document.createElement('canvas')
  canvas.width=512;canvas.height=160
  const ctx=canvas.getContext('2d')!
  ctx.clearRect(0,0,512,160)
  ctx.fillStyle='rgba(2,7,16,.82)';ctx.fillRect(0,0,512,160)
  ctx.strokeStyle=color;ctx.lineWidth=7;ctx.strokeRect(8,8,496,144)
  ctx.fillStyle=color;ctx.font='900 44px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,80)
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace
  const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide})
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(6.4,2),material)
  mesh.userData={futureSign:true,texture}
  return mesh
}

export function createStreetVerseNeonFutureLayer(scene:THREE.Scene):StreetVerseNeonFutureLayer{
  const group=new THREE.Group()
  group.name='streetverse-neon-future-layer'
  group.visible=false
  group.userData={timeline:'future',fictional:true,visualOverlay:true,collisionAuthority:false}
  scene.add(group)

  const colors=[0x47f6ff,0xff4bd8,0x8d7bff,0xffc447]
  const strips:THREE.Mesh[]=[]
  for(let i=0;i<18;i++){
    const material=new THREE.MeshBasicMaterial({color:colors[i%colors.length],transparent:true,opacity:.72})
    const strip=new THREE.Mesh(new THREE.BoxGeometry(.08,3+(i%4)*.65,.08),material)
    const side=i%2===0?-1:1
    strip.position.set(side*(18+(i%5)*11),2.2+(i%3),-62+(i%9)*15)
    strip.userData={neonAccent:true}
    group.add(strip);strips.push(strip)
  }

  const signData=[
    ['CROSSVERSE',-48,8,34,'#47f6ff'],
    ['HOLO LIVE',36,7,20,'#ff4bd8'],
    ['TIME GATE',-30,9,-38,'#8d7bff'],
    ['OMNI MARKET',52,6,-10,'#ffc447'],
    ['MIDDLEVERSE JOBS',8,8,58,'#47f6ff'],
    ['HOLO LAB',-58,7,-48,'#ff4bd8'],
  ] as const
  const signs=signData.map(([label,x,y,z,color],index)=>{
    const sign=makeSign(label,color)
    sign.position.set(x,y,z)
    sign.rotation.y=index%2?Math.PI/2:0
    group.add(sign)
    return sign
  })

  const towers:THREE.Mesh[]=[]
  for(let i=0;i<10;i++){
    const h=10+(i%4)*4
    const material=new THREE.MeshStandardMaterial({
      color:0x0c1522,
      emissive:colors[i%colors.length],
      emissiveIntensity:.18,
      roughness:.42,
      metalness:.45,
    })
    const tower=new THREE.Mesh(new THREE.BoxGeometry(4+(i%3),h,4+(i%2)),material)
    tower.position.set(-68+(i%5)*34,h/2,-70+Math.floor(i/5)*138)
    tower.userData={futureStructure:true,visualOnly:true}
    group.add(tower);towers.push(tower)
  }

  const drones:THREE.Group[]=[]
  for(let i=0;i<6;i++){
    const d=new THREE.Group()
    const core=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),new THREE.MeshBasicMaterial({color:colors[i%colors.length]}))
    const bar=new THREE.Mesh(new THREE.BoxGeometry(1.3,.08,.08),new THREE.MeshBasicMaterial({color:0xaeefff}))
    d.add(core,bar)
    d.position.set(-24+i*10,9+(i%3)*2,-20+(i%2)*42)
    d.userData={phase:i*.9,drone:true,visualOnly:true}
    group.add(d);drones.push(d)
  }

  let enabled=false
  let raf=0
  const animate=()=>{
    if(!enabled)return
    const t=performance.now()*.001
    signs.forEach((sign,i)=>{sign.material instanceof THREE.MeshBasicMaterial&&(sign.material.opacity=.72+Math.sin(t*2+i)*.2)})
    strips.forEach((strip,i)=>{strip.material instanceof THREE.MeshBasicMaterial&&(strip.material.opacity=.45+Math.sin(t*2.4+i*.7)*.25)})
    drones.forEach((d,i)=>{
      const phase=Number(d.userData.phase||0)
      d.position.x+=Math.sin(t*.8+phase)*.003
      d.position.y=10+(i%3)*2+Math.sin(t*1.3+phase)*.5
      d.rotation.y=t*.4+phase
    })
    raf=requestAnimationFrame(animate)
  }
  const setEnabled=(next:boolean)=>{
    enabled=Boolean(next)
    group.visible=enabled
    if(raf)cancelAnimationFrame(raf)
    raf=0
    if(enabled)raf=requestAnimationFrame(animate)
    window.dispatchEvent(new CustomEvent('tryamm:neon-future-state',{detail:{enabled,timeline:'future',fictional:true,source:'streetverse-neon-future-layer'}}))
  }
  const onSet=(event:Event)=>setEnabled(Boolean((event as CustomEvent<{enabled?:boolean}>).detail?.enabled))
  const onChrono=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const era=String(d.era||d.title||d.name||'').toLowerCase()
    if(/future|20[5-9]\d|21\d\d|cyber|neon/.test(era))setEnabled(true)
  }
  const onFoundry=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const era=String(d.era||d.title||'').toLowerCase()
    const mode=String(d.mode||'').toUpperCase()
    if(/future|cyber|neon/.test(era)&&['SIMULATION','ADVENTURE','ENGINEERING','SPACE'].includes(mode))setEnabled(true)
  }
  const onReturn=()=>setEnabled(false)

  addEventListener('tryamm:neon-future-set',onSet)
  addEventListener('tryamm:chrono-run-started',onChrono)
  addEventListener('tryamm:time-machine-world-foundry-plan',onFoundry)
  addEventListener('tryamm:time-machine-return-present',onReturn)

  const dispose=()=>{
    if(raf)cancelAnimationFrame(raf)
    removeEventListener('tryamm:neon-future-set',onSet)
    removeEventListener('tryamm:chrono-run-started',onChrono)
    removeEventListener('tryamm:time-machine-world-foundry-plan',onFoundry)
    removeEventListener('tryamm:time-machine-return-present',onReturn)
    group.traverse(node=>{
      if(node instanceof THREE.Mesh){
        node.geometry.dispose()
        const materials=Array.isArray(node.material)?node.material:[node.material]
        materials.forEach(material=>{
          for(const value of Object.values(material as unknown as Record<string,unknown>))if(value instanceof THREE.Texture)value.dispose()
          material.dispose()
        })
      }
    })
    group.removeFromParent()
  }
  return {group,setEnabled,dispose}
}
