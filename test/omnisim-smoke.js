'use strict';
const assert=require('assert');

function buildFakeApp(){
  const routes=[];
  return {
    routes,
    get(path,...handlers){routes.push({method:'GET',path,handlers})},
    post(path,...handlers){routes.push({method:'POST',path,handlers})}
  };
}

const app=buildFakeApp();
const auth=(_req,_res,next)=>next();
const clean=(value,max=120)=>String(value||'').trim().slice(0,max);
const id=prefix=>`${prefix}_test`;
require('../lib/omnisim-routes')({app,auth,clean,id});

assert(app.routes.some(route=>route.method==='GET'&&route.path==='/api/omnisim/status'));
assert(app.routes.some(route=>route.method==='POST'&&route.path==='/api/omnisim/plan'));
assert(app.routes.some(route=>route.method==='POST'&&route.path==='/api/omnisim/dispatch'));

const statusRoute=app.routes.find(route=>route.method==='GET'&&route.path==='/api/omnisim/status');
let statusBody;
statusRoute.handlers.at(-1)({}, {json(value){statusBody=value}});
assert.equal(statusBody.service,'TRYAMM OmniSim');
assert(Array.isArray(statusBody.integrations));
assert(statusBody.integrations.includes('Founder Command Center'));
assert(statusBody.integrations.includes('StreetVerse'));

const planRoute=app.routes.find(route=>route.method==='POST'&&route.path==='/api/omnisim/plan');
let planStatus=200,planBody;
const req={body:{question:'What happens if TRYAMM launches a new business offer?',useCase:'business',rounds:12,actors:['customer','competitor']}};
const res={status(code){planStatus=code;return this},json(value){planBody=value}};
planRoute.handlers.at(-1)(req,res);
assert.equal(planStatus,201);
assert.equal(planBody.plan.engine,'TRYAMM OmniSim');
assert.equal(planBody.plan.useCase,'business');
assert.equal(planBody.plan.rounds,12);
assert.deepEqual(planBody.plan.scenarioBranches,['baseline','upside','downside']);
assert.equal(planBody.plan.guardrails.humanApprovalRequired,true);
console.log('OmniSim smoke passed');
