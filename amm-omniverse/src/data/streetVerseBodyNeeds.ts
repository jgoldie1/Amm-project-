export type StreetVerseBodyNeedId=
 |'hunger'|'thirst'|'fatigue'|'pain'|'stress'|'temperature'|'injury'|'stamina'

export type StreetVerseBodyState=Readonly<{
 characterId:string
 hunger:number
 thirst:number
 fatigue:number
 pain:number
 stress:number
 temperature:number
 injury:number
 stamina:number
 updatedAt:string
 authority:'SERVER'
}>

export const STREETVERSE_BODY_NEEDS={
 hunger:{label:'Hunger',healthyBelow:.45,criticalAbove:.82},
 thirst:{label:'Thirst',healthyBelow:.40,criticalAbove:.78},
 fatigue:{label:'Fatigue',healthyBelow:.45,criticalAbove:.82},
 pain:{label:'Pain',healthyBelow:.20,criticalAbove:.75},
 stress:{label:'Stress',healthyBelow:.40,criticalAbove:.80},
 temperature:{label:'Temperature Stress',healthyBelow:.25,criticalAbove:.78},
 injury:{label:'Injury',healthyBelow:.10,criticalAbove:.70},
 stamina:{label:'Stamina',healthyAbove:.55,criticalBelow:.20},
} as const

export const createStreetVerseBodyState=(characterId:string):StreetVerseBodyState=>({
 characterId,
 hunger:.12,
 thirst:.10,
 fatigue:.10,
 pain:0,
 stress:.08,
 temperature:.08,
 injury:0,
 stamina:.92,
 updatedAt:new Date(0).toISOString(),
 authority:'SERVER',
})

export const requestStreetVerseBodyStateChange=(detail:{
 characterId:string
 need:StreetVerseBodyNeedId
 delta:number
 source:string
 reason?:string
})=>window.dispatchEvent(new CustomEvent('tryamm:character-body-state-change-request',{detail:{...detail,serverValidate:true}}))

export const requestStreetVerseConsumable=(detail:{
 characterId:string
 assetId:string
 quantity:number
 source:string
})=>window.dispatchEvent(new CustomEvent('tryamm:character-consumable-use-request',{detail:{...detail,serverValidate:true}}))
