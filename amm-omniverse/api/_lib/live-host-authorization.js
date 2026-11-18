// Only Supabase server-side app_metadata (or an explicit operator allowlist)
// may authorize a public publisher. User-editable metadata and browser age
// selections are NOT evidence of age, consent, or moderation readiness.
export function liveHostDecision(user){
  const claims=user?.app_metadata||{};
  const band=String(claims.tryamm_age_band||'');
  const approved=claims.tryamm_live_host_approved===true;
  const operators=String(process.env.TRYAMM_LIVE_OPERATOR_USER_IDS||'').split(',').map(x=>x.trim()).filter(Boolean);
  if(!user?.id)return {allowed:false,reason:'sign_in_required'};
  if(band==='under-12'||band==='age-12')return {allowed:false,reason:'youth_host_not_available'};
  if(band==='teen'){
    if(!approved||claims.tryamm_guardian_live_approved!==true||claims.tryamm_live_moderation_approved!==true){
      return {allowed:false,reason:'guardian_and_moderation_review_required'};
    }
    return {allowed:true,reason:'verified_supervised_teen_creator'};
  }
  if(band==='adult'&&approved)return {allowed:true,reason:'verified_adult_host'};
  if(band==='adult'&&operators.includes(String(user.id)))return {allowed:true,reason:'approved_operator'};
  return {allowed:false,reason:'host_authorization_required'};
}
