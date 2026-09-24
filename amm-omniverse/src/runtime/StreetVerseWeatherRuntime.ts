import * as THREE from 'three'

export type StreetVerseWeatherKind='clear'|'clouds'|'fog'|'rain'|'snow'|'storm'|'mixed'|'unavailable'

export type StreetVerseWeatherState={
  scope:'local'|'global'
  regionId:string
  regionLabel:string
  provider:string
  sourceTimestamp:string|null
  retrievedAt:string
  temperature:number|null
  apparentTemperature:number|null
  precipitation:number|null
  rain:number|null
  snowfall:number|null
  weatherCode:number|null
  cloudCover:number|null
  windSpeed:number|null
  windDirection:number|null
  windGusts:number|null
  current:boolean
  simulated:boolean
  unavailable?:boolean
  message?:string
}

export type StreetVerseWeatherVisual={
  kind:StreetVerseWeatherKind
  label:string
  sky:number
  fog:number
  fogDensity:number
  lightMultiplier:number
  precipitationIntensity:number
  roadGripMultiplier:number
  accelerationMultiplier:number
  trafficSpeedMultiplier:number
}

export function weatherKindFromCode(code:number|null|undefined):StreetVerseWeatherKind{
  const value=Number(code)
  if(!Number.isFinite(value))return 'unavailable'
  if(value===0)return 'clear'
  if([1,2,3].includes(value))return 'clouds'
  if([45,48].includes(value))return 'fog'
  if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(value))return 'rain'
  if([71,73,75,77,85,86].includes(value))return 'snow'
  if([95,96,99].includes(value))return 'storm'
  return 'mixed'
}

export function weatherVisualFromState(state:StreetVerseWeatherState):StreetVerseWeatherVisual{
  const kind=state.unavailable?'unavailable':weatherKindFromCode(state.weatherCode)
  const precip=Math.max(0,Number(state.precipitation||0)+Number(state.rain||0)+Number(state.snowfall||0))
  const cloud=Math.max(0,Math.min(100,Number(state.cloudCover||0)))
  const base:{[K in StreetVerseWeatherKind]:StreetVerseWeatherVisual}={
    clear:{kind:'clear',label:'CLEAR',sky:0x78b9e8,fog:0x91c8e8,fogDensity:.0028,lightMultiplier:1.08,precipitationIntensity:0,roadGripMultiplier:1,accelerationMultiplier:1,trafficSpeedMultiplier:1},
    clouds:{kind:'clouds',label:'CLOUDY',sky:0x718799,fog:0x7d8f9d,fogDensity:.0046,lightMultiplier:.78,precipitationIntensity:0,roadGripMultiplier:.98,accelerationMultiplier:.99,trafficSpeedMultiplier:.96},
    fog:{kind:'fog',label:'FOG',sky:0x89939a,fog:0x9aa1a5,fogDensity:.018,lightMultiplier:.62,precipitationIntensity:0,roadGripMultiplier:.9,accelerationMultiplier:.94,trafficSpeedMultiplier:.78},
    rain:{kind:'rain',label:'RAIN',sky:0x445b6b,fog:0x536978,fogDensity:.008,lightMultiplier:.58,precipitationIntensity:Math.min(1,.35+precip*.16),roadGripMultiplier:.76,accelerationMultiplier:.9,trafficSpeedMultiplier:.82},
    snow:{kind:'snow',label:'SNOW',sky:0x9aa8b2,fog:0xb7c1c8,fogDensity:.012,lightMultiplier:.72,precipitationIntensity:Math.min(1,.45+Math.max(precip,Number(state.snowfall||0))*.18),roadGripMultiplier:.55,accelerationMultiplier:.78,trafficSpeedMultiplier:.68},
    storm:{kind:'storm',label:'STORM',sky:0x253744,fog:0x344957,fogDensity:.013,lightMultiplier:.42,precipitationIntensity:1,roadGripMultiplier:.62,accelerationMultiplier:.82,trafficSpeedMultiplier:.65},
    mixed:{kind:'mixed',label:'MIXED',sky:0x657984,fog:0x778891,fogDensity:.007,lightMultiplier:.7,precipitationIntensity:Math.min(.6,precip*.14),roadGripMultiplier:.82,accelerationMultiplier:.9,trafficSpeedMultiplier:.84},
    unavailable:{kind:'unavailable',label:'WEATHER UNAVAILABLE',sky:0x07101d,fog:0x07101d,fogDensity:.007,lightMultiplier:1,precipitationIntensity:0,roadGripMultiplier:1,accelerationMultiplier:1,trafficSpeedMultiplier:1},
  }
  const visual={...base[kind]}
  if(kind==='clouds')visual.lightMultiplier=Math.max(.55,.92-cloud/220)
  return visual
}

