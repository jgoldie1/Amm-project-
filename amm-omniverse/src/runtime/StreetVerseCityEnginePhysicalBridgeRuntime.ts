import { AMMCityEngine } from '../game/engine/CityEngine'
import { addStreetVerseChicagoPhysicalWorld3D, type ChicagoPhysicalWorld3D } from '../game/engine/StreetVerseChicagoPhysicalWorld3D'

let installed=false
const BRIDGE_FLAG=Symbol.for('tryamm.streetverse.city-engine-physical-bridge')

type EngineWithInternals=AMMCityEngine & {
  scene?: import('three').Scene
  playerPos?: import('three').Vector3
  __tryammPhysicalWorld?:ChicagoPhysicalWorld3D
  __tryammPhysicalFrame?:number
}

export function installStreetVerseCityEnginePhysicalBridgeRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  const proto=AMMCityEngine.prototype as any
  if(proto[BRIDGE_FLAG])return
  proto[BRIDGE_FLAG]=true
  const originalInit=proto.init
  proto.init=async function(this:EngineWithInternals,...args:any[]){
    const result=await originalInit.apply(this,args)
    if(this.scene&&!this.__tryammPhysicalWorld){
      const physical=addStreetVerseChicagoPhysicalWorld3D(this.scene)
      this.__tryammPhysicalWorld=physical
      const tick=()=>{
        if(this.__tryammPhysicalWorld&&this.playerPos)this.__tryammPhysicalWorld.update(this.playerPos)
        this.__tryammPhysicalFrame=requestAnimationFrame(tick)
      }
      this.__tryammPhysicalFrame=requestAnimationFrame(tick)
      window.dispatchEvent(new CustomEvent('tryamm:city-engine-physical-world-ready',{detail:{renderer:'AMMCityEngine',zones:physical.triggers.map(t=>t.id),physical:true}}))
    }
    return result
  }
  const originalDispose=proto.dispose
  if(typeof originalDispose==='function'){
    proto.dispose=function(this:EngineWithInternals,...args:any[]){
      if(this.__tryammPhysicalFrame)cancelAnimationFrame(this.__tryammPhysicalFrame)
      this.__tryammPhysicalWorld?.dispose()
      this.__tryammPhysicalWorld=undefined
      return originalDispose.apply(this,args)
    }
  }
}
