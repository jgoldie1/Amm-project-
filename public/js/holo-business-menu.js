(function(){
  function mountHoloMenu(options={}){
    if(document.getElementById('tryammBusinessHoloMenu')) return;
    const button=document.createElement('button');
    button.id='tryammBusinessHoloMenu';
    button.type='button';
    button.textContent='HOLO MENU';
    button.setAttribute('aria-expanded','false');
    button.style.cssText='position:fixed;right:16px;bottom:18px;z-index:9998;padding:12px 16px;border-radius:999px;border:1px solid #4fe3ff;background:#0b1324;color:#fff';

    const panel=document.createElement('aside');
    panel.id='tryammBusinessHoloPanel';
    panel.hidden=true;
    panel.style.cssText='position:fixed;right:16px;bottom:78px;z-index:9997;width:min(92vw,390px);background:#07101f;color:#fff;border:1px solid #263d69;border-radius:18px;padding:16px';
    panel.innerHTML=`<h2>Holo Menu</h2><p>Browse menu items, products, services, pickup, delivery and active Holo Coupons.</p><div id="holoCouponArea">No active Holo Coupon.</div><div style="display:grid;gap:8px;margin-top:12px"><a href="/business-menu.html">Open Full Menu</a><a href="/delivery.html">Delivery</a><a href="/ride.html">Ride</a><a href="/hologram.html">Hologram Library</a></div>`;

    button.addEventListener('click',()=>{
      panel.hidden=!panel.hidden;
      button.setAttribute('aria-expanded',String(!panel.hidden));
    });

    document.body.append(panel,button);
    if(options.coupon) setHoloCoupon(options.coupon);
  }

  function setHoloCoupon(coupon={}){
    const area=document.getElementById('holoCouponArea');
    if(!area) return;
    const code=coupon.code||'HOLODEAL';
    const label=coupon.label||'Special Offer';
    const terms=coupon.terms||'Terms apply.';
    area.innerHTML=`<div style="border:1px dashed #ffd76e;border-radius:12px;padding:12px"><strong>${label}</strong><div>Code: ${code}</div><small>${terms}</small></div>`;
  }

  window.TryAmmBusinessHolo={mountHoloMenu,setHoloCoupon};
})();
