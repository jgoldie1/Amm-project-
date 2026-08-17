'use strict';
const assert=require('assert');
const {buildGraph,calendar,launchGate}=require('../lib/regulatory-graph');
const graph=buildGraph([{id:'r1',name:'Required license',domain:'property',jurisdiction:'Illinois',level:'state',authority:'State regulator',requiredFor:['regulated-closing'],blocksFeature:true,status:'unverified',expiresAt:'2026-08-01'},{id:'r2',name:'Privacy review',domain:'property',jurisdiction:'Illinois',blocksFeature:false,status:'verified',lastVerifiedAt:'2026-08-01'}]);
const cal=calendar(graph,new Date('2026-08-17T12:00:00Z'));assert.equal(cal[0].urgency,'expired');assert(cal[0].featureBlocked);
const gate=launchGate({graph,domain:'property',jurisdictions:['Illinois'],feature:'regulated-closing'});assert.equal(gate.allowed,false);assert.equal(gate.blockers.length,1);
console.log('regulatory graph smoke: PASS');
