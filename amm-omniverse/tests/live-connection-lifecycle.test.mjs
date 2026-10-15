import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function harness(failure) {
  const events=new Map();const counts={stopped:0,disconnected:0,removed:0,destroyed:0}
  const localTrack={stop(){counts.stopped++}}
  class Room {
    remoteParticipants=new Map()
    localParticipant={trackPublications:new Map([['mic',{track:localTrack}]]),
      async setMicrophoneEnabled(){},async setCameraEnabled(){if(failure==='camera')throw new Error('camera denied')}}
    on(event,fn){events.set(event,fn)}
    once(event,fn){events.set(event,fn)}
    async connect(){if(failure==='connect')throw new Error('network unavailable')}
    async disconnect(){counts.disconnected++;events.get('disconnected')?.()}
  }
  const modules={
    './supabaseClient':{getAccessToken:async()=> 'test-token'},
    './protectedLive':{installCallSafeLive:()=>({destroy(){counts.destroyed++}})},
    'livekit-client':{Room,RoomEvent:{ParticipantConnected:'joined',ParticipantDisconnected:'left',TrackSubscribed:'track',TrackUnsubscribed:'unsubscribed',Disconnected:'disconnected'},Track:{Kind:{Audio:'audio',Video:'video'}}},
  }
  // Only substitute Vite's build-time environment syntax. Execute the production
  // function against fake transport/media dependencies; no external calls.
  const source=fs.readFileSync(new URL('../src/services/live.ts',import.meta.url),'utf8').replace('import.meta.env.VITE_API_URL','undefined')
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
  const exports={}
  vm.runInNewContext(code,{exports,Headers,require:name=>{assert.ok(modules[name],name);return modules[name]},fetch:async()=>({ok:true,json:async()=>({url:'wss://test.invalid',token:'fake',room:'pk-test'})})})
  return {connect:exports.connectLiveRoom,events,counts}
}

test('camera rejection cleans up a room and microphone opened earlier',async()=>{
 const h=harness('camera');await assert.rejects(h.connect({roomName:'pk',role:'host'}),/camera denied/)
 assert.equal(h.counts.stopped,1);assert.equal(h.counts.disconnected,1)
})
test('connection rejection disconnects and preserves the original error',async()=>{
 const h=harness('connect');await assert.rejects(h.connect({roomName:'pk',role:'viewer'}),/network unavailable/)
 assert.equal(h.counts.disconnected,1)
})
test('successful room stays connected and removed remote media is detached',async()=>{
 const h=harness();await h.connect({roomName:'pk',role:'host'});assert.equal(h.counts.disconnected,0)
 h.events.get('unsubscribed')({detach:()=>[{remove(){h.counts.removed++}},{remove(){h.counts.removed++}}]})
 assert.equal(h.counts.removed,2)
 h.events.get('disconnected')();assert.equal(h.counts.destroyed,1)
})
