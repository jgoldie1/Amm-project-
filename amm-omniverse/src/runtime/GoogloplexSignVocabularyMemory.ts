export type SignVocabularyStatus='proposed'|'community-reviewed'|'certified'|'deprecated'|'blocked'
export type NonManualMarkers={brows?:'neutral'|'raised'|'lowered';mouth?:string;head?:string;gaze?:string;body?:string;emotion?:string}
export type SignVocabularyRecord={
 id:string;signLanguageTag:string;gloss:string;meanings:string[];regions:string[];contexts:string[]
 handshape?:string;location?:string;movement?:string;orientation?:string;twoHanded?:boolean
 nonManual?:NonManualMarkers;fingerspellFallback:boolean;status:SignVocabularyStatus;version:number
 replacesId?:string;reviewerIds?:string[];source?:string;createdAt:string;updatedAt:string
}
const vocab=new Map<string,SignVocabularyRecord>()
export function rememberSignVocabulary(r:SignVocabularyRecord){
 if(!r.id||!r.signLanguageTag||!r.gloss)throw new Error('invalid-sign-vocabulary')
 const previous=vocab.get(r.id)
 if(previous&&r.version<=previous.version)throw new Error('sign-vocabulary-version-must-increase')
 vocab.set(r.id,{...r,meanings:[...new Set(r.meanings)],regions:[...new Set(r.regions)],contexts:[...new Set(r.contexts)]})
 return vocab.get(r.id)!
}
export function findSignVocabulary(input:{signLanguageTag:string;term:string;region?:string;certifiedOnly?:boolean}){
 const q=input.term.toLowerCase()
 return [...vocab.values()].filter(r=>r.signLanguageTag.toLowerCase()===input.signLanguageTag.toLowerCase())
  .filter(r=>!input.certifiedOnly||r.status==='certified')
  .filter(r=>!input.region||!r.regions.length||r.regions.includes(input.region))
  .filter(r=>r.gloss.toLowerCase().includes(q)||r.meanings.some(x=>x.toLowerCase().includes(q)))
}
export function resolveSignExpression(input:{signLanguageTag:string;term:string;region?:string}){
 const certified=findSignVocabulary({...input,certifiedOnly:true})
 if(certified.length)return {status:'certified' as const,record:certified[0]}
 const candidates=findSignVocabulary({...input,certifiedOnly:false}).filter(r=>!['blocked','deprecated'].includes(r.status))
 return {status:'fallback' as const,candidates,fingerspell:true,reason:'no-certified-contextual-sign'}
}
