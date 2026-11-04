import {useEffect,useMemo,useState,type CSSProperties} from 'react'
import type {HoloCADSubject} from '../game/holocad/livingSystemsPresets'
import {createHoloCADResearchResult,publishHoloCADResearchResult} from '../game/holocad/holocadResearchBridge'
import {
 HOLOCAD_PHYSICS_LESSONS,suggestedHoloCADPhysicsExperiment,
 simulateHoloCADJointTorque,simulateHoloCADStaticBalance,
 simulateHoloCADCircularOrbit,simulateHoloCADEnergyBudget,
 type HoloCADPhysicsExperiment
} from '../game/holocad/holocadPhysicsSandbox'

type Parameter={key:string;label:string;unit:string;min:number;max:number;step:number}
type Report={title:string;rows:Array<{label:string;value:string}>;note:string}
const params:Record<HoloCADPhysicsExperiment,readonly Parameter[]>={
 'joint-torque':[
  {key:'mass',label:'Object mass',unit:'kg',min:0,max:40,step:.5},
  {key:'arm',label:'Lever arm length',unit:'m',min:0,max:2,step:.05},
  {key:'angle',label:'Joint angle from vertical',unit:'degrees',min:0,max:180,step:5},
  {key:'speed',label:'Angular speed magnitude',unit:'degrees/s',min:0,max:180,step:5}
 ],
 'static-balance':[
  {key:'body',label:'Main body mass',unit:'kg',min:1,max:250,step:1},
  {key:'payload',label:'Additional load',unit:'kg',min:0,max:80,step:1},
  {key:'offset',label:'Load horizontal offset',unit:'m',min:-1,max:1,step:.05},
  {key:'height',label:'Center-of-mass height',unit:'m',min:.1,max:2,step:.05},
  {key:'base',label:'Half-width of support',unit:'m',min:.05,max:1.5,step:.05},
  {key:'lean',label:'Lean angle',unit:'degrees',min:-35,max:35,step:1}
 ],
 'circular-orbit':[
  {key:'altitude',label:'Circular-orbit altitude',unit:'km',min:100,max:3000,step:50}
 ],
 'energy-budget':[
  {key:'battery',label:'Battery capacity',unit:'Wh',min:10,max:2000,step:10},
  {key:'load',label:'Constant device load',unit:'W',min:1,max:400,step:1},
  {key:'solar',label:'Assumed steady solar input',unit:'W',min:0,max:400,step:5},
  {key:'efficiency',label:'Conversion efficiency',unit:'fraction',min:0,max:1,step:.05}
 ]
}
const defaults:Record<string,number>={
 mass:5,arm:.5,angle:90,speed:30,
 body:50,payload:10,offset:.3,height:.8,base:.45,lean:0,
 altitude:400,
 battery:500,load:90,solar:30,efficiency:.8
}
const baseButton:CSSProperties={
 minHeight:44,border:'1px solid #6cc6de77',borderRadius:11,
 background:'#1c3850',color:'#f0fcff',padding:'8px 11px',
 fontSize:11,fontWeight:900,touchAction:'manipulation'
}
const num=(n:number,digits=3)=>n.toLocaleString(undefined,{maximumFractionDigits:digits})
const detailRow=(label:string,value:string)=>({label,value})

