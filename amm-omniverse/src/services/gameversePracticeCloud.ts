import {getAccessToken} from './supabaseClient'
export type PracticeGame='spades-practice'|'pool-practice'
async function call(gameId:PracticeGame,method:'GET'|'POST',body?:unknown){
 const token=await getAccessToken()
 if(!token)throw new Error('Sign in to synchronize between devices. Local practice still works.')
 const url='/api/gameverse/practice-session?gameId='+encodeURIComponent(gameId)
 const response=await fetch(url,{method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})})
 const data=await response.json().catch(()=>({}))
 if(!response.ok)throw new Error(String(data.error||'Practice cloud save unavailable. Local play remains available.'))
 return data
}
export async function loadGameVersePractice<T>(gameId:PracticeGame):Promise<{state:T;revision:number}|null>{
 const data=await call(gameId,'GET')
 return data.session?{state:data.session.state as T,revision:Number(data.session.revision)||0}:null
}
export async function saveGameVersePractice(gameId:PracticeGame,state:unknown,expectedRevision:number):Promise<number>{
 const data=await call(gameId,'POST',{gameId,state,expectedRevision})
 return Number(data.revision)||0
}
