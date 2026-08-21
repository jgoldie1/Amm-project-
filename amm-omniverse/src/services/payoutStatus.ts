import { getSupabaseClient } from './supabaseClient'

export type UnifiedPayoutRow={
  id:string
  lane:'game-prize'|'pastor-kofi-service-share'
  amount_cents:number
  currency:string
  state:string
  provider_ref?:string|null
  created_at?:string
  updated_at?:string
}

function sb(){const client=getSupabaseClient();if(!client)throw new Error('Supabase is not configured');return client}

export async function loadMyUnifiedPayouts():Promise<UnifiedPayoutRow[]>{
  const client=sb();const {data:{user}}=await client.auth.getUser();if(!user)throw new Error('Sign in is required to view payouts')
  const [game,service]=await Promise.all([
    client.from('game_prize_payouts').select('id,amount_cents,currency,state,provider_ref,created_at,updated_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50),
    client.from('service_share_payouts').select('id,amount_cents,currency,state,provider_ref,created_at,updated_at').eq('recipient_user_id',user.id).order('created_at',{ascending:false}).limit(50),
  ])
  if(game.error)throw game.error;if(service.error)throw service.error
  return [
    ...(game.data||[]).map((x:any)=>({...x,lane:'game-prize' as const})),
    ...(service.data||[]).map((x:any)=>({...x,lane:'pastor-kofi-service-share' as const})),
  ].sort((a:any,b:any)=>Date.parse(b.created_at||'0')-Date.parse(a.created_at||'0'))
}

export function payoutStateLabel(state:string){
  switch(state){
    case 'pending':return 'Waiting for verification'
    case 'held':return 'On hold'
    case 'approved':return 'Approved for provider submission'
    case 'submitted':return 'Submitted to payout provider'
    case 'paid':return 'Paid'
    case 'failed':return 'Provider failed — review required'
    case 'reversed':return 'Reversed'
    case 'cancelled':return 'Cancelled'
    default:return state
  }
}
