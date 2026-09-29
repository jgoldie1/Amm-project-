'use strict'

const assert=require('node:assert/strict')
const {createMiddleWearSecurityGateway,classifyRoute,operatorRole}=require('../lib/middlewear-security-gateway')

function queryResult(data,error=null){
  return{
    select(){return this},
    eq(){return this},
    neq(){return this},
    maybeSingle:async()=>({data,error}),
  }
}

function createSupabase({route,handOff,auditFail=false,userRole='member'}={}){
  const auditRows=[]
  const idempotencyRows=[]
  return{
    auditRows,idempotencyRows,
    auth:{
      getUser:async token=>token==='valid-token'
        ?{data:{user:{id:'user-1',app_metadata:{role:userRole}}},error:null}
        :{data:{user:null},error:new Error('bad-token')},
    },
    from(table){
      if(table==='security_audit_events'){
        return{insert:async row=>{auditRows.push(row);return auditFail?{error:new Error('audit-down')}:{error:null}}}
      }
      if(table==='middleverse_routes')return queryResult(route||null)
      if(table==='middleverse_handoffs')return queryResult(handOff||null)
      if(table==='middlewear_idempotency_keys'){
        let filters=[]
        const api={
          insert:row=>{
            const duplicate=idempotencyRows.find(x=>x.user_id===row.user_id&&x.operation===row.operation&&x.key_hash===row.key_hash)
            if(duplicate)return{select:()=>({maybeSingle:async()=>({data:null,error:{code:'23505'}})})}
            const data={id:'idem-'+(idempotencyRows.length+1),...row};idempotencyRows.push(data)
            return{select:()=>({maybeSingle:async()=>({data,error:null})})}
          },
          select(){return api},
          eq(k,v){filters.push([k,v]);return api},
          gt(){return api},
          maybeSingle:async()=>{
            const data=idempotencyRows.find(row=>filters.every(([k,v])=>row[k]===v))||null
            filters=[]
            return{data,error:null}
          },
          update:patch=>({eq:async(k,v)=>{for(const row of idempotencyRows)if(row[k]===v)Object.assign(row,patch);return{error:null}}}),
        }
        return api
      }
      throw new Error('unexpected table '+table)
    },
  }
}

function req(path,method='GET',body={},roleHeader='Bearer valid-token'){
  return{
    path,method,body,params:{id:'handoff-1'},
    headers:{authorization:roleHeader},
    securityContext:{requestId:'request-12345678'},
    swarmShield:{pathClass:'normal'},
    redHatSentinel:{riskScore:0},
  }
}
function res(){
  return{
    code:200,body:null,
    status(code){this.code=code;return this},
    json(body){this.body=body;return this},
  }
}

assert.equal(classifyRoute({high_impact:true,capabilities:{}}).humanReview,true)
assert.equal(classifyRoute({high_impact:false,capabilities:{money_sensitive:true}}).providerRequired,true)
assert.equal(operatorRole({app_metadata:{role:'security'}}),true)
assert.equal(operatorRole({app_metadata:{role:'member'}}),false)

async function run(){
  {
    const supabase=createSupabase()
    const gateway=createMiddleWearSecurityGateway({supabase})
    const request=req('/status')
    const response=res();let next=false
    await gateway.authenticate(request,response,()=>{next=true})
    assert.equal(next,true)
    assert.equal(request.user.id,'user-1')
    assert.equal(request.middleWearSecurity.identityVerified,true)
    assert.equal(supabase.auditRows.length,0,'safe reads should not create audit noise')
  }

  {
    const route={route_key:'ai-to-workforce',target_system:'workforce',high_impact:false,capabilities:{}}
    const supabase=createSupabase({route})
    const gateway=createMiddleWearSecurityGateway({supabase})
    const request=req('/handoffs','POST',{routeKey:route.route_key,riskBand:'green',sourceContext:{blob:'x'.repeat(140000)}})
    const response=res()
    await gateway.authenticate(request,response,()=>{})
    await gateway.loadRoutePolicy(request,response,()=>{})
    assert.equal(response.code,413)
    assert.equal(response.body.gate,'middlewear-resource-limit')
  }

  {
    const route={route_key:'workforce-to-commerce',target_system:'commerce',high_impact:true,capabilities:{money_sensitive:true,human_review:true}}
    const supabase=createSupabase({route})
    const gateway=createMiddleWearSecurityGateway({supabase})
    const request=req('/handoffs','POST',{routeKey:route.route_key,riskBand:'green'})
    const response=res()
    await gateway.authenticate(request,response,()=>{})
    await gateway.loadRoutePolicy(request,response,()=>{})
    assert.equal(response.code,409)
    assert.equal(response.body.gate,'middlewear-risk')
  }

  {
    const route={route_key:'workforce-to-safety',target_system:'trust-safety',high_impact:true,capabilities:{human_review:true}}
    const handOff={id:'handoff-1',route_key:route.route_key,user_id:'user-1',status:'in_progress'}
    const supabase=createSupabase({route,handOff,userRole:'member'})
    const gateway=createMiddleWearSecurityGateway({supabase})
    const request=req('/handoffs/handoff-1/status','POST',{status:'completed'})
    const response=res()
    await gateway.authenticate(request,response,()=>{})
    await gateway.guardHighImpactCompletion(request,response,()=>{})
    assert.equal(response.code,403)
    assert.equal(response.body.requiresOperatorReview,true)
  }

  {
    const route={route_key:'workforce-to-safety',target_system:'trust-safety',high_impact:true,capabilities:{human_review:true}}
    const handOff={id:'handoff-1',route_key:route.route_key,user_id:'user-1',status:'in_progress'}
    const supabase=createSupabase({route,handOff,userRole:'security'})
    const gateway=createMiddleWearSecurityGateway({supabase})
    const request=req('/handoffs/handoff-1/status','POST',{status:'completed'})
    const response=res();let next=false
    await gateway.authenticate(request,response,()=>{})
    await gateway.guardHighImpactCompletion(request,response,()=>{next=true})
    assert.equal(next,true)
  }

  console.log('TRYAMM MiddleWear Security Gateway contract: PASS')
}

run().catch(error=>{console.error(error);process.exit(1)})