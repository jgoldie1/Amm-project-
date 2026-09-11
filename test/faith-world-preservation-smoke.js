'use strict';
const assert=require('assert');
const fs=require('fs');
const contract=require('../config/faith-world-preservation.json');
const main=fs.readFileSync('amm-omniverse/src/main.tsx','utf8');
const launch=fs.readFileSync('amm-omniverse/src/components/GlobalLaunchBar.tsx','utf8');
const bible=fs.readFileSync('amm-omniverse/src/components/EthiopianBibleMetaverse.tsx','utf8');
const press=fs.readFileSync('amm-omniverse/src/components/KingdomsPressOperations.tsx','utf8');
assert.strictEqual(contract.policy,'do-not-bury-core-faith-products');
for(const route of ['/ethiopian-bible','/kingdoms-press']){assert(main.includes(route),`Missing route ${route}`);assert(launch.includes(route),`Missing launch-bar route ${route}`)}
for(const token of ['TRYAMM 88-BOOK CURRICULUM','METAVERSE BIBLE','AUDIO + READ ALOUD','HEBREW SCHOOL','Content integrity gate']) assert(bible.includes(token),`Bible experience missing ${token}`);
for(const token of ['Kingdoms Press Operations','Editorial','Rights','Print Works','HoloBook']) assert(press.includes(token),`Kingdoms Press missing ${token}`);
console.log('Faith-world preservation, visibility, 88-book curriculum and Kingdoms Press checks passed');
