import { useEffect, useMemo, useState } from 'react';
import { getAccessToken } from '../services/supabaseClient';
import {
  getSessionUser,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
  type AuthUser,
} from '../game/auth/googleAuth';

const lanes = ['FOR YOU','LOCAL','BLACK BUSINESS','DISABILITY-OWNED','CREATOR GOODS','SUPPLIER EXCHANGE','COMMUNITY CIRCULATION','NEW BUSINESSES'];

const demoProducts = [
  { id:'loop-tee', name:'Chicago StreetVerse Tee', seller:'Loop Courier', price:'$28', delivery:'Pickup / Holo Package', tags:['CREATOR GOODS','LOCAL','COMMUNITY CIRCULATION'] },
  { id:'loop-bag', name:'Creator Transit Bag', seller:'Loop Courier', price:'$42', delivery:'Pickup / Holo Package', tags:['CREATOR GOODS','LOCAL'] },
  { id:'river-kit', name:'Creator Reel Kit', seller:'Riverwalk Creator', price:'$35', delivery:'Pickup / Holo Package', tags:['CREATOR GOODS','LOCAL'] },
  { id:'park-print', name:'Chicago World Art Print', seller:'Millennium Event', price:'$24', delivery:'Pickup / Holo Package', tags:['CREATOR GOODS','LOCAL','COMMUNITY CIRCULATION'] },
  { id:'south-meal', name:'South Side Meal Pack', seller:'South Market', price:'$18', delivery:'Pickup', tags:['BLACK BUSINESS','LOCAL','COMMUNITY CIRCULATION'] },
  { id:'west-maker', name:'Maker Starter Pack', seller:'West Maker', price:'$39', delivery:'Pickup / Holo Package', tags:['SUPPLIER EXCHANGE','NEW BUSINESSES'] },
  { id:'north-merch', name:'North Side Creator Merch', seller:'North Night', price:'$32', delivery:'Pickup / Holo Package', tags:['CREATOR GOODS','LOCAL'] },
];

type CheckoutState = {
  state: string;
  message: string;
  readiness?: Record<string, boolean>;
};

