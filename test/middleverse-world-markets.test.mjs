import test from 'node:test';import assert from 'node:assert/strict';import {calculateFxBusinessExposure,simulatePaperTrade,reviewPaperRisk,tradingPermission} from '../lib/middleverse-world-markets.mjs';
test('invoice FX budget includes buffer',()=>assert.equal(calculateFxBusinessExposure({invoiceMinor:10000,usdPerUnit:1.1,quoteSource:'example',quoteAsOf:'sample'}).budgetUsdMinor,11220));
test('reject zero FX rate',()=>assert.throws(()=>calculateFxBusinessExposure({invoiceMinor:10000,usdPerUnit:0,quoteSource:'x',quoteAsOf:'sample'})));
test('paper long includes costs',()=>assert.equal(simulatePaperTrade({symbol:'SPY',side:'LONG',quantity:2,entryMinor:50000,exitMinor:51000,feeMinor:10,slippageMinor:20,marketDataAsOf:'sample'}).paperPnLMinor,1970));
test('paper short PnL',()=>assert.equal(simulatePaperTrade({symbol:'EUR/USD',side:'SHORT',quantity:1,entryMinor:11000,exitMinor:10900,marketDataAsOf:'sample'}).paperPnLMinor,100));
test('risk max blocks excessive exposure',()=>assert.equal(reviewPaperRisk({accountBalanceMinor:100000,riskBudgetBps:100,entryMinor:10000,stopMinor:9000,quantity:2}).withinBudget,false));
test('live broker disabled',()=>assert.equal(tradingPermission().liveTradingEnabled,false));
