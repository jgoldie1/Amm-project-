// MiddleVerse World Markets: research and offline simulations only.
// No brokerage integration; no real FX conversion or investment advice.
function assertMoney(v,name){if(!Number.isSafeInteger(v)||v<0)throw new RangeError(name);return v}

function calculateFxBusinessExposure({invoiceMinor,usdPerUnit,feeBps=0,bufferBps=200,quoteAsOf,quoteSource}){
 assertMoney(invoiceMinor,"invoiceMinor");assertMoney(feeBps,"feeBps");assertMoney(bufferBps,"bufferBps");
 if(feeBps>10000||bufferBps>10000||typeof usdPerUnit!=="number"||!Number.isFinite(usdPerUnit)||usdPerUnit<=0||!quoteAsOf||!quoteSource)throw new Error("valid attributed rate required");
 const spotUsdMinor=Math.round(invoiceMinor*usdPerUnit);
 const feeUsdMinor=Math.ceil(spotUsdMinor*feeBps/10000);
 const bufferUsdMinor=Math.ceil(spotUsdMinor*bufferBps/10000);
 return {spotUsdMinor,feeUsdMinor,bufferUsdMinor,budgetUsdMinor:spotUsdMinor+feeUsdMinor+bufferUsdMinor,quoteAsOf,quoteSource,executable:false};
}

function simulatePaperTrade({symbol,side,quantity,entryMinor,exitMinor,feeMinor=0,slippageMinor=0,marketDataAsOf}){
 if(typeof symbol!=="string"||!/^[A-Z0-9./-]{1,20}$/.test(symbol))throw new Error("instrument invalid");
 if(!["LONG","SHORT"].includes(side))throw new Error("side invalid");
 for(const [name,v] of Object.entries({quantity,entryMinor,exitMinor,feeMinor,slippageMinor}))assertMoney(v,name);
 if(!quantity||!entryMinor||!exitMinor||!marketDataAsOf)throw new Error("missing valid paper trade fields");
 const movement=(exitMinor-entryMinor)*(side==="LONG"?1:-1)*quantity;
 const costs=feeMinor+slippageMinor;
 return {symbol,side,quantity,paperPnLMinor:movement-costs,costsMinor:costs,marketDataAsOf,simulation:true,orderRouted:false};
}

function reviewPaperRisk({accountBalanceMinor,riskBudgetBps,entryMinor,stopMinor,quantity,stopRequired=true}){
 for(const [name,v] of Object.entries({accountBalanceMinor,riskBudgetBps,entryMinor,stopMinor,quantity}))assertMoney(v,name);
 if(riskBudgetBps>10000||!entryMinor||!quantity||(stopRequired&&stopMinor===entryMinor))throw new Error("invalid risk parameters");
 const maxRiskMinor=Math.floor(accountBalanceMinor*riskBudgetBps/10000);
 const priceRiskMinor=Math.abs(entryMinor-stopMinor)*quantity;
 return {maxRiskMinor,priceRiskMinor,withinBudget:priceRiskMinor<=maxRiskMinor,simulatedOnly:true};
}

function tradingPermission(){return {liveTradingEnabled:false,companyOperatingCashEligible:false,reason:"Paper trading only: no broker order routing or customer funds."}}
export {calculateFxBusinessExposure,simulatePaperTrade,reviewPaperRisk,tradingPermission};
