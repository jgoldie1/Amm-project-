import{adminRest,json}from'../_lib/supabase-admin.js';
const one=x=>Array.isArray(x)?x[0]:x;
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'});
 try{
  const b=req.body||{};const vehicleId=String(b.vehicleId||'').trim(),driverUserId=String(b.driverUserId||'').trim(),startRegion=String(b.startRegion||'').trim().toUpperCase(),airportCode=String(b.airportCode||'').trim().toUpperCase()||null;
  if(!vehicleId||!driverUserId||!startRegion)return json(res,400,{error:'vehicleId_driverUserId_startRegion_required'});
  const vehicle=one(await adminRest('omniride_vehicles',{query:{id:`eq.${vehicleId}`,select:'*'}}));
  const driver=one(await adminRest('omniride_driver_eligibility',{query:{user_id:`eq.${driverUserId}`,select:'*'}}));
  const coverage=one(await adminRest('omniride_coverage_eligibility',{query:{vehicle_id:`eq.${vehicleId}`,region:`eq.${startRegion}`,select:'*'}}));
  const rule=one(await adminRest('omniride_jurisdiction_rules',{query:{region:`eq.${startRegion}`,active:'eq.true',select:'*',order:'effective_at.desc',limit:'1'}}));
  const airport=airportCode?one(await adminRest('omniride_airport_rules',{query:{airport_code:`eq.${airportCode}`,active:'eq.true',select:'*',order:'effective_at.desc',limit:'1'}})):null;
  const checks={vehicle_verified:Boolean(vehicle&&vehicle.verification_status==='verified'&&vehicle.safety_status==='eligible'),driver_eligible:Boolean(driver&&driver.status==='eligible'&&(!driver.expires_at||new Date(driver.expires_at)>new Date())),coverage_valid:Boolean(coverage&&coverage.status==='eligible'&&(!coverage.expires_at||new Date(coverage.expires_at)>new Date())),jurisdiction_configured:Boolean(rule&&rule.booking_allowed===true),airport_allowed:!airportCode||Boolean(airport&&airport.pickup_allowed===true)};
  const blocked=Object.entries(checks).filter(([,ok])=>!ok).map(([key])=>key);const allowed=blocked.length===0;
  await adminRest('omniride_booking_gate_events',{method:'POST',body:{vehicle_id:vehicleId,driver_user_id:driverUserId,start_region:startRegion,airport_code:airportCode,allowed,decision_code:allowed?'authorized':'blocked',failed_checks:blocked,created_at:new Date().toISOString()}});
  return json(res,allowed?200:403,{allowed,checks,blocked,ruleVersion:rule?.version||null,coverageRef:coverage?.coverage_ref||null,note:allowed?'Eligibility checks passed. Payment/booking creation may proceed through the separate transaction service.':'Real paid peer-to-peer trip remains blocked until every required gate passes.'});
 }catch(e){return json(res,e.status||503,{error:e.message||'omniride_booking_gate_failed'})}
}
