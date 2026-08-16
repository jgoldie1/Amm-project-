import { useMemo, useState } from 'react'
import {
  basketballAction,
  combatAction,
  createBasketballGame,
  createCombatGame,
  isBasketballOver,
  isCombatOver,
  type BasketballState,
  type CombatState,
  type LeagueLane,
} from '../../game/sports/SportsGameplayCore'

type GameId = 'basketball' | 'boxing' | 'mma'
type Props = { game: GameId; onExit: () => void }

const fmt = (s:number)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

export default function SportsGameplayPanel({ game, onExit }: Props) {
  const [lane,setLane]=useState<LeagueLane>(game==='basketball'?'mixed':'men')
  const [basket,setBasket]=useState<BasketballState>(()=>createBasketballGame('mixed'))
  const [combat,setCombat]=useState<CombatState>(()=>createCombatGame(game==='mma'?'mma':'boxing','men'))
  const [lastAction,setLastAction]=useState('Ready')

  const isBasket=game==='basketball'
  const title=useMemo(()=> game==='basketball'?'Court Kings / Court Queens':game==='boxing'?'Fight Kingdom Boxing':'Combat Arena MMA',[game])

  function reset(nextLane:LeagueLane){
    setLane(nextLane)
    if(isBasket) setBasket(createBasketballGame(nextLane))
    else setCombat(createCombatGame(game, nextLane==='women'?'women':'men'))
    setLastAction('New match ready')
  }

  function doBasket(action:'pass'|'drive'|'shoot2'|'shoot3'|'dunk'|'steal'|'block'){
    if(isBasketballOver(basket)) return
    const before=basket
    const after=basketballAction(before,action)
    setBasket(after)
    const deltaHome=after.homeScore-before.homeScore
    const deltaAway=after.awayScore-before.awayScore
    setLastAction(deltaHome||deltaAway?`${action.toUpperCase()} · SCORE +${deltaHome||deltaAway}`:action.toUpperCase())
  }

  function doCombat(action:'jab'|'cross'|'hook'|'body'|'block'|'dodge'|'takedown'|'grapple'){
    if(isCombatOver(combat)) return
    const after=combatAction(combat,'red',action)
    setCombat(after)
    setLastAction(action.toUpperCase())
  }

  const btn=(label:string,onClick:()=>void,disabled=false)=><button type="button" disabled={disabled} onClick={onClick} style={{padding:'10px 12px',borderRadius:8,border:'1px solid #4fe3ff77',background:disabled?'#111':'#0a2432',color:disabled?'#555':'#bdf8ff',fontWeight:800,cursor:disabled?'not-allowed':'pointer'}}>{label}</button>

  return <div style={{minHeight:520,background:'radial-gradient(circle at top,#112641,#050817 55%)',border:'1px solid #4fe3ff55',borderRadius:14,padding:18,color:'#fff'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
      <div><div style={{fontSize:20,fontWeight:900,color:'#8ff5ff'}}>{title}</div><div style={{fontSize:11,color:'#8391a8'}}>Original TryAMM sports engine · recovered athlete-rig ready</div></div>
      <button onClick={onExit} style={{border:'1px solid #ffffff44',background:'#11182a',color:'#fff',borderRadius:8,padding:'8px 12px'}}>EXIT</button>
    </div>

    <div style={{display:'flex',gap:8,margin:'16px 0',flexWrap:'wrap'}}>
      {(['men','women',...(isBasket?['mixed'] as LeagueLane[]:[])] as LeagueLane[]).map(x=>
        <button key={x} onClick={()=>reset(x)} style={{padding:'7px 11px',borderRadius:999,border:`1px solid ${lane===x?'#e8b944':'#ffffff33'}`,background:lane===x?'#3a2b10':'#101525',color:lane===x?'#ffe493':'#bbb',fontWeight:800,textTransform:'uppercase'}}>{x}</button>
      )}
    </div>

    {isBasket ? <>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:14,alignItems:'center',padding:'18px 8px',background:'#071121aa',borderRadius:12}}>
        <div style={{textAlign:'center'}}><div style={{fontSize:34,fontWeight:900,color:'#4fe3ff'}}>{basket.homeScore}</div><div>KINGDOM</div></div>
        <div style={{textAlign:'center',fontFamily:'monospace'}}><div>Q{basket.quarter===5?'OT':basket.quarter}</div><div style={{fontSize:20}}>{fmt(basket.gameClockSeconds)}</div><div style={{color:'#ff8a8a'}}>SHOT {basket.shotClockSeconds}</div></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:34,fontWeight:900,color:'#e8b944'}}>{basket.awayScore}</div><div>NEXUS</div></div>
      </div>
      <div style={{marginTop:12,fontSize:12,color:'#a9b9ce'}}>Possession: <b>{basket.possession.toUpperCase()}</b> · Active: {basket.selectedAthleteId} · {lastAction}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:8,marginTop:14}}>
        {btn('PASS',()=>doBasket('pass'))}{btn('DRIVE',()=>doBasket('drive'))}{btn('2PT',()=>doBasket('shoot2'))}{btn('3PT',()=>doBasket('shoot3'))}{btn('DUNK',()=>doBasket('dunk'))}{btn('STEAL',()=>doBasket('steal'))}{btn('BLOCK',()=>doBasket('block'))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginTop:14}}>{basket.home.map(a=><button key={a.id} onClick={()=>setBasket({...basket,selectedAthleteId:a.id})} style={{padding:8,borderRadius:8,border:`1px solid ${basket.selectedAthleteId===a.id?'#4fe3ff':'#ffffff22'}`,background:'#0a1020',color:'#fff'}}><div>{a.displayName}</div><small>ENERGY {a.energy}</small></button>)}</div>
      {isBasketballOver(basket)&&<div style={{marginTop:16,padding:12,border:'1px solid #e8b94488',borderRadius:10,color:'#ffe493',textAlign:'center',fontWeight:900}}>FINAL · {basket.homeScore>basket.awayScore?'KINGDOM WINS':'NEXUS WINS'}</div>}
    </> : <>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:14,alignItems:'center',padding:'18px 8px',background:'#150b12aa',borderRadius:12}}>
        <div style={{textAlign:'center'}}><div style={{fontSize:28,fontWeight:900,color:'#ff6d6d'}}>{combat.red.displayName}</div><div>HP {combat.redHealth} · ST {combat.red.energy}</div><div>PTS {combat.redScore}</div></div>
        <div style={{textAlign:'center',fontFamily:'monospace'}}><div>ROUND {combat.round}</div><div style={{fontSize:20}}>{fmt(combat.roundClockSeconds)}</div><div style={{color:'#8ff5ff'}}>{game.toUpperCase()}</div></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:28,fontWeight:900,color:'#8fb8ff'}}>{combat.blue.displayName}</div><div>HP {combat.blueHealth} · ST {combat.blue.energy}</div><div>PTS {combat.blueScore}</div></div>
      </div>
      <div style={{marginTop:12,fontSize:12,color:'#a9b9ce'}}>{lastAction}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:8,marginTop:14}}>
        {btn('JAB',()=>doCombat('jab'))}{btn('CROSS',()=>doCombat('cross'))}{btn('HOOK',()=>doCombat('hook'))}{btn('BODY',()=>doCombat('body'))}{btn('BLOCK',()=>doCombat('block'))}{btn('DODGE',()=>doCombat('dodge'))}{btn('TAKEDOWN',()=>doCombat('takedown'),game!=='mma')}{btn('GRAPPLE',()=>doCombat('grapple'),game!=='mma')}
      </div>
      {isCombatOver(combat)&&<div style={{marginTop:16,padding:12,border:'1px solid #e8b94488',borderRadius:10,color:'#ffe493',textAlign:'center',fontWeight:900}}>FIGHT COMPLETE · {combat.redHealth>combat.blueHealth?'JUDAH RED WINS':'NEXUS BLUE WINS'}</div>}
    </>}

    <div style={{marginTop:18,padding:10,borderTop:'1px solid #ffffff1c',fontSize:11,color:'#718198'}}>Next render layer: athlete.glb + embedded animations + recovered arena SFX + broadcast camera + controller/mobile input.</div>
  </div>
}
