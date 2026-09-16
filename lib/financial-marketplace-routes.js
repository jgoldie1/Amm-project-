'use strict';

const FINANCIAL_TRUTH_KPIS = [
  'gmv','tryammRevenue','orders','suppliers','rfqs','openPurchaseOrders',
  'inventoryValue','shipmentsInTransit','customsHolds','warehouseStock','liveSales',
  'sellerPayableBalance','refunds','supplierRisk','grossMargin','countries','tradeCorridors'
];

function nonNegativeNumber(value){
  const number=Number(value||0);
  return Number.isFinite(number)&&number>0?number:0;
}

module.exports=function registerFinancialMarketplaceRoutes({app,getStore}){
  app.get('/api/financial-truth/health',(_req,res)=>{
    res.json({
      ok:true,
      service:'TRYAMM Financial Truth',
      authority:'server',
      movesRealMoney:false,
      issuesRealOwnership:false,
      settlementRequired:true,
      providerSettlementRequired:true,
      kpis:FINANCIAL_TRUTH_KPIS,
      time:new Date().toISOString()
    });
  });

  app.get('/api/financial-truth',(_req,res)=>{
    const store=getStore();
    const purchases=Array.isArray(store.purchases)?store.purchases:[];
    const recorded=purchases.filter(item=>item&&item.status==='recorded');
    const gmv=recorded.reduce((sum,item)=>sum+nonNegativeNumber(item.amountCents),0);
    const tryammRevenue=recorded.reduce((sum,item)=>sum+nonNegativeNumber(item.platformFeeCents),0);
    const sellerPayableBalance=recorded.reduce((sum,item)=>sum+nonNegativeNumber(item.creatorCents),0);
    res.json({
      ok:true,
      authority:'server',
      currency:'USD',
      unit:'minor',
      synthetic:false,
      settlementRequired:true,
      providerSettlementRequired:true,
      kpis:{
        gmv,
        tryammRevenue,
        orders:recorded.length,
        suppliers:0,
        rfqs:0,
        openPurchaseOrders:0,
        inventoryValue:0,
        shipmentsInTransit:0,
        customsHolds:0,
        warehouseStock:0,
        liveSales:recorded.filter(item=>item.kind==='gift').length,
        sellerPayableBalance,
        refunds:0,
        supplierRisk:0,
        grossMargin:0,
        countries:0,
        tradeCorridors:0
      },
      time:new Date().toISOString()
    });
  });

  app.get('/api/marketplace/products',(_req,res)=>{
    const store=getStore();
    const products=Array.isArray(store.marketplaceProducts)?store.marketplaceProducts:[];
    res.json({
      ok:true,
      authority:'server',
      inventoryAuthoritative:true,
      clientMayMutateInventory:false,
      count:products.length,
      products:products.map(product=>({
        id:String(product.id||''),
        name:String(product.name||''),
        description:String(product.description||''),
        priceCents:nonNegativeNumber(product.priceCents),
        currency:String(product.currency||'usd').toLowerCase(),
        status:String(product.status||'draft')
      }))
    });
  });
};
