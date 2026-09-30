import type {StreetVerseExpressionId} from './streetVerseFacialExpressions'

export type StreetVerseAffectId=
 |'calm'|'happy'|'sad'|'angry'|'afraid'|'surprised'|'embarrassed'|'blushing'
 |'affectionate'|'flirtatious'|'romantic-arousal'|'jealous'|'disgusted'|'proud'|'tired'|'excited'

export type StreetVerseAffectProfile=Readonly<{
 id:StreetVerseAffectId
 label:string
 expression:StreetVerseExpressionId
 valence:number
 arousal:number
 trustDelta:number
 affectionDelta:number
 embarrassment:number
 blush:number
 pupilDilation:number
 breathing:number
 posture:'open'|'neutral'|'guarded'|'withdrawn'|'energized'
 adultOnly?:boolean
 consentRequired?:boolean
}>

export const STREETVERSE_AFFECTS:readonly StreetVerseAffectProfile[]=[
 {id:'calm',label:'Calm',expression:'neutral',valence:.15,arousal:.15,trustDelta:.02,affectionDelta:0,embarrassment:0,blush:0,pupilDilation:0,breathing:.15,posture:'neutral'},
 {id:'happy',label:'Happy',expression:'warm-smile',valence:.78,arousal:.48,trustDelta:.04,affectionDelta:.02,embarrassment:0,blush:.04,pupilDilation:.05,breathing:.35,posture:'open'},
 {id:'sad',label:'Sad',expression:'concerned',valence:-.72,arousal:.22,trustDelta:0,affectionDelta:0,embarrassment:.04,blush:0,pupilDilation:-.05,breathing:.20,posture:'withdrawn'},
 {id:'angry',label:'Angry',expression:'angry',valence:-.82,arousal:.82,trustDelta:-.08,affectionDelta:-.04,embarrassment:0,blush:.10,pupilDilation:.10,breathing:.82,posture:'guarded'},
 {id:'afraid',label:'Afraid',expression:'surprised',valence:-.72,arousal:.88,trustDelta:-.03,affectionDelta:0,embarrassment:.04,blush:.03,pupilDilation:.18,breathing:.92,posture:'withdrawn'},
 {id:'surprised',label:'Surprised',expression:'surprised',valence:.05,arousal:.80,trustDelta:0,affectionDelta:0,embarrassment:.02,blush:.04,pupilDilation:.16,breathing:.70,posture:'energized'},
 {id:'embarrassed',label:'Embarrassed',expression:'skeptical',valence:-.08,arousal:.62,trustDelta:0,affectionDelta:0,embarrassment:.88,blush:.72,pupilDilation:.06,breathing:.58,posture:'withdrawn'},
 {id:'blushing',label:'Blushing',expression:'warm-smile',valence:.52,arousal:.58,trustDelta:.02,affectionDelta:.04,embarrassment:.52,blush:.88,pupilDilation:.08,breathing:.52,posture:'open'},
 {id:'affectionate',label:'Affectionate',expression:'warm-smile',valence:.86,arousal:.42,trustDelta:.08,affectionDelta:.10,embarrassment:.05,blush:.28,pupilDilation:.08,breathing:.38,posture:'open'},
 {id:'flirtatious',label:'Flirtatious',expression:'warm-smile',valence:.72,arousal:.64,trustDelta:.03,affectionDelta:.06,embarrassment:.14,blush:.44,pupilDilation:.12,breathing:.55,posture:'open',adultOnly:true,consentRequired:true},
 {id:'romantic-arousal',label:'Romantic Arousal',expression:'warm-smile',valence:.76,arousal:.86,trustDelta:.02,affectionDelta:.08,embarrassment:.10,blush:.68,pupilDilation:.20,breathing:.86,posture:'energized',adultOnly:true,consentRequired:true},
 {id:'jealous',label:'Jealous',expression:'serious',valence:-.48,arousal:.66,trustDelta:-.06,affectionDelta:.01,embarrassment:.08,blush:.12,pupilDilation:.07,breathing:.60,posture:'guarded'},
 {id:'disgusted',label:'Disgusted',expression:'serious',valence:-.82,arousal:.48,trustDelta:-.10,affectionDelta:-.08,embarrassment:0,blush:0,pupilDilation:-.08,breathing:.36,posture:'withdrawn'},
 {id:'proud',label:'Proud',expression:'proud',valence:.70,arousal:.44,trustDelta:.02,affectionDelta:.01,embarrassment:0,blush:.04,pupilDilation:.04,breathing:.36,posture:'open'},
 {id:'tired',label:'Tired',expression:'tired',valence:-.12,arousal:.08,trustDelta:0,affectionDelta:0,embarrassment:0,blush:0,pupilDilation:-.04,breathing:.12,posture:'withdrawn'},
 {id:'excited',label:'Excited',expression:'laughing',valence:.82,arousal:.92,trustDelta:.03,affectionDelta:.03,embarrassment:.02,blush:.10,pupilDilation:.15,breathing:.90,posture:'energized'},
] as const

export const streetVerseAffect=(id:StreetVerseAffectId)=>
 STREETVERSE_AFFECTS.find(x=>x.id===id)??STREETVERSE_AFFECTS[0]
