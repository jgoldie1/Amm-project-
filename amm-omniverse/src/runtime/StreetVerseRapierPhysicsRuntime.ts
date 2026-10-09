import RAPIER from '@dimforge/rapier3d'

export type PhysicsBodyKind='dynamic'|'fixed'|'kinematic'

export type PhysicsBodySpec={
  id:string
  kind?:PhysicsBodyKind
  position:{x:number;y:number;z:number}
  halfExtents:{x:number;y:number;z:number}
  mass?:number
  restitution?:number
  friction?:number
}

type PhysicsApi={
  ready:boolean
  addBox:(spec:PhysicsBodySpec)=>string
  addGround:(id?:string)=>string
  remove:(id:string)=>void
  applyImpulse:(id:string,impulse:{x:number;y:number;z:number})=>void
  setLinearVelocity:(id:string,velocity:{x:number;y:number;z:number})=>void
  getTransform:(id:string)=>{position:{x:number;y:number;z:number};rotation:{x:number;y:number;z:number;w:number}}|null
  step:(dt?:number)=>void
}

declare global{
  interface Window{
    __TRYAMM_RAPIER_PHYSICS__?:PhysicsApi
  }
}

const bodies=new Map<string,RAPIER.RigidBody>()

function bodyDesc(kind:PhysicsBodyKind){
  if(kind==='fixed')return RAPIER.RigidBodyDesc.fixed()
  if(kind==='kinematic')return RAPIER.RigidBodyDesc.kinematicPositionBased()
  return RAPIER.RigidBodyDesc.dynamic()
}

export async function installStreetVerseRapierPhysics(){
  if(typeof window==='undefined')return()=>{}
  if(window.__TRYAMM_RAPIER_PHYSICS__)return()=>{}

  await RAPIER.init()

  const world=new RAPIER.World({x:0,y:-9.81,z:0})
  world.timestep=1/60

  const api:PhysicsApi={
    ready:true,

    addBox:(spec)=>{
      if(bodies.has(spec.id))return spec.id
      const desc=bodyDesc(spec.kind||'dynamic')
        .setTranslation(spec.position.x,spec.position.y,spec.position.z)

      const body=world.createRigidBody(desc)
      if((spec.kind||'dynamic')==='dynamic'&&Number.isFinite(spec.mass)&&Number(spec.mass)>0){
        body.setAdditionalMass(Number(spec.mass),true)
      }

      const collider=RAPIER.ColliderDesc
        .cuboid(spec.halfExtents.x,spec.halfExtents.y,spec.halfExtents.z)
        .setRestitution(spec.restitution??0.05)
        .setFriction(spec.friction??0.85)

      world.createCollider(collider,body)
      bodies.set(spec.id,body)
      return spec.id
    },

    addGround:(id='streetverse-ground')=>{
      if(bodies.has(id))return id
      const body=world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(0,-0.25,0)
      )
      world.createCollider(
        RAPIER.ColliderDesc.cuboid(2500,0.25,2500).setFriction(1),
        body
      )
      bodies.set(id,body)
      return id
    },

    remove:(id)=>{
      const body=bodies.get(id)
      if(!body)return
      world.removeRigidBody(body)
      bodies.delete(id)
    },

    applyImpulse:(id,impulse)=>{
      const body=bodies.get(id)
      if(!body||!body.isDynamic())return
      body.applyImpulse(impulse,true)
    },

    setLinearVelocity:(id,velocity)=>{
      const body=bodies.get(id)
      if(!body)return
      body.setLinvel(velocity,true)
    },

    getTransform:(id)=>{
      const body=bodies.get(id)
      if(!body)return null
      const p=body.translation()
      const r=body.rotation()
      return{
        position:{x:p.x,y:p.y,z:p.z},
        rotation:{x:r.x,y:r.y,z:r.z,w:r.w},
      }
    },

    step:(dt)=>{
      if(Number.isFinite(dt)&&Number(dt)>0){
        world.timestep=Math.min(1/20,Math.max(1/240,Number(dt)))
      }
      world.step()
    },
  }

  api.addGround()
  window.__TRYAMM_RAPIER_PHYSICS__=api
  window.dispatchEvent(new CustomEvent('tryamm:rapier-physics-ready',{detail:{
    engine:'rapier3d',
    gravity:true,
    collisions:true,
    impulses:true,
    rigidBodies:true,
    vehicleFoundation:true,
    version:'1.0.0',
  }}))

  return()=>{
    bodies.clear()
    delete window.__TRYAMM_RAPIER_PHYSICS__
  }
}
