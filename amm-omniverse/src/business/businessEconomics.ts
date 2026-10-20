export type EconomicsInput={customers:number;price:number;variableCost:number;commissionPercent:number;refundPercent:number;fixedCost:number;ownerPay:number;cashAvailable:number}
export const ECONOMICS_EXAMPLE:EconomicsInput={customers:25,price:59,variableCost:20,commissionPercent:0,refundPercent:0,fixedCost:800,ownerPay:0,cashAvailable:0}
export function calculateEconomics(v:EconomicsInput){
 for(const n of Object.values(v))if(!Number.isFinite(n)||n<0||n>100000000)throw new Error('Enter finite, non-negative amounts within the stated limits.')
 if(!Number.isInteger(v.customers))throw new Error('Customer count must be a whole number.')
 if(v.commissionPercent>100||v.refundPercent>100)throw new Error('Percentages must be between 0 and 100.')
 const cents=(n:number)=>Math.round(n*100)
 const gross=v.customers*cents(v.price),refundAllowance=Math.round(gross*v.refundPercent/100)
 const netCollections=gross-refundAllowance,commissions=Math.round(netCollections*v.commissionPercent/100)
 const variable=v.customers*cents(v.variableCost),fixed=cents(v.fixedCost)+cents(v.ownerPay)
 const contribution=netCollections-commissions-variable,remainder=contribution-fixed
 const perCustomer=cents(v.price)*(1-v.refundPercent/100)*(1-v.commissionPercent/100)-cents(v.variableCost)
 const breakEven=perCustomer>0?Math.ceil(fixed/perCustomer):null
 return {gross:gross/100,refundAllowance:refundAllowance/100,commissions:commissions/100,variable:variable/100,fixed:fixed/100,contribution:contribution/100,remainder:remainder/100,perCustomer:perCustomer/100,breakEven,runwayMonths:remainder<0?cents(v.cashAvailable)/-remainder:null}
}
