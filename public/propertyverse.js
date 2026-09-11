'use strict';
const $=selector=>document.querySelector(selector);
const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(value||0));
function calculate(){
  const purchase=Number($('#purchase').value||0),rehab=Number($('#rehab').value||0),carry=Number($('#carry').value||0),sale=Number($('#sale').value||0);
  const total=purchase+rehab+carry;
  const spread=sale-total;
  const margin=sale>0?spread/sale*100:0;
  $('#flipResult').innerHTML=`<span>Estimated project cost: <b>${money(total)}</b></span><strong>${money(spread)}</strong><span>Illustrative pre-tax spread • ${margin.toFixed(1)}% of estimated sale value</span><p>This is a planning simulation only. It excludes taxes, financing details, commissions, title/closing costs, permit surprises, market changes and other project risks unless you included them in “other costs.”</p>`;
}
$('#flipForm').addEventListener('submit',event=>{event.preventDefault();calculate()});
calculate();