export default function HoloCADPhysicsSandboxPanel({
 subject,selectedPart,onClose
}:{subject:HoloCADSubject;selectedPart:string;onClose:()=>void}){
 const [lesson,setLesson]=useState<HoloCADPhysicsExperiment>(()=>suggestedHoloCADPhysicsExperiment(subject))
 const [values,setValues]=useState<Record<string,number>>(defaults)
 const [report,setReport]=useState<Report|null>(null)
 const [status,setStatus]=useState('Choose parameters and RUN SIMULATION. This lab never controls physical equipment.')
 const selectedLesson=useMemo(()=>HOLOCAD_PHYSICS_LESSONS.find(l=>l.id===lesson)??HOLOCAD_PHYSICS_LESSONS[0],[lesson])

 useEffect(()=>{
  setLesson(suggestedHoloCADPhysicsExperiment(subject))
  setReport(null)
  setStatus('Selected a classroom exercise related to '+subject.replaceAll('-',' ')+'.')
 },[subject])
 const run=()=>{
  try{
   let next:Report
   switch(lesson){
    case 'joint-torque':{
     const r=simulateHoloCADJointTorque({
      loadMassKg:values.mass,leverArmMeters:values.arm,
      jointAngleDegrees:values.angle,angularSpeedDegreesPerSecond:values.speed
     })
     next={title:'Ideal gravitational joint load',rows:[
      detailRow('Static torque magnitude',num(r.torqueNm)+' N·m'),
      detailRow('Angular speed',num(r.angularSpeedRadPerSecond)+' rad/s'),
      detailRow('Illustrative load × speed',num(r.idealMechanicalPowerWatts)+' W')
     ],note:r.note}
     break
    }
    case 'static-balance':{
     const r=simulateHoloCADStaticBalance({
      chassisMassKg:values.body,payloadMassKg:values.payload,
      payloadOffsetMeters:values.offset,centerOfMassHeightMeters:values.height,
      supportHalfWidthMeters:values.base,leanDegrees:values.lean
     })
     next={title:'One-dimensional static footprint check',rows:[
      detailRow('Center-of-mass offset',num(r.centerOfMassOffsetMeters)+' m'),
      detailRow('Ground-projected position',num(r.projectedCenterMeters)+' m'),
      detailRow('Signed footprint margin',num(r.signedMarginMeters)+' m'),
      detailRow('Static projection inside footprint',r.projectionWithinSupport?'YES (idealized)':'NO (idealized)')
     ],note:r.note}
     break
    }
    case 'circular-orbit':{
     const r=simulateHoloCADCircularOrbit({altitudeKm:values.altitude})
     next={title:'Ideal Earth circular orbit',rows:[
      detailRow('Distance from Earth center',num(r.radiusKm)+' km'),
      detailRow('Circular orbital speed',num(r.circularSpeedKmPerSecond)+' km/s'),
      detailRow('Orbital period',num(r.orbitalPeriodMinutes)+' minutes')
     ],note:r.note}
     break
    }
    case 'energy-budget':{
     const r=simulateHoloCADEnergyBudget({
      batteryWattHours:values.battery,steadyLoadWatts:values.load,
      solarInputWatts:values.solar,conversionEfficiency:values.efficiency
     })
     next={title:'Steady electrical energy model',rows:[
      detailRow('Effective steady solar power',num(r.usableSolarWatts)+' W'),
      detailRow('Net positive battery draw',num(r.netBatteryDrawWatts)+' W'),
      detailRow('Ideal battery duration',r.idealRuntimeHours===null?'NOT ESTIMABLE (input ≥ load)':num(r.idealRuntimeHours)+' hours')
     ],note:r.note}
     break
    }
   }
   setReport(next)
   publishHoloCADResearchResult(createHoloCADResearchResult({kind:'classical-physics',subject,experiment:lesson,summary:'Calculated '+next.title+' (illustrative, no hardware).'}))
   setStatus('Completed local textbook calculation; see assumptions and omissions below.')
  }catch(e){
   setReport(null)
   setStatus('Simulation rejected: '+(e instanceof Error?e.message:'invalid parameters'))
  }
 }
 return <section aria-label="HoloCAD Physics and Engineering Sandbox" style={{
  marginTop:12,padding:12,border:'1px solid #4599b5',borderRadius:14,
  background:'linear-gradient(150deg,#102635,#111c35)',color:'#e5f8ff'
 }}>
  <header style={{display:'flex',justifyContent:'space-between',alignItems:'start',gap:9}}>
   <div>
    <div style={{fontSize:10,letterSpacing:1.4,fontWeight:900,color:'#8ae7ec'}}>HOLOCAD • EDUCATIONAL PHYSICS</div>
    <div style={{fontSize:16,fontWeight:900,marginTop:4}}>⚙️ PHYSICS & ENGINEERING SANDBOX</div>
   </div>
   <button type="button" style={baseButton} onClick={onClose} aria-label="Close HoloCAD Physics Sandbox">CLOSE ×</button>
  </header>
  <p style={{fontSize:11,lineHeight:1.55,color:'#cbdfeb'}}>
   Inspecting {subject.replaceAll('-',' ')} / {selectedPart}. All results are idealized numerical demonstrations,
   independent of the model's mesh and any real telemetry. No physical device is controlled.
  </p>
  <label htmlFor="holocad-physics-lesson" style={{fontSize:11,fontWeight:900,display:'block',marginBottom:6}}>EXPERIMENT</label>
  <select id="holocad-physics-lesson" value={lesson} onChange={e=>{
   setLesson(e.target.value as HoloCADPhysicsExperiment);setReport(null)
  }} style={{...baseButton,width:'100%',fontSize:13}}>
   {HOLOCAD_PHYSICS_LESSONS.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}
  </select>
  <p style={{fontSize:11,color:'#cce3eb'}}>{selectedLesson.description}</p>
  {params[lesson].map(p=><label htmlFor={'physics-'+p.key} key={p.key}
   style={{display:'block',fontSize:11,fontWeight:850,marginTop:10}}>
   {p.label}: <strong>{num(values[p.key])} {p.unit}</strong>
   <input type="range" id={'physics-'+p.key} min={p.min} max={p.max} step={p.step}
    value={values[p.key]} onChange={e=>{setValues(v=>({...v,[p.key]:Number(e.target.value)}));setReport(null)}}
    style={{display:'block',width:'100%',height:40,touchAction:'pan-x'}}/>
  </label>)}
  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
   <button type="button" style={{...baseButton,flex:'1 1 160px',background:'#13657a'}}
    onClick={run}>▶ RUN PHYSICS SIMULATION</button>
   <button type="button" style={baseButton} onClick={()=>{setValues({...defaults});setReport(null);setStatus('Returned to safe textbook example parameters.')}}>RESET PARAMETERS</button>
  </div>
  <div role="status" aria-label="HoloCAD physics simulation status"
   style={{fontSize:11,padding:9,marginTop:10,borderRadius:9,background:'#173342'}}>{status}</div>
  {report&&<div aria-label="HoloCAD physics calculated results" style={{
   marginTop:10,padding:10,background:'#101e2a',borderRadius:12
  }}>
   <strong style={{fontSize:13}}>{report.title}</strong>
   {report.rows.map(row=><div key={row.label} style={{
    display:'flex',justifyContent:'space-between',gap:10,padding:'8px 0',
    borderBottom:'1px solid #375265',fontSize:11
   }}><span>{row.label}</span><strong style={{textAlign:'right'}}>{row.value}</strong></div>)}
   <p style={{fontSize:11,color:'#b9d5dd',lineHeight:1.55,marginBottom:0}}>{report.note}</p>
  </div>}
  <p style={{fontSize:10,color:'#aacdd5',lineHeight:1.55}}>
   Educational only. No FAA/NASA certification, medical-device evaluation, live ROS/Jetson motion commands,
   orbital flight planning, structural calculations, verified battery safety, propulsion validation, or game rewards.
   Physical quantum computing is not involved.
  </p>
 </section>
}
