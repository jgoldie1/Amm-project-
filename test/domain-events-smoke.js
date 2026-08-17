'use strict';
const assert=require('assert');
const {append,outboxMessage,retryMessage}=require('../lib/domain-events');
const store={};
const a=append(store,{type:'order.paid',aggregateType:'order',aggregateId:'o1',idempotencyKey:'stripe:evt_1',payload:{amount:1000}});assert(a.created);
const b=append(store,{type:'order.paid',aggregateType:'order',aggregateId:'o1',idempotencyKey:'stripe:evt_1',payload:{amount:1000}});assert(!b.created);assert.equal(store.domainEvents.length,1);
const m=outboxMessage(a.event,{destination:'inventory'});assert.equal(m.status,'pending');const r=retryMessage(m,0);assert.equal(r.attempts,1);assert(new Date(r.nextAttemptAt).getTime()>=1000);
console.log('domain events smoke: PASS');