export default function HoloMarketplaceCenter({ onClose }: { onClose: () => void }) {
  const [lane, setLane] = useState('FOR YOU');
  const [selected, setSelected] = useState<string | null>(null);
  const [coupon, setCoupon] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutState>({ state:'IDLE', message:'' });
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  const items = useMemo(() => lane === 'FOR YOU' ? demoProducts : demoProducts.filter(p => p.tags.includes(lane)), [lane]);
  const selectedProduct = useMemo(() => demoProducts.find(p => p.id === selected) || null, [selected]);

  useEffect(() => {
    getSessionUser().then(setUser).catch(() => setUser(null));
  }, []);

  async function refreshUser() {
    const next = await getSessionUser();
    setUser(next);
    return next;
  }

  async function handleEmailAuth(mode: 'signin' | 'signup') {
    setAuthBusy(true);
    setAuthMessage('');
    try {
      const result = mode === 'signup'
        ? await signUpWithEmail(authEmail, authPassword, authName)
        : await signInWithEmail(authEmail, authPassword);
      if (result.error) {
        setAuthMessage(result.error);
        return;
      }
      const sessionUser = await refreshUser();
      setAuthMessage(sessionUser
        ? `Signed in as ${sessionUser.email || sessionUser.name}.`
        : 'Account created. Check your email if confirmation is required, then sign in.');
    } catch (error) {
      setAuthMessage(String((error as Error)?.message || error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleGoogleAuth() {
    setAuthBusy(true);
    setAuthMessage('');
    try {
      const result = await signInWithGoogle();
      if (result.error) setAuthMessage(result.error);
    } catch (error) {
      setAuthMessage(String((error as Error)?.message || error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    setUser(null);
    setCheckout({state:'IDLE',message:''});
  }

  async function beginCheckout() {
    if (!selectedProduct || checkoutBusy) return;
    setCheckoutBusy(true);
    setCheckout({state:'STARTING',message:'Creating secure server checkout…'});
    try {
      const token = await getAccessToken();
      if (!token) {
        setCheckout({state:'SIGN_IN_REQUIRED',message:'Sign in with a real TRYAMM account before purchasing. Guest mode cannot create purchases.'});
        return;
      }

      const clientOrderId = `HOLO-${crypto.randomUUID()}`;
      const response = await fetch('/api/commerce/checkout', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${token}`,
        },
        body:JSON.stringify({
          lines:[{id:selectedProduct.id,qty:1}],
          fulfillment:'pickup',
          clientOrderId,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (response.ok && payload?.checkoutUrl) {
        setCheckout({state:String(payload.state || 'CHECKOUT_READY'),message:'Redirecting to Stripe Checkout…'});
        window.location.assign(String(payload.checkoutUrl));
        return;
      }

      if (payload?.state === 'PAYMENT_PROCESSING') {
        setCheckout({state:'PAYMENT_PROCESSING',message:String(payload.message || 'Payment is processing. Do not create a second charge.')});
        return;
      }

      if (payload?.state === 'PAYMENT_GATED') {
        setCheckout({
          state:'PAYMENT_GATED',
          message:String(payload.message || 'Live charging is still gated.'),
          readiness:payload.readiness || {},
        });
        return;
      }

      setCheckout({
        state:String(payload?.state || 'CHECKOUT_ERROR'),
        message:String(payload?.message || payload?.error || `Checkout failed with status ${response.status}.`),
      });
    } catch (error) {
      setCheckout({state:'CHECKOUT_ERROR',message:String((error as Error)?.message || error)});
    } finally {
      setCheckoutBusy(false);
    }
  }

  const missingGates = checkout.readiness
    ? Object.entries(checkout.readiness).filter(([,ok]) => ok === false).map(([name]) => name)
    : [];

  return <div role="dialog" aria-label="Holo Marketplace" style={{position:'fixed',inset:0,zIndex:10040,background:'radial-gradient(circle at 50% 15%,#0a3042 0,#07101a 28%,#02040a 70%)',color:'#fff',overflow:'auto',padding:18}}>
    <div style={{maxWidth:1180,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <div><div style={{color:'#4fe3ff',fontSize:11,letterSpacing:3,fontWeight:900}}>TRYAMM • HOLO COMMERCE</div><h1 style={{margin:'4px 0 0',fontSize:30}}>Holo Marketplace</h1><div style={{color:'#9fc6d6',fontSize:13}}>Shop, sell, book, source and track delivery in one spatial commerce hub.</div></div>
        <button onClick={onClose} aria-label="Close Holo Marketplace" style={{width:42,height:42,borderRadius:'50%',border:'1px solid #4fe3ff66',background:'#0b1722',color:'#fff',fontSize:22}}>×</button>
      </div>

      <section style={{marginTop:16,border:'1px solid #20394a',borderRadius:18,padding:15,background:'#071019dd'}}>
        {user ? <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <div><strong>Signed in:</strong> <span style={{color:'#4fe3ff'}}>{user.email || user.name}</span><div style={{fontSize:10,color:'#7f9dab'}}>Real purchases use your Supabase session. Guest accounts cannot buy.</div></div>
          <button onClick={handleSignOut} style={{borderRadius:12,border:'1px solid #4fe3ff77',background:'#0c2935',color:'#fff',padding:'9px 13px'}}>SIGN OUT</button>
        </div> : <div>
          <h2 style={{fontSize:15,marginTop:0}}>Sign in to purchase</h2>
          <p style={{fontSize:11,color:'#9fc6d6'}}>Checkout requires a real Supabase-authenticated TRYAMM account. Stripe is not reconnected from this screen.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8}}>
            <input value={authName} onChange={e=>setAuthName(e.target.value)} placeholder="Name (for sign up)" aria-label="Name" style={{minHeight:42,borderRadius:12,border:'1px solid #365365',background:'#03080d',color:'#fff',padding:'0 12px'}}/>
            <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="Email" aria-label="Email" inputMode="email" style={{minHeight:42,borderRadius:12,border:'1px solid #365365',background:'#03080d',color:'#fff',padding:'0 12px'}}/>
            <input value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder="Password" aria-label="Password" type="password" style={{minHeight:42,borderRadius:12,border:'1px solid #365365',background:'#03080d',color:'#fff',padding:'0 12px'}}/>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}>
            <button disabled={authBusy || !authEmail || !authPassword} onClick={()=>handleEmailAuth('signin')} style={{borderRadius:12,border:'1px solid #4fe3ff77',background:'#0c2935',color:'#fff',padding:'10px 14px',fontWeight:900}}>EMAIL SIGN IN</button>
            <button disabled={authBusy || !authEmail || !authPassword} onClick={()=>handleEmailAuth('signup')} style={{borderRadius:12,border:'1px solid #e8b94477',background:'#251f0e',color:'#e8b944',padding:'10px 14px',fontWeight:900}}>CREATE ACCOUNT</button>
            <button disabled={authBusy} onClick={handleGoogleAuth} style={{borderRadius:12,border:'1px solid #7e8fff77',background:'#11162b',color:'#dfe4ff',padding:'10px 14px',fontWeight:900}}>GOOGLE SIGN IN</button>
          </div>
          {authMessage && <div role="status" style={{marginTop:8,fontSize:11,color:'#e8b944'}}>{authMessage}</div>}
        </div>}
      </section>

      <div style={{marginTop:18,display:'flex',gap:8,overflowX:'auto',paddingBottom:6}}>{lanes.map(x=><button key={x} onClick={()=>setLane(x)} style={{whiteSpace:'nowrap',border:`1px solid ${lane===x?'#4fe3ff':'#274253'}`,background:lane===x?'linear-gradient(135deg,#0c2f3c,#11283d)':'#07111a',color:lane===x?'#fff':'#8fb1bf',borderRadius:999,padding:'9px 13px',fontSize:10,fontWeight:900}}>{x}</button>)}</div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginTop:18}}>{items.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} style={{textAlign:'left',minHeight:230,border:'1px solid #2c7188',borderRadius:20,padding:16,background:'linear-gradient(160deg,rgba(20,55,75,.82),rgba(5,12,20,.94))',color:'#fff',boxShadow:'0 0 32px rgba(79,227,255,.12), inset 0 0 24px rgba(79,227,255,.06)',transform:selected===p.id?'translateY(-4px) scale(1.01)':'none',transition:'transform .2s ease'}}>
        <div aria-hidden="true" style={{height:100,borderRadius:16,background:'radial-gradient(circle,#4fe3ff55,#0f2230 45%,#061019 70%)',display:'grid',placeItems:'center',fontSize:42}}>◈</div>
        <div style={{marginTop:12,fontWeight:950,fontSize:16}}>{p.name}</div><div style={{color:'#8fb1bf',fontSize:11}}>{p.seller}</div><div style={{display:'flex',justifyContent:'space-between',alignItems:'end',marginTop:14}}><strong style={{color:'#e8b944',fontSize:20}}>{p.price}</strong><span style={{fontSize:9,color:'#66e8ff'}}>{p.delivery}</span></div>
      </button>)}</div>

      {selectedProduct && <section style={{marginTop:18,border:'1px solid #2c7188',borderRadius:18,padding:16,background:'#071019ee'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'center',flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:10,color:'#66e8ff',fontWeight:900}}>SELECTED FOR SECURE CHECKOUT</div>
            <h2 style={{margin:'4px 0'}}>{selectedProduct.name}</h2>
            <div style={{color:'#9fc6d6',fontSize:11}}>Displayed price: {selectedProduct.price}. The server catalog—not the browser—sets the charge amount.</div>
          </div>
          <button disabled={checkoutBusy} onClick={beginCheckout} style={{borderRadius:14,border:'1px solid #e8b944',background:'#251f0e',color:'#e8b944',padding:'12px 18px',fontWeight:950,fontSize:13}}>
            {checkoutBusy ? 'STARTING…' : 'BUY WITH STRIPE'}
          </button>
        </div>
        {checkout.message && <div role="status" style={{marginTop:10,padding:10,borderRadius:10,background:'#03080d',fontSize:11,color:checkout.state==='CHECKOUT_ERROR'?'#ff8e8e':'#b5d0da'}}>
          <strong>{checkout.state}</strong> — {checkout.message}
          {missingGates.length > 0 && <div style={{marginTop:6,color:'#e8b944'}}>Remaining gates: {missingGates.join(', ')}</div>}
        </div>}
      </section>}

      <div style={{marginTop:18,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12}}>
        <section style={{border:'1px solid #20394a',borderRadius:18,padding:15,background:'#071019dd'}}><h2 style={{fontSize:15,marginTop:0}}>Holo Coupon</h2><div style={{display:'flex',gap:8}}><input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Enter code" aria-label="Holo coupon code" style={{flex:1,minHeight:42,borderRadius:12,border:'1px solid #365365',background:'#03080d',color:'#fff',padding:'0 12px'}}/><button style={{borderRadius:12,border:'1px solid #4fe3ff77',background:'#0c2935',color:'#fff',padding:'0 14px'}}>APPLY</button></div><p style={{fontSize:10,color:'#7f9dab'}}>Coupons can be merchant, sponsor, delivery or community-circulation promotions. Server validation controls real redemption.</p></section>
        <section style={{border:'1px solid #20394a',borderRadius:18,padding:15,background:'#071019dd'}}><h2 style={{fontSize:15,marginTop:0}}>JARVIS Shopping Copilot</h2><p style={{fontSize:12,color:'#b5d0da'}}>Ask Stubbs AI/HoloGPT to compare products, find participating local suppliers, prepare a group order or locate an accessible service. JARVIS cannot purchase without the required approval.</p><button style={{borderRadius:12,border:'1px solid #e8b94477',background:'#251f0e',color:'#e8b944',padding:'10px 14px',fontWeight:900}}>ASK JARVIS</button></section>
        <section style={{border:'1px solid #20394a',borderRadius:18,padding:15,background:'#071019dd'}}><h2 style={{fontSize:15,marginTop:0}}>Track Marketplace Delivery</h2><p style={{fontSize:12,color:'#b5d0da'}}>Physical marketplace orders can hand off to Holo Package Delivery for courier assignment, ETA, arrival, signature/photo proof, and return/refund flows.</p><button onClick={()=>{(window as any).__showHoloDelivery?.();}} style={{borderRadius:12,border:'1px solid #4fe3ff77',background:'#0c2935',color:'#fff',padding:'10px 14px',fontWeight:900}}>OPEN DELIVERY</button></section>
      </div>
    </div>
  </div>;
}
