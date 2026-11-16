import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('root site and Omniverse game serve identical mission assets',()=>{
 for(const file of ['warehouse-mission-engine.mjs','warehouse-mission-ui.mjs','warehouse-missions.html'])
  assert.equal(read('public/'+file),read('amm-omniverse/public/'+file),file+' diverged');
});
test('TRYAMM home has accessible warehouse mission launcher',()=>{
 const home=read('amm-omniverse/src/components/TryAMMHome.tsx');
 assert.match(home,/title:'Warehouse Delivery'/);
 assert.match(home,/window\.location\.href='\/warehouse-missions\.html'/);
});
test('StreetVerse gameplay dock includes direct mission button',()=>{
 const dock=read('amm-omniverse/src/components/StreetVerseCoreGameplayDock.tsx');
 assert.match(dock,/aria-label="Play Warehouse Delivery Mission"/);
 assert.match(dock,/window\.location\.href='\/warehouse-missions\.html'/);
});
test('mission page has large buttons and meaningful checkpoints',()=>{
 const html=read('public/warehouse-missions.html'),ui=read('public/warehouse-mission-ui.mjs');
 assert.match(html,/min-height:60px/);
 assert.match(html,/aria-live="polite"/);
 assert.match(ui,/readWarehouseMission\(localStorage\)/);
 assert.match(ui,/tryamm:streetverse-mission-complete/);
 assert.match(html,/Simulation only/);
});
