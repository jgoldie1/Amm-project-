const assert = require("node:assert/strict");
const { createSession, normalizeScene } = require("../public/streetverse-rpg-engine.js");
const events = [];
const scene = { id:"chicago-intro", start:"welcome", nodes:[
  { id:"welcome", speaker:"Guide", text:"Welcome to StreetVerse", reaction:"👋", options:[{label:"Accept mission",next:"mission",event:"mission.accepted"},{label:"Leave"}]},
  { id:"mission",speaker:"Guide",text:"Visit the neighborhood business",options:[{label:"Finish",event:"mission.intro.completed"}]}
]};
const session = createSession(scene, e=>events.push(e));
assert.equal(session.view().speaker,"Guide");
assert.equal(session.choose(0).id,"mission");
assert.equal(events[0].type,"mission.accepted");
assert.equal(session.choose(0).finished,true);
assert.equal(events.length,2);
assert.throws(()=>session.choose(0));
assert.equal(session.reset().id,"welcome");
assert.throws(()=>normalizeScene({nodes:[{id:"x",options:[{next:"missing"}]}]}));
console.log("StreetVerse RP engine smoke passed");
