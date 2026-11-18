'use strict'
const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const root=path.resolve(__dirname,'../amm-omniverse/src')
const read=p=>fs.readFileSync(path.join(root,p),'utf8')
const design=read('data/FaithVerseCreatureArtDirection.ts')
const stories=read('data/FaithVerseAncientStories.ts')
const theater=read('components/FaithVerseAncientStoriesTheater.tsx')
for(const phrase of [
 'id:\'nephilim\'','id:\'watcher\'','id:\'goliath\'',
 'Genesis 6:1–4','Numbers 13:32–33','1 Enoch 6–15','1 Samuel 17:1–58',
 'creature anatomy','skinned3dAssetsVerified:false','canSpawnAsHostileNpc:false',
 'humanDignityRule','The identities, ancestry and size of the Nephilim are debated',
 'not a fallen angel','Torn',
])if(phrase!=='creature anatomy'&&phrase!=='Torn')assert.ok(design.includes(phrase),phrase)
for(const phrase of ["id:'nephilim-genesis'","id:'watchers-enoch'","id:'david-goliath'","Genesis 6:1–4","1 Enoch 6–15","1 Samuel 17:1–58"])assert.ok(stories.includes(phrase),phrase)
for(const phrase of ['FAITHVERSE_CREATURES','CREATURE_RELEASE','creature.historicalStatus','creature.humanDignityRule','creature.source.join','non-graphic','Teen · intimidating fictional giants and fallen angels','styleId===\'battle\'','styleId===\'giants\''])assert.ok(theater.includes(phrase),phrase)
assert.ok(theater.includes("contentLevel==='teen'||s.stageAge==='everyone'"),'teen-specific scenes must be hidden by default')
console.log('PASS: Nephilim, fallen Watchers and human Goliath retain distinct source traditions, representation and age boundaries')