export function weatherBadge(state:StreetVerseWeatherState){
  const visual=weatherVisualFromState(state)
  const temp=Number.isFinite(Number(state.temperature))?String(Math.round(Number(state.temperature)))+'°':'--'
  const live=state.current&&!state.simulated&&!state.unavailable?'LIVE':'GATED'
  return state.regionLabel+' • '+visual.label+' • '+temp+' • '+live
}

export function createStreetVerseWeatherRenderer(
  scene:THREE.Scene,
  hemi:THREE.HemisphereLight,
  sun:THREE.DirectionalLight,
  options:{mobile?:boolean;radius?:number}={}
){
  const count=options.mobile?420:1100
  const radius=options.radius||95
  const positions=new Float32Array(count*3)
  for(let i=0;i<count;i++){
    positions[i*3]=(Math.random()-.5)*radius*2
    positions[i*3+1]=Math.random()*45+3
    positions[i*3+2]=(Math.random()-.5)*radius*2
  }
  const geometry=new THREE.BufferGeometry()
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3))
  const material=new THREE.PointsMaterial({color:0xaee5ff,size:options.mobile?.11:.15,transparent:true,opacity:.78,depthWrite:false})
  const precipitation=new THREE.Points(geometry,material)
  precipitation.name='streetverse-live-weather-precipitation'
  precipitation.visible=false
  scene.add(precipitation)

  let state:StreetVerseWeatherState|null=null
  let visual:StreetVerseWeatherVisual={
    kind:'unavailable',label:'WEATHER UNAVAILABLE',sky:0x07101d,fog:0x07101d,fogDensity:.007,
    lightMultiplier:1,precipitationIntensity:0,roadGripMultiplier:1,accelerationMultiplier:1,trafficSpeedMultiplier:1
  }

  const apply=(next:StreetVerseWeatherState)=>{
    state=next
    visual=weatherVisualFromState(next)
    scene.background=new THREE.Color(visual.sky)
    scene.fog=new THREE.FogExp2(visual.fog,visual.fogDensity)
    hemi.color.setHex(visual.kind==='clear'?0xc7ecff:visual.kind==='storm'?0x738b99:0xa8c5d6)
    hemi.groundColor.setHex(visual.kind==='snow'?0x62707a:0x17111b)
    sun.color.setHex(visual.kind==='storm'?0xbac9d3:visual.kind==='snow'?0xe9f2f7:0xffe0bd)
    precipitation.visible=visual.precipitationIntensity>0
    material.opacity=.25+visual.precipitationIntensity*.65
    material.color.setHex(visual.kind==='snow'?0xf2fbff:0x9ed8ff)
    material.size=visual.kind==='snow'?(options.mobile?.18:.26):(options.mobile?.08:.11)
    document.body.dataset.svWeather=visual.kind
    document.body.dataset.svWeatherLive=String(next.current&&!next.simulated&&!next.unavailable)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-weather-visual',{detail:{...visual,state:next}}))
  }

  const tick=(dt:number,anchor?:THREE.Vector3)=>{
    if(anchor){
      precipitation.position.x=anchor.x
      precipitation.position.z=anchor.z
    }
    if(!precipitation.visible)return
    const attr=geometry.getAttribute('position') as THREE.BufferAttribute
    const array=attr.array as Float32Array
    const fall=visual.kind==='snow'?5:34
    const drift=(Number(state?.windSpeed||0)/80)*(visual.kind==='snow'?2.8:1.2)
    for(let i=0;i<count;i++){
      const yIndex=i*3+1
      array[yIndex]-=fall*dt
      array[i*3]+=drift*dt
      if(array[yIndex]<0){
        array[yIndex]=45+Math.random()*10
        array[i*3]=(Math.random()-.5)*radius*2
        array[i*3+2]=(Math.random()-.5)*radius*2
      }
    }
    attr.needsUpdate=true
  }

  return {
    apply,
    tick,
    getState:()=>state,
    getVisual:()=>visual,
    dispose(){
      scene.remove(precipitation)
      geometry.dispose()
      material.dispose()
    }
  }
}
