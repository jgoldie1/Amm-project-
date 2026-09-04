import { getAccessToken } from './supabaseClient'

export type HappyHorseJob={
 provider:'happyhorse'
 modelId:string
 generationId?:string|null
 taskId?:string|null
 state:string
 status:'gated'|'submitted'
 reservedCredits?:number|null
}

async function readJson(r:Response){
 const text=await r.text()
 try{return text?JSON.parse(text):{}}
 catch{return {error:text||`Happy Horse API ${r.status}`}}
}

export async function submitHappyHorseJob(input:{prompt:string;modelId?:string;imageUrl?:string;aspectRatio?:string;quality?:string;duration?:number;generateAudio?:boolean}):Promise<HappyHorseJob>{
 const prompt=input.prompt.trim()
 if(!prompt)throw new Error('Happy Horse prompt is required')
 const token=await getAccessToken()
 if(!token)return {provider:'happyhorse',modelId:input.modelId||'video:happyhorse-1-1-text-to-video',state:'auth-required',status:'gated'}
 const response=await fetch('/api/media/happy-horse',{
  method:'POST',
  headers:{'content-type':'application/json',authorization:`Bearer ${token}`},
  body:JSON.stringify(input)
 })
 const data=await readJson(response)
 if(response.status===503)return {provider:'happyhorse',modelId:data.modelId||input.modelId||'video:happyhorse-1-1-text-to-video',state:'provider-key-required',status:'gated'}
 if(!response.ok||!data.ok)throw new Error(data.error||`Happy Horse API ${response.status}`)
 return {provider:'happyhorse',modelId:data.modelId||input.modelId||'video:happyhorse-1-1-text-to-video',generationId:data.generationId||null,taskId:data.taskId||null,state:data.state||'queued',status:'submitted',reservedCredits:data.reservedCredits??null}
}

export async function getHappyHorseHealth(){
 try{
  const r=await fetch('/api/media/happy-horse',{cache:'no-store'})
  const d=await readJson(r)
  return {configured:Boolean(d.configured),provider:'happyhorse' as const,model:d.model||'video:happyhorse-1-1-text-to-video',requiresAuthenticatedUser:true}
 }catch{return {configured:false,provider:'happyhorse' as const,model:'video:happyhorse-1-1-text-to-video',requiresAuthenticatedUser:true}}
}
