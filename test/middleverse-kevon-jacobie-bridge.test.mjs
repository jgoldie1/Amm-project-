import test from 'node:test';import assert from 'node:assert/strict';import {appCatalog,learningPlan,simulateDrip,validatePaperJournal,bridgeStatus} from '../lib/middleverse-kevon-jacobie-bridge.mjs';
test('both prior apps present',()=>assert.deepEqual(appCatalog().map(a=>a.id),['kevon','jacobie']));
test('planned lessons cover forex S&P and DRIP',()=>{const xs=learningPlan().map(l=>l.id);assert.ok(xs.includes('forex')&&xs.includes('sp500')&&xs.includes('drip'))});
test('DRIP simulation stays paper',()=>{const x=simulateDrip({startingMinor:100000,priceMinor:10000,dividendPerShareMinor:100,periods:2});assert.equal(x.history.length,2);assert.equal(x.brokerOrderPlaced,false);assert.ok(x.history[1].shares>x.history[0].shares)});
test('invalid DRIP input denied',()=>assert.throws(()=>simulateDrip({startingMinor:10000,priceMinor:0,dividendPerShareMinor:100})));
test('paper journal accepts thesis',()=>assert.equal(validatePaperJournal({appId:'kevon',instrument:'EUR/USD',thesis:'I am testing my support level hypothesis'}).mode,'paper'));
test('trading action rejected',()=>assert.throws(()=>validatePaperJournal({appId:'jacobie',instrument:'SPY',thesis:'Price remains above moving average',submitOrder:true})));
test('live integrations not claimed',()=>assert.equal(bridgeStatus().externalAppSourceVerified,false));
