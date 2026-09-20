import {defaultCombatPassport,type CombatPassportState,type CombatDisciplineId} from '../config/combatSportPassport'

const KEY='tryamm.combat.passport.v1'
let installed=false

export function readCombatPassport():CombatPassportState{
  try{return {...defaultCombatPassport(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return defaultCombatPassport()}
}
export function writeCombatPassport(state:CombatPassportState){
  try{localStorage.setItem(KEY,JSON.stringify({...state,updatedAt:new Date().toISOString()}))}catch{}
  window.dispatchEvent(new CustomEvent('tryamm:combat-passport-state',{detail:state}))
  return state
}

export function installCombatSportPassportRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true

  window.addEventListener('tryamm:combat-discipline-select',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    const state=readCombatPassport()
    writeCombatPassport({...state,selectedDiscipline:String(d.id||'mma') as CombatDisciplineId})
  })

  window.addEventListener('tryamm:martial-style-selected',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    const state=readCombatPassport()
    writeCombatPassport({...state,selectedAnimalStyle:String(d.styleId||d.id||state.selectedAnimalStyle)})
  })

  window.addEventListener('tryamm:animal-style-xp',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    const state=readCombatPassport()
    const id=String(d.styleId||state.selectedAnimalStyle)
    const amount=Math.max(0,Number(d.xp||25))
    writeCombatPassport({...state,styleXp:{...state.styleXp,[id]:(state.styleXp[id]||0)+amount}})
  })

  window.addEventListener('tryamm:combat-result',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    const state=readCombatPassport()
    const discipline=String(d.discipline||state.selectedDiscipline)
    const xp=Math.max(0,Number(d.xp||100))
    writeCombatPassport({
      ...state,
      disciplineXp:{...state.disciplineXp,[discipline]:(state.disciplineXp[discipline]||0)+xp},
      wins:state.wins+(d.won?1:0),
      losses:state.losses+(d.won?0:1),
    })
  })

  window.dispatchEvent(new CustomEvent('tryamm:combat-passport-ready',{detail:{shared:true,oneHand:true,realWorldInstruction:false}}))
}
