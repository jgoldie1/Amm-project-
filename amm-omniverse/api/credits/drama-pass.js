import {adminRest, adminRpc, json} from '../_lib/supabase-admin.js'
import {requireUser} from '../_lib/security.js'

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, {error:'Use POST.'})
  const user = await requireUser(req, res)
  if (!user) return
  const {action, userId, creditLimit, reference} = req.body || {}
  try {
    if (action === 'approve') {
      if (user.id !== process.env.TRYAMM_CREATOR_PASS_OWNER_ID) return json(res,403,{error:'Owner approval required.'})
      if (!uuid.test(userId) || !Number.isInteger(creditLimit) || creditLimit < 0 || creditLimit > 400)
        return json(res,400,{error:'Enter an account ID and a lifetime limit from 0 to 400 credits.'})
      const result = await adminRpc('approve_drama_creator_pass',{p_user_id:userId,p_limit:creditLimit,p_owner:user.id})
      return json(res,200,result)
    }
    if (action === 'status') {
      const rows = await adminRest('drama_creator_passes',{query:{user_id:'eq.'+user.id,select:'credit_limit,used_units'}})
      return json(res,200,{accountId:user.id,pass:rows[0] || null,owner:user.id === process.env.TRYAMM_CREATOR_PASS_OWNER_ID})
    }
    if (action !== 'claim' || typeof reference !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(reference))
      return json(res,400,{error:'Invalid render request.'})
    return json(res,200,await adminRpc('claim_drama_creator_render',{p_user_id:user.id,p_source_id:'drama-pass:'+reference}))
  } catch(error) {
    const reason = String(error.message)
    if (reason.includes('drama_pass_limit')) return json(res,409,{error:'Your approved cap is reached.'})
    if (reason.includes('drama_pass_inactive')) return json(res,403,{error:'An active owner-approved pass is required.'})
    return json(res,503,{error:'Creator pass unavailable. No paid fallback was requested.'})
  }
}
