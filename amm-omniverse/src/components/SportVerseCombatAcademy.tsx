import {useEffect,useState} from 'react'
import {SPORTVERSE_COMBAT_DISCIPLINES,COMBAT_PASSPORT_RULES,type CombatDisciplineId} from '../config/combatSportPassport'
import {readCombatPassport,writeCombatPassport} from '../runtime/CombatSportPassportRuntime'
import {STREETVERSE_CHICAGO_MARTIAL_STYLES,type StreetVerseMartialStyleId} from '../config/streetverseChicagoMartialArtsStyles'

type Hand='left'|'right'

export default function SportVerseCombatAcademy({onLaunchMma,onLaunchBoxing,onExit}:{onLaunchMma:()=>void;onLaunchBoxing:()=>void;onExit:()=>void}){
  const [passport,setPassport]=useState(()=>readCombatPassport())
  const [hand,setHand]=useState<Hand>(()=>localStorage.getItem('tryamm.sportverse.combat.hand')==='left'?'left':'right')
  const [message,setMessage]=useState('Choose a discipline. Your StreetVerse style mastery carries into eligible sport modes.')

  useEffect(()=>{
    const refresh=(event:Event)=>setPassport((event as CustomEvent<any>).detail||readCombatPassport())
    window.addEventListener('tryamm:combat-passport-state',refresh)
    return()=>window.removeEventListener('tryamm:combat-passport-state',refresh)
  },[])

  const chooseDiscipline=(id:CombatDisciplineId)=>{
    const next={...passport,selectedDiscipline:id};writeCombatPassport(next);setPassport(next)
    window.dispatchEvent(new CustomEvent('tryamm:combat-discipline-select',{detail:{id,source:'sportverse'}}))
    setMessage(`${SPORTVERSE_COMBAT_DISCIPLINES.find(d=>d.id===id)?.label} selected.`)
  }
  const chooseStyle=(id:StreetVerseMartialStyleId)=>{
    const next={...passport,selectedAnimalStyle:id};writeCombatPassport(next);setPassport(next)
    localStorage.setItem('tryamm.streetverse.martial-style.v1',id)
    window.dispatchEvent(new CustomEvent('tryamm:martial-style-selected',{detail:{styleId:id,label:STREETVERSE_CHICAGO_MARTIAL_STYLES[id].label,source:'sportverse'}}))
  }
  const launch=()=>{
    if(passport.selectedDiscipline==='mma')return onLaunchMma()
    if(passport.selectedDiscipline==='boxing')return onLaunchBoxing()
    setMessage(`${SPORTVERSE_COMBAT_DISCIPLINES.find(d=>d.id===passport.selectedDiscipline)?.label} career shell is registered; full match runtime is still BUILDING.`)
  }

  const side=hand==='right'?{right:14}:{left:14}

  return <div style={{minHeight:'100%',background:'#070510',color:'#fff',padding:16,fontFamily:'system-ui'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{fontSize:10,color:'#c790ff',letterSpacing:2,fontWeight:950}}>SPORTVERSE • COMBAT PASSPORT</div><h2 style={{margin:'5px 0'}}>MMA + Martial Arts Academy</h2><div style={{fontSize:11,opacity:.7}}>Shared progression with StreetVerse and GameVerse • one-hand ready</div></div><button onClick={onExit} style={{width:44,height:44,borderRadius:12}}>×</button></div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8,marginTop:14}}>
      {SPORTVERSE_COMBAT_DISCIPLINES.map(d=><button key={d.id} onClick={()=>chooseDiscipline(d.id)} style={{minHeight:78,padding:10,borderRadius:14,border:`1px solid ${passport.selectedDiscipline===d.id?'#c790ff':'#352844'}`,background:passport.selectedDiscipline===d.id?'#241338':'#100b17',color:'#fff',textAlign:'left'}}><b>{d.label}</b><div style={{fontSize:9,opacity:.7,marginTop:4}}>{d.sportFocus.join(' • ')}</div><div style={{fontSize:9,color:'#e8b944',marginTop:5}}>XP {passport.disciplineXp[d.id]||0}</div></button>)}
    </div>

    <section style={{marginTop:16,padding:12,border:'1px solid #355844',borderRadius:16,background:'#07110b'}}>
      <div style={{fontSize:10,color:'#8df2a6',fontWeight:950}}>ANIMAL STYLE CARRYOVER</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:7,marginTop:8}}>
        {(Object.keys(STREETVERSE_CHICAGO_MARTIAL_STYLES) as StreetVerseMartialStyleId[]).filter(id=>id.startsWith('green-')||id==='black-dragon-reconstruction').map(id=>{
          const s=STREETVERSE_CHICAGO_MARTIAL_STYLES[id]
          return <button key={id} onClick={()=>chooseStyle(id)} style={{minHeight:64,borderRadius:11,border:`1px solid ${passport.selectedAnimalStyle===id?'#8df2a6':'#284331'}`,background:'#0a160e',color:'#fff',fontSize:9,textAlign:'left',padding:8}}><b>{s.label}</b><div style={{opacity:.65,marginTop:3}}>{s.fantasy}</div></button>
        })}
      </div>
    </section>

    <div style={{marginTop:14,padding:12,borderRadius:14,background:'#0b0b15',fontSize:11,lineHeight:1.5}}>{message}<br/><span style={{opacity:.6}}>Record: {passport.wins}-{passport.losses} • selected style: {STREETVERSE_CHICAGO_MARTIAL_STYLES[passport.selectedAnimalStyle as StreetVerseMartialStyleId]?.label||passport.selectedAnimalStyle}</span></div>

    <button onClick={launch} style={{width:'100%',minHeight:56,marginTop:12,borderRadius:14,border:'1px solid #c790ff',background:'#2b1642',color:'#fff',fontWeight:950}}>ENTER {SPORTVERSE_COMBAT_DISCIPLINES.find(d=>d.id===passport.selectedDiscipline)?.label.toUpperCase()}</button>

    <div style={{position:'fixed',...side,bottom:18,zIndex:50}}><button onClick={()=>{const next=hand==='right'?'left':'right';setHand(next);localStorage.setItem('tryamm.sportverse.combat.hand',next)}} style={{minHeight:52,padding:'8px 12px',borderRadius:14,border:'1px solid #e8b94488',background:'#211907',color:'#ffe49b',fontWeight:950}}>CONTROLS → {hand==='right'?'LEFT':'RIGHT'}</button></div>

    <div style={{fontSize:9,opacity:.5,marginTop:12}}>Competition scoring is abstract and accessibility-first. This system does not provide real-world target/anatomy or weapon instruction. Client gameplay cannot declare real-money payouts.</div>
  </div>
}
