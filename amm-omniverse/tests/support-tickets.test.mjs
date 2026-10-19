import test from 'node:test'
import assert from 'node:assert/strict'
import {createTicketHandler} from '../api/support/tickets.js'
const id='11111111-1111-4111-8111-111111111111'
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(data){this.data=data;return this}}}
const body={requestId:id,subject:'Website help',description:'Please help with my website domain.',category:'website-setup'}
test('inactive service does not authenticate or claim a ticket exists',async()=>{
 const h=createTicketHandler({enabled:()=>false,userFor:()=>assert.fail('auth should not run')});const res=response();await h({method:'POST',body},res);assert.equal(res.code,503);assert.equal(res.data.state,'NOT_ACTIVATED');assert.equal(res.data.ticket,undefined)
})
test('authentication is required before reading tickets',async()=>{
 const h=createTicketHandler({enabled:()=>true,userFor:(_req,res)=>{res.status(401).json({error:'Sign in'});return null},rest:()=>assert.fail('no database read')});const res=response();await h({method:'GET'},res);assert.equal(res.code,401)
})
test('ticket history is scoped to authenticated owner',async()=>{
 let query;const h=createTicketHandler({enabled:()=>true,userFor:async()=>({id:'owner'}),rest:async(_table,options)=>{query=options.query;return []}});const res=response();await h({method:'GET',query:{user_id:'other'}},res);assert.equal(query.user_id,'eq.owner');assert.deepEqual(res.data.tickets,[])
})
test('create ignores client ownership and status and confirms only stored rows',async()=>{
 let inserted;const h=createTicketHandler({enabled:()=>true,userFor:async()=>({id:'owner'}),rest:async(_table,options)=>{if(options.method==='POST'){inserted=options.body;return [{...inserted,id,created_at:'2026-10-19'}]}return []}});const res=response();await h({method:'POST',body:{...body,user_id:'other',status:'resolved'}},res);assert.equal(res.code,201);assert.equal(inserted.user_id,'owner');assert.equal(inserted.status,'open');assert.equal(res.data.ticket.reference,'TRY-'+id)
})
test('retry returns original ticket without duplicate insertion',async()=>{
 let inserts=0;const row={id,subject:body.subject,description:body.description,category:body.category,status:'open'};const h=createTicketHandler({enabled:()=>true,userFor:async()=>({id:'owner'}),rest:async(_table,options)=>{if(options.method==='POST')inserts++;return [row]}});const res=response();await h({method:'POST',body},res);assert.equal(res.code,200);assert.equal(inserts,0);assert.equal(res.data.replayed,true)
})
test('service outage never returns a submitted ticket',async()=>{
 const h=createTicketHandler({enabled:()=>true,userFor:async()=>({id:'owner'}),rest:async()=>{throw new Error('402')}});const res=response();await h({method:'POST',body},res);assert.equal(res.code,503);assert.equal(res.data.ticket,undefined)
})
test('changed content cannot reuse an already submitted request ID',async()=>{
 const h=createTicketHandler({enabled:()=>true,userFor:async()=>({id:'owner'}),rest:async()=>[{subject:'Different',description:body.description,category:body.category}]});const res=response();await h({method:'POST',body},res);assert.equal(res.code,409)
})

test('ordinary customer cannot load operator queue',async()=>{
 const h=createTicketHandler({enabled:()=>true,userFor:async()=>({id:'owner'}),rest:()=>assert.fail('operator query must be denied')});const res=response();await h({method:'GET',query:{queue:'1'}},res);assert.equal(res.code,403)
})
test('ordinary customer cannot change status or publish a reply',async()=>{
 const h=createTicketHandler({enabled:()=>true,userFor:async()=>({id:'owner'}),rest:()=>assert.fail('no update allowed')});const res=response();await h({method:'PATCH',body:{ticketId:id,status:'resolved',reply:'done'}},res);assert.equal(res.code,403)
})
test('operator queue receives descriptions only after authorization',async()=>{
 let query;const h=createTicketHandler({enabled:()=>true,userFor:async()=>({id:'staff',app_metadata:{role:'support'}}),rest:async(_table,options)=>{query=options.query;return [{id,description:'Help needed',status:'open'}]}});const res=response();await h({method:'GET',query:{queue:'1'}},res);assert.equal(res.code,200);assert.equal(query.user_id,undefined);assert.equal(res.data.tickets[0].description,'Help needed')
})
test('authorized operator update records actor and returns confirmed reply',async()=>{
 let bodySaved;const h=createTicketHandler({enabled:()=>true,userFor:async()=>({id:'staff',app_metadata:{role:'support'}}),rest:async(_table,options)=>{bodySaved=options.body;return [{...options.body,id}]}});const res=response();await h({method:'PATCH',body:{ticketId:id,status:'waiting_customer',reply:'Please confirm your domain.'}},res);assert.equal(res.code,200);assert.equal(bodySaved.updated_by,'staff');assert.equal(res.data.ticket.reply,'Please confirm your domain.')
})
