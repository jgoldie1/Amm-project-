import assert from 'node:assert/strict'
import {test} from 'node:test'
import {build} from 'esbuild'
import {runInNewContext} from 'node:vm'

test('Circle Park choices and quest awards persist through replay and remount',async()=>{
  const bundle=await build({stdin:{contents:`
    export {selectStreetVerseMissionRoute} from './src/runtime/StreetVerseMissionDiscoveryRuntime'
    export {installStreetVerseRpgCore} from './src/runtime/StreetVerseRpgCoreRuntime'
    export {completeCircleParkQuest} from './src/runtime/CircleParkQuestEvents'
  `,resolveDir:new URL('..',import.meta.url).pathname},bundle:true,platform:'browser',format:'iife',globalName:'game',write:false})
  const window=new EventTarget(),data=new Map()
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)}
  const game=runInNewContext(bundle.outputFiles[0].text+';game',{
    window,localStorage:storage,CustomEvent,addEventListener:window.addEventListener.bind(window),
    removeEventListener:window.removeEventListener.bind(window),
  })
  const state=()=>JSON.parse(storage.getItem('tryamm.streetverse.rpg-core.v1'))
  const mission={id:'circle-park-home',title:'Find & Claim Your Apartment',rewardXP:200}
  const select=choice=>game.selectStreetVerseMissionRoute({missionId:mission.id,choice,hand:'left',mode:'one-hand'})
  let stop=game.installStreetVerseRpgCore()
  assert.equal(select('D').selected,false)
  assert.equal(state().xp,0)
  select('B')
  select('B')
  assert.deepEqual(state().choices,['circle-park-home:route:B'])
  assert.equal(state().xp,10)
  game.completeCircleParkQuest(mission,'Jacobie')
  assert.deepEqual(state().completedQuestIds,[mission.id])
  assert.equal(state().xp,210)
  stop()
  select('C')
  assert.equal(state().xp,210)
  stop=game.installStreetVerseRpgCore()
  game.completeCircleParkQuest(mission,'Jacobie')
  assert.equal(state().xp,210)
  stop()
})
