'use strict';
const assert=require('assert');
const register=require('../lib/financial-marketplace-routes');

const routes=new Map();
const app={get(path,handler){routes.set(path,handler)}};
const store={
  purchases:[{status:'recorded',kind:'gift',amountCents:1000,platformFeeCents:250,creatorCents:750}],
  marketplaceProducts:[{id:'p1',name:'Test product',description:'fixture',priceCents:1200,currency:'USD',status:'active'}]
};
register({app,getStore:()=>store});

function invoke(path){
  let status=200,payload;
  routes.get(path)({}, {status(code){status=code;return this},json(body){payload=body;return this}});
  return {status,payload};
}

const health=invoke('/api/financial-truth/health');
assert.equal(health.status,200);
assert.equal(health.payload.ok,true);
assert.equal(health.payload.authority,'server');
assert.equal(health.payload.movesRealMoney,false);
assert.equal(health.payload.issuesRealOwnership,false);
assert.equal(health.payload.providerSettlementRequired,true);

const truth=invoke('/api/financial-truth');
assert.equal(truth.payload.kpis.gmv,1000);
assert.equal(truth.payload.kpis.tryammRevenue,250);
assert.equal(truth.payload.kpis.sellerPayableBalance,750);
assert.equal(truth.payload.settlementRequired,true);

const products=invoke('/api/marketplace/products');
assert.equal(products.payload.ok,true);
assert.equal(products.payload.inventoryAuthoritative,true);
assert.equal(products.payload.clientMayMutateInventory,false);
assert.equal(products.payload.count,1);
assert.equal(products.payload.products[0].priceCents,1200);

console.log('financial-marketplace-routes smoke: PASS');
