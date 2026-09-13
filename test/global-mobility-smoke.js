'use strict';

const assert = require('assert');
const register = require('../lib/global-mobility-routes');

const routes=[];
const app={get:(path,handler)=>routes.push(['GET',path,handler]),post:(path,...handlers)=>routes.push(['POST',path,handlers.at(-1)])};
const store={};
const clean=(v,max=120)=>String(v||'').trim().slice(0,max);
let seq=0;
register({app,auth:(_req,_res,next)=>next?.(),clean,id:p=>`${p}_${++seq}`,getStore:()=>store,saveStore:async()=>{}});
assert(routes.some(([m,p])=>m==='GET'&&p==='/api/mobility/cities'));
assert(routes.some(([m,p])=>m==='POST'&&p==='/api/mobility/events'));
assert(routes.some(([m,p])=>m==='POST'&&p==='/api/business-passports'));
assert(routes.some(([m,p])=>m==='GET'&&p==='/api/command-agent/economy'));
assert(routes.some(([m,p])=>m==='GET'&&p==='/api/internal-ledger/verify'));
assert(Array.isArray(store.internalLedger));
assert(Array.isArray(store.mobilityEvents));
assert(Array.isArray(store.businessPassports));
console.log('global mobility smoke: ok');
