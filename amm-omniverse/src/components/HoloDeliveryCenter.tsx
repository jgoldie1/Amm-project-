import { useMemo, useState } from 'react';
import { buildTrackingView, evaluateHoloCoupon, type DeliveryTrackingEvent, type HoloCoupon } from '../holoDelivery/holoDeliveryCore';
import { createTrackingCode, type PackageDeliveryRequest } from '../holoDelivery/packageDelivery';

type Mode = 'food' | 'package' | 'tracking' | 'problem';

const demoEvents: DeliveryTrackingEvent[] = [
  { id:'1', orderId:'HOLO-ORDER-1', state:'confirmed', occurredAt:new Date(Date.now()-24*60_000).toISOString(), publicMessage:'Order confirmed', source:'system' },
  { id:'2', orderId:'HOLO-ORDER-1', state:'preparing', occurredAt:new Date(Date.now()-16*60_000).toISOString(), publicMessage:'Merchant is preparing your order', source:'merchant', etaMinutes:22 },
  { id:'3', orderId:'HOLO-ORDER-1', state:'courier_assigned', occurredAt:new Date(Date.now()-10*60_000).toISOString(), publicMessage:'Courier assigned', source:'system', etaMinutes:16 },
  { id:'4', orderId:'HOLO-ORDER-1', state:'in_transit', occurredAt:new Date(Date.now()-4*60_000).toISOString(), publicMessage:'Your delivery is on the way', source:'courier', etaMinutes:8, location:{lat:41.8781,lng:-87.6298} },
];

const demoCoupon: HoloCoupon = {
  id:'community-10', code:'HOLO10', title:'Community Spotlight $10 Off', kind:'fixed', value:1000,
  active:true, communityCirculationEligible:true,
};

