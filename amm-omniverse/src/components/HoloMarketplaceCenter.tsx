import { useMemo, useState } from 'react';

const lanes = ['FOR YOU','LOCAL','BLACK BUSINESS','DISABILITY-OWNED','CREATOR GOODS','SUPPLIER EXCHANGE','COMMUNITY CIRCULATION','NEW BUSINESSES'];

const demoProducts = [
  { id:'p1', name:'Creator Hoodie', seller:'TRYAMM Creator Shop', price:'$49', delivery:'Holo Package', tags:['CREATOR GOODS','COMMUNITY CIRCULATION'] },
  { id:'p2', name:'Studio Session', seller:'Independent Studio', price:'$85', delivery:'Service booking', tags:['LOCAL','BLACK BUSINESS'] },
  { id:'p3', name:'Accessible Desk Setup', seller:'Adaptive Makers', price:'$129', delivery:'Holo Package', tags:['DISABILITY-OWNED','LOCAL'] },
  { id:'p4', name:'Supplier Packaging Pack', seller:'Community Packaging Co.', price:'$74', delivery:'Holo Package', tags:['SUPPLIER EXCHANGE','COMMUNITY CIRCULATION'] },
];

export default function HoloMarketplaceCenter({ onClose }: { onClose: () => void }) {
  const [lane, setLane] = useState('FOR YOU');
  const [selected, setSelected] = useState<string | null>(null);
  const [coupon, setCoupon] = useState('');
  const items = useMemo(() => lane === 'FOR YOU' ? demoProducts : demoProducts.filter(p => p.tags.includes(lane)), [lane]);
  return <div role="dialog" aria-label="Holo Marketplace" style={{position:'fixed',inset:0,zIndex:10040,background:'radial-gradient(circle at 50% 15%,#0a3042 0,#07101a 28%,#02040a 70%)',color:'#fff',overflow:'auto',padding:18}}>
    <div style={{maxWidth:1180,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <div><div style={{color:'#4fe3ff',fontSize:11,letterSpacing:3,fontWeight:900}}>TRYAMM • HOLO COMMERCE</div><h1 style={{margin:'4px 0 0',fontSize:30}}>Holo Marketplace</h1><div style={{color:'#9fc6d6',fontSize:13}}>Shop, sell, book, source and track delivery in one spatial commerce hub.</div></div>
        <button onClick={onClose} aria-label="Close Holo Marketplace" style={{width:42,height:42,borderRadius:'50%',border:'1px solid #4fe3ff66',background:'#0b1722',color:'#fff',fontSize:22}}>×</button>
      </div>

      <div style={{marginTop:18,display:'flex',gap:8,overflowX:'auto',paddingBottom:6}}>{lanes.map(x=><button key={x} onClick={()=>setLane(x)} style={{whiteSpace:'nowrap',border:`1px solid ${lane===x?'#4fe3ff':'#274253'}`,background:lane===x?'linear-gradient(135deg,#0c2f3c,#11283d)':'#07111a',color:lane===x?'#fff':'#8fb1bf',borderRadius:999,padding:'9px 13px',fontSize:10,fontWeight:900}}>{x}</button>)}</div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginTop:18}}>{items.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} style={{textAlign:'left',minHeight:230,border:'1px solid #2c7188',borderRadius:20,padding:16,background:'linear-gradient(160deg,rgba(20,55,75,.82),rgba(5,12,20,.94))',color:'#fff',boxShadow:'0 0 32px rgba(79,227,255,.12), inset 0 0 24px rgba(79,227,255,.06)',transform:selected===p.id?'translateY(-4px) scale(1.01)':'none',transition:'transform .2s ease'}}>
        <div aria-hidden="true" style={{height:100,borderRadius:16,background:'radial-gradient(circle,#4fe3ff55,#0f2230 45%,#061019 70%)',display:'grid',placeItems:'center',fontSize:42}}>◈</div>
        <div style={{marginTop:12,fontWeight:950,fontSize:16}}>{p.name}</div><div style={{color:'#8fb1bf',fontSize:11}}>{p.seller}</div><div style={{display:'flex',justifyContent:'space-between',alignItems:'end',marginTop:14}}><strong style={{color:'#e8b944',fontSize:20}}>{p.price}</strong><span style={{fontSize:9,color:'#66e8ff'}}>{p.delivery}</span></div>
      </button>)}</div>

      <div style={{marginTop:18,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12}}>
        <section style={{border:'1px solid #20394a',borderRadius:18,padding:15,background:'#071019dd'}}><h2 style={{fontSize:15,marginTop:0}}>Holo Coupon</h2><div style={{display:'flex',gap:8}}><input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Enter code" aria-label="Holo coupon code" style={{flex:1,minHeight:42,borderRadius:12,border:'1px solid #365365',background:'#03080d',color:'#fff',padding:'0 12px'}}/><button style={{borderRadius:12,border:'1px solid #4fe3ff77',background:'#0c2935',color:'#fff',padding:'0 14px'}}>APPLY</button></div><p style={{fontSize:10,color:'#7f9dab'}}>Coupons can be merchant, sponsor, delivery or community-circulation promotions. Server validation controls real redemption.</p></section>
        <section style={{border:'1px solid #20394a',borderRadius:18,padding:15,background:'#071019dd'}}><h2 style={{fontSize:15,marginTop:0}}>JARVIS Shopping Copilot</h2><p style={{fontSize:12,color:'#b5d0da'}}>Ask Stubbs AI/HoloGPT to compare products, find participating local suppliers, prepare a group order or locate an accessible service. JARVIS cannot purchase without the required approval.</p><button style={{borderRadius:12,border:'1px solid #e8b94477',background:'#251f0e',color:'#e8b944',padding:'10px 14px',fontWeight:900}}>ASK JARVIS</button></section>
        <section style={{border:'1px solid #20394a',borderRadius:18,padding:15,background:'#071019dd'}}><h2 style={{fontSize:15,marginTop:0}}>Track Marketplace Delivery</h2><p style={{fontSize:12,color:'#b5d0da'}}>Physical marketplace orders can hand off to Holo Package Delivery for courier assignment, ETA, arrival, signature/photo proof, and return/refund flows.</p><button onClick={()=>{(window as any).__showHoloDelivery?.();}} style={{borderRadius:12,border:'1px solid #4fe3ff77',background:'#0c2935',color:'#fff',padding:'10px 14px',fontWeight:900}}>OPEN DELIVERY</button></section>
      </div>
    </div>
  </div>;
}
