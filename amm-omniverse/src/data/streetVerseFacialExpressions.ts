import type {StreetVerseFacePose} from './streetVerseCharacterHeadRig'

export type StreetVerseExpressionId=
 |'neutral'|'warm-smile'|'serious'|'focused'|'concerned'|'skeptical'
 |'surprised'|'angry'|'laughing'|'proud'|'tired'

export type StreetVerseExpressionPreset=Readonly<{
 id:StreetVerseExpressionId
 label:string
 pose:StreetVerseFacePose
 holdMs:number
 transitionMs:number
}>

export const STREETVERSE_FACIAL_EXPRESSIONS:readonly StreetVerseExpressionPreset[]=[
 {id:'neutral',label:'Neutral',pose:{mouthSmile:0,mouthFrown:0,mouthWide:0,mouthNarrow:0,browInnerUp:0,browDownLeft:0,browDownRight:0,cheekRaise:0},holdMs:0,transitionMs:180},
 {id:'warm-smile',label:'Warm Smile',pose:{mouthSmile:.58,mouthFrown:0,mouthWide:.08,cheekRaise:.22,browInnerUp:.06},holdMs:2600,transitionMs:240},
 {id:'serious',label:'Serious',pose:{mouthSmile:0,mouthFrown:.08,mouthNarrow:.10,browDownLeft:.18,browDownRight:.18},holdMs:3200,transitionMs:220},
 {id:'focused',label:'Focused',pose:{mouthSmile:0,mouthFrown:.04,mouthNarrow:.08,browDownLeft:.25,browDownRight:.25},holdMs:3000,transitionMs:180},
 {id:'concerned',label:'Concerned',pose:{mouthFrown:.22,browInnerUp:.28,browDownLeft:.08,browDownRight:.08},holdMs:2800,transitionMs:220},
 {id:'skeptical',label:'Skeptical',pose:{mouthNarrow:.18,mouthFrown:.08,browDownLeft:.28,browDownRight:.05},holdMs:2500,transitionMs:200},
 {id:'surprised',label:'Surprised',pose:{jawOpen:.24,mouthWide:.22,browInnerUp:.55,browDownLeft:0,browDownRight:0},holdMs:1500,transitionMs:120},
 {id:'angry',label:'Angry',pose:{mouthFrown:.30,mouthNarrow:.12,browDownLeft:.45,browDownRight:.45},holdMs:2200,transitionMs:140},
 {id:'laughing',label:'Laughing',pose:{jawOpen:.42,mouthSmile:.78,mouthWide:.30,cheekRaise:.42,browInnerUp:.10},holdMs:2200,transitionMs:120},
 {id:'proud',label:'Proud',pose:{mouthSmile:.26,mouthNarrow:.05,browInnerUp:.04,browDownLeft:.04,browDownRight:.04},holdMs:3000,transitionMs:240},
 {id:'tired',label:'Tired',pose:{mouthFrown:.08,browInnerUp:.08,browDownLeft:.04,browDownRight:.04,lookDown:.08},holdMs:2600,transitionMs:280},
] as const

export const streetVerseExpression=(id:StreetVerseExpressionId)=>
 STREETVERSE_FACIAL_EXPRESSIONS.find(expression=>expression.id===id)??STREETVERSE_FACIAL_EXPRESSIONS[0]

export function requestStreetVerseExpression(detail:{
 characterId:string
 expression:StreetVerseExpressionId
 source:string
 holdMs?:number
}){
 const preset=streetVerseExpression(detail.expression)
 window.dispatchEvent(new CustomEvent('tryamm:character-expression-request',{detail:{
  ...detail,
  holdMs:detail.holdMs??preset.holdMs,
  transitionMs:preset.transitionMs,
  pose:preset.pose,
 }}))
}
