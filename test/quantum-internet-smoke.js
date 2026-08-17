'use strict';
const assert=require('assert');
const q=require('../lib/quantum-intelligence');

const items=[
 {title:'Independent climate adaptation study',summary:'urban heat adaptation evidence',host:'doi.org',sourceType:'academic',sourceLabel:'ACADEMIC',verified:true,year:new Date().getUTCFullYear()-1,rank:80},
 {title:'Community reports heat risk',summary:'residents report heat and cooling access risk',host:'reddit.com',sourceType:'reddit',sourceLabel:'COMMUNITY SOURCE',rank:40},
 {title:'Small web urban heat diary',summary:'independent local observations on heat adaptation',host:'example.net',sourceType:'smallweb',sourceLabel:'SMALL WEB',independent:true,rank:50},
 {title:'TRYAMM heat resilience paper',summary:'verified platform publication on urban heat adaptation',host:'tryamm.online',sourceType:'tryamm',sourceLabel:'TRYAMM VERIFIED',verified:true,rank:90},
 {title:'Archived city heat plan',summary:'historical heat adaptation plan',host:'web.archive.org',sourceType:'archive',sourceLabel:'ARCHIVED',year:2018,rank:30}
];

const ranked=q.semanticRank('urban heat adaptation',items);
assert.equal(ranked.length,5);
assert(ranked[0].semanticScore>=ranked[4].semanticScore);
const map=q.evidenceMap('urban heat adaptation',items);
assert(map.coverage.sourceTypes.includes('academic'));
assert(map.coverage.sourceTypes.includes('smallweb'));
assert(map.ranked.every(x=>typeof x.fingerprint==='string'&&x.fingerprint.length===64));
const graph=q.entityGraph(items);
assert(graph.entities.length>0&&graph.edges.length>0);
const plan=q.synthesisPlan('urban heat adaptation',map);
assert(plan.prohibited.includes('inventing citations'));
const evals=q.evaluateResultSet(items);
assert(evals.hasAcademic&&evals.hasSmallWeb&&evals.hasCommunity&&evals.hasArchive&&evals.hasTryamm);
assert.equal(typeof evals.domainDiversity,'number');
console.log('QUANTUM INTERNET INTELLIGENCE CHECK: PASS');