export default function HoloDeliveryCenter({ onClose }: { onClose?: () => void }) {
  const [mode, setMode] = useState<Mode>('food');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [packageRequest, setPackageRequest] = useState<Partial<PackageDeliveryRequest>>({ serviceLevel:'same_day', size:'small', allowedModes:['car','bike','third_party'] });
  const tracking = useMemo(() => buildTrackingView('HOLO-ORDER-1', demoEvents), []);

  function applyCoupon() {
    if (couponCode.trim().toUpperCase() !== demoCoupon.code) return setCouponMessage('Coupon not found or not available for this order.');
    const result = evaluateHoloCoupon({ coupon:demoCoupon, merchantId:'merchant-demo', subtotalMinor:3200, deliveryFeeMinor:499 });
    setCouponMessage(result.valid ? `Applied: $${(result.discountMinor/100).toFixed(2)} saved.` : result.reason);
  }

  function createPackage() {
    if (!packageRequest.pickupAddress || !packageRequest.dropoffAddress || !packageRequest.recipientName) {
      return alert('Add pickup, destination and recipient first.');
    }
    alert(`Package delivery created in demo mode. Tracking: ${createTrackingCode()}`);
  }

  const tab = (id:Mode,label:string) => <button onClick={()=>setMode(id)} aria-pressed={mode===id} style={{padding:'10px 12px',borderRadius:12,border:'1px solid #274053',background:mode===id?'#123449':'#09131f',color:mode===id?'#4fe3ff':'#cbd5e1',fontWeight:900,cursor:'pointer'}}>{label}</button>;

  return <div role="dialog" aria-label="Holo Delivery Center" style={{position:'fixed',inset:0,zIndex:10100,background:'radial-gradient(circle at top,#0d2635,#030611 55%)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <div style={{maxWidth:980,margin:'0 auto',padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <div><div style={{color:'#4fe3ff',fontSize:11,fontWeight:900,letterSpacing:3}}>TRYAMM</div><h1 style={{margin:'4px 0'}}>Holo Delivery</h1><div style={{color:'#94a3b8'}}>Food • packages • coupons • live arrival tracking</div></div>
        <button onClick={onClose} aria-label="Close Holo Delivery" style={{width:42,height:42,borderRadius:'50%',background:'#0b1722',border:'1px solid #334155',color:'#fff',fontSize:22}}>×</button>
      </div>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'18px 0'}}>{tab('food','🍽 FOOD')}{tab('package','📦 PACKAGE')}{tab('tracking','📍 TRACK')}{tab('problem','🛟 HELP')}</div>

      {mode==='food' && <section style={card}>
        <h2>Holo Menu & Checkout</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12}}>
          {['Kingdom Kitchen','Community Café','Soul Ascension Eats'].map((name,i)=><article key={name} style={subcard}><div style={{fontSize:34}}>{['🥘','🍔','🥗'][i]}</div><h3>{name}</h3><div style={{color:'#94a3b8'}}>25–35 min • participating merchant</div><button style={primary}>View holographic menu</button></article>)}
        </div>
        <div style={{marginTop:16,padding:14,border:'1px solid #26384a',borderRadius:16}}><b>Cart summary</b><div style={{marginTop:8}}>Subtotal $32.00 • Delivery $4.99 • Total $36.99</div><div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}><input aria-label="Holo coupon code" value={couponCode} onChange={e=>setCouponCode(e.target.value)} placeholder="HOLO COUPON" style={input}/><button onClick={applyCoupon} style={primary}>Apply</button></div>{couponMessage&&<div aria-live="polite" style={{marginTop:8,color:'#78ffb4'}}>{couponMessage}</div>}<button style={{...primary,marginTop:12,width:'100%'}}>Continue to Jin Pay sandbox</button></div>
      </section>}

      {mode==='package' && <section style={card}>
        <h2>Send a package</h2><p style={{color:'#94a3b8'}}>Same-hour, same-day or scheduled courier delivery. Real providers remain feature-gated.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
          <input placeholder="Pickup address" aria-label="Pickup address" style={input} onChange={e=>setPackageRequest(v=>({...v,pickupAddress:e.target.value}))}/>
          <input placeholder="Delivery address" aria-label="Delivery address" style={input} onChange={e=>setPackageRequest(v=>({...v,dropoffAddress:e.target.value}))}/>
          <input placeholder="Recipient name" aria-label="Recipient name" style={input} onChange={e=>setPackageRequest(v=>({...v,recipientName:e.target.value}))}/>
          <select aria-label="Package size" style={input} value={packageRequest.size} onChange={e=>setPackageRequest(v=>({...v,size:e.target.value as PackageDeliveryRequest['size']}))}><option value="document">Document</option><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option><option value="oversize">Oversize</option></select>
          <select aria-label="Service level" style={input} value={packageRequest.serviceLevel} onChange={e=>setPackageRequest(v=>({...v,serviceLevel:e.target.value as PackageDeliveryRequest['serviceLevel']}))}><option value="same_hour">Same hour</option><option value="same_day">Same day</option><option value="scheduled">Scheduled</option><option value="standard">Standard</option></select>
        </div>
        <label style={{display:'block',marginTop:12}}><input type="checkbox" onChange={e=>setPackageRequest(v=>({...v,signatureRequired:e.target.checked}))}/> Signature required</label>
        <label style={{display:'block',marginTop:8}}><input type="checkbox" onChange={e=>setPackageRequest(v=>({...v,photoProofRequired:e.target.checked}))}/> Photo proof required</label>
        <button onClick={createPackage} style={{...primary,marginTop:14}}>Create demo delivery & tracking code</button>
      </section>}

      {mode==='tracking' && <section style={card}>
        <h2>Track delivery arrival</h2>
        <div style={{display:'grid',gridTemplateColumns:'1.2fr .8fr',gap:14}}>
          <div style={{...subcard,minHeight:260,background:'linear-gradient(135deg,#0b2230,#111827)',position:'relative'}}><div style={{position:'absolute',inset:20,border:'1px dashed #4fe3ff55',borderRadius:18,display:'grid',placeItems:'center'}}><div style={{textAlign:'center'}}><div style={{fontSize:42}}>📍</div><b>Live map adapter</b><div style={{color:'#94a3b8',marginTop:6}}>Provider map plugs in here. Current demo ETA: {tracking.etaMinutes ?? '—'} min.</div></div></div></div>
          <div style={subcard}><h3>{tracking.statusLabel}</h3><div style={{fontSize:30,fontWeight:950,color:'#4fe3ff'}}>{tracking.etaMinutes ?? '—'} min</div><div style={{marginTop:14,color:'#94a3b8'}}>Courier: Demo Courier • Car</div><button style={{...primary,marginTop:12,width:'100%'}}>Delivery instructions</button></div>
        </div>
        <div style={{marginTop:14}}>{tracking.events.map(e=><div key={e.id} style={{display:'flex',gap:10,padding:'10px 0',borderBottom:'1px solid #172434'}}><span>●</span><div><b>{e.publicMessage}</b><div style={{fontSize:12,color:'#64748b'}}>{new Date(e.occurredAt).toLocaleTimeString()}</div></div></div>)}</div>
      </section>}

      {mode==='problem' && <section style={card}><h2>Delivery help</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:10}}>{['Missing item','Wrong order/package','Damaged','Not delivered','Unsafe handoff','Request refund/review'].map(x=><button key={x} style={subcard as any}>{x}</button>)}</div><p style={{color:'#94a3b8'}}>Problems create auditable support/dispute records. Refunds and money movement remain controlled by Jin Pay + Money Engine.</p></section>}
    </div>
  </div>;
}

const card: React.CSSProperties = {background:'#07101aee',border:'1px solid #203447',borderRadius:22,padding:18,boxShadow:'0 20px 70px #0007'};
const subcard: React.CSSProperties = {background:'#0b1520',border:'1px solid #1e3345',borderRadius:16,padding:14,color:'#fff'};
const primary: React.CSSProperties = {border:'1px solid #4fe3ff77',background:'linear-gradient(135deg,#0e5268,#123149)',color:'#fff',borderRadius:12,padding:'10px 14px',fontWeight:900,cursor:'pointer'};
const input: React.CSSProperties = {background:'#06111a',border:'1px solid #334155',color:'#fff',borderRadius:12,padding:'11px 12px',minHeight:44};
