(()=>{
  const host=document.querySelector('.hero');if(!host)return
  const style=document.createElement('style');style.textContent=`
  .startdeal{margin-top:16px;padding:18px;border:1px solid #6d8cff;border-radius:18px;background:linear-gradient(180deg,#111b42d9,#07131cd9)}
  .startdeal h2{margin:0 0 6px;color:#dce4ff}.startdeal p{margin:0 0 12px;color:#ccd7ff;font-size:13px;line-height:1.45}
  .startdeal-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.startdeal label{font-size:11px;color:#c8d2ff}
  .startdeal input,.startdeal select,.startdeal textarea{width:100%;min-height:44px;margin-top:4px;border-radius:10px;border:1px solid #536cb5;background:#071129;color:#fff;padding:9px;font:600 13px/1.3 system-ui}
  .startdeal textarea{min-height:90px;resize:vertical}.startdeal .wide{grid-column:1/-1}.startdeal .check{display:flex;gap:8px;align-items:flex-start;color:#dce4ff}.startdeal .check input{width:20px;min-height:20px;margin:0}
  .startdeal button{min-height:48px;border-radius:12px;border:1px solid #a9b8ff;background:#263f9c;color:#fff;font-weight:950;padding:0 16px}.startdeal button:disabled{opacity:.55}
  .startdeal-status{margin-top:10px;padding:10px;border-radius:10px;background:#07162e;border:1px solid #435aa2;color:#dce4ff;font:800 11px/1.35 system-ui}
  .startdeal .hp{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important}
  `;document.head.appendChild(style)
  const wrap=document.createElement('section');wrap.className='startdeal';wrap.id='start-a-deal';wrap.innerHTML=`
    <h2>START A DEAL</h2>
    <p>Join the TRYAMM Global Trade pipeline for sourcing, selling, fulfillment, logistics or supplier partnerships. Submitting this form does not create a contract, payment obligation or guaranteed supplier/carrier relationship.</p>
    <form id="tryammDealIntake">
      <div class="startdeal-grid">
        <label>Your role<select name="role" required><option value="">Choose</option><option value="buyer">Buyer</option><option value="brand">Brand / Merchant</option><option value="creator">Creator / Seller</option><option value="supplier">Supplier / Manufacturer</option><option value="warehouse_3pl">Warehouse / 3PL</option><option value="carrier_logistics">Carrier / Logistics</option><option value="investor_partner">Strategic / Capital Partner</option><option value="other">Other</option></select></label>
        <label>Company / brand<input name="companyName" maxlength="160" required /></label>
        <label>Contact name<input name="contactName" maxlength="120" required /></label>
        <label>Business email<input type="email" name="email" maxlength="254" required /></label>
        <label>Phone<input name="phone" maxlength="64" inputmode="tel" /></label>
        <label>Country code<input name="countryCode" maxlength="8" placeholder="US" /></label>
        <label>Website<input name="website" maxlength="240" placeholder="https://" /></label>
        <label>Deal type<select name="dealType"><option value="sourcing">Sourcing</option><option value="sell_dtc">Sell DTC</option><option value="live_commerce">LIVE commerce</option><option value="auction">Auction / bidding</option><option value="fulfillment">Fulfillment / virtual warehouse</option><option value="cold_chain">Holo Fridge / cold chain</option><option value="logistics">Freight / logistics</option><option value="supplier_network">Supplier network</option><option value="general">General partnership</option></select></label>
        <label>Estimated monthly volume ($)<input name="estimatedMonthlyVolume" inputmode="decimal" /></label>
        <label>Target MOQ<input name="targetMoq" inputmode="decimal" /></label>
        <label class="wide">Product / service<input name="productOrService" maxlength="600" placeholder="What are you sourcing, selling, shipping or offering?" /></label>
        <label class="wide">What do you need?<textarea name="message" maxlength="2400" placeholder="Tell us the product, quantity, destination, target price, timeline, fulfillment or partnership need."></textarea></label>
        <label class="check"><input type="checkbox" name="ndaRequested" />Request an NDA/NNN sourcing conversation before detailed supplier information is exchanged.</label>
        <label class="check"><input type="checkbox" name="lowMoqRequested" />I am interested in low-MOQ / small-batch sourcing.</label>
        <label class="check wide"><input type="checkbox" name="consentToBusinessContact" required />I agree TRYAMM may contact me about this business request. This is not consent to unrelated marketing.</label>
        <label class="hp" aria-hidden="true">Confirm website<input name="website_confirm" tabindex="-1" autocomplete="off" /></label>
      </div>
      <p style="margin-top:12px"><button type="submit">SUBMIT TO TRYAMM DEAL DESK</button></p>
      <div class="startdeal-status" id="tryammDealStatus" aria-live="polite">Your request will enter the private founder review pipeline.</div>
    </form>`
  host.insertAdjacentElement('afterend',wrap)
  const form=wrap.querySelector('form'),status=wrap.querySelector('#tryammDealStatus'),button=form.querySelector('button[type="submit"]')
  form.addEventListener('submit',async event=>{
    event.preventDefault();button.disabled=true;status.textContent='Submitting your request…'
    const fd=new FormData(form),payload={};for(const [k,v] of fd.entries())payload[k]=v
    payload.consentToBusinessContact=fd.has('consentToBusinessContact');payload.ndaRequested=fd.has('ndaRequested');payload.lowMoqRequested=fd.has('lowMoqRequested')
    try{
      const res=await fetch('/api/trade/intake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}),data=await res.json().catch(()=>({}))
      if(!res.ok)throw new Error(data?.error||data?.message||'Unable to submit request')
      status.textContent=`Received. Deal Desk reference: ${data.intakeId||'saved'}. TRYAMM will review the request before any quote, supplier introduction or payment step.`
      form.reset()
    }catch(error){status.textContent=`Not saved: ${String(error?.message||error)}.`}
    finally{button.disabled=false}
  })
})()
