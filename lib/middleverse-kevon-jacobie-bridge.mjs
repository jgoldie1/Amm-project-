// Kevon + Jacobie education bridge; no network, orders, or brokerage execution.
const APPS=Object.freeze({
 kevon:Object.freeze({id:'kevon',name:'Kevon Forex & Stock AI',focus:'Forex, equities, market research, paper trades',markets:['EUR/USD','GBP/USD','SPY','AAPL','NVDA'],mode:'education-paper',verifiedLive:false}),
 jacobie:Object.freeze({id:'jacobie',name:'Jacobie Visions DRIP Lab',focus:'Dividend reinvestment, cash comparison and downside scenarios',markets:['SPY'],mode:'education-paper',verifiedLive:false})
});
const LESSONS=Object.freeze([
 {id:'basics',title:'What is an exchange, a stock, an ETF, and a currency pair?',category:'foundations'},
 {id:'forex',title:'FX quotes, pips, conversion fees and leverage',category:'kevon'},
 {id:'sp500',title:'S&P 500 index versus SPY ETF; trading hours and volatility',category:'kevon'},
 {id:'risk',title:'Stop loss, simulated position sizing and maximum loss',category:'kevon'},
 {id:'drip',title:'Dividends and compound returns with DRIP',category:'jacobie'},
 {id:'journal',title:'Paper-trade review and written trading journal',category:'practice'}
]);
export function appCatalog(){return Object.values(APPS);}
export function learningPlan(){return LESSONS.map((x,i)=>({...x,order:i+1}));}
export function simulateDrip({startingMinor,priceMinor,dividendPerShareMinor,periods=1}){
 for(const [name,value] of Object.entries({startingMinor,priceMinor,dividendPerShareMinor,periods})){
  if(!Number.isSafeInteger(value)||value<0)throw new RangeError(name);
 }
 if(!priceMinor||periods>120)throw new RangeError('invalid period or price');
 let shares=startingMinor/priceMinor;const history=[];
 for(let i=1;i<=periods;i++){
  const distributionMinor=shares*dividendPerShareMinor;
  shares+=distributionMinor/priceMinor;
  history.push({period:i,shares,portfolioMinor:Math.round(shares*priceMinor),hypotheticalDividendMinor:Math.round(distributionMinor)});
 }
 return {mode:'paper',assumesFixedPrice:true,history,brokerOrderPlaced:false};
}
export function validatePaperJournal(entry){
 if(!entry||typeof entry!=='object')throw new TypeError('journal entry required');
 if(!['kevon','jacobie'].includes(entry.appId))throw new RangeError('invalid app');
 if(typeof entry.instrument!=='string'||!/^[A-Za-z0-9/.-]{1,20}$/.test(entry.instrument))throw new RangeError('instrument');
 if(typeof entry.thesis!=='string'||entry.thesis.trim().length<10)throw new RangeError('written reasoning required');
 if(entry.realMoney===true||entry.submitOrder===true)throw new Error('No live orders supported');
 return {appId:entry.appId,instrument:entry.instrument,thesis:entry.thesis.trim().slice(0,1000),mode:'paper',approval:'simulation-only'};
}
export function bridgeStatus(){return {sharedReadOnlyLearning:true,authenticatedUserSync:false,externalAppSourceVerified:false,liveBrokerConnected:false,productionDatabaseConnected:false};}
