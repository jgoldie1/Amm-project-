(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const VERSION='20260903-immersive-store-v2'
  let mounted=false
  const catalogs={
    yahavah:[
      {sku:'LOCAL-BEEF-BOX',name:'Local Grass-Fed Beef Box',emoji:'🥩',category:'beef',price:99,origin:'U.S. farm / ranch lane',ingredients:'100% beef',storage:'Keep refrigerated or frozen',cold:true},
      {sku:'LOCAL-EGGS-12',name:'Pasture-Raised Eggs',emoji:'🥚',category:'eggs',price:6.99,origin:'Local U.S. farm lane',ingredients:'Eggs',storage:'Keep refrigerated',cold:true},
      {sku:'CSA-PRODUCE-BOX',name:'Seasonal CSA Produce Box',emoji:'🥬',category:'produce',price:34.99,origin:'Local U.S. CSA lane',ingredients:'Seasonal produce assortment',storage:'Refrigerate perishables as needed',cold:true},
      {sku:'RICE-5LB',name:'Rice 5 lb',emoji:'🍚',category:'pantry',price:6.99,origin:'YAHAVAH Grocery supplier lane',ingredients:'Rice',storage:'Cool dry place',cold:false}
    ],
    bodega:[
      {sku:'BOD-WATER',name:'Spring Water',emoji:'💧',category:'beverage',price:1.99,origin:'Verified distributor lane',ingredients:'Water',storage:'Shelf stable',cold:false},
      {sku:'BOD-SNACK',name:'Neighborhood Snack Pack',emoji:'🥨',category:'snack',price:3.49,origin:'Local/distributor lane',ingredients:'See manufacturer label',storage:'Shelf stable',cold:false},
      {sku:'BOD-MILK',name:'Local Milk',emoji:'🥛',category:'dairy',price:4.99,origin:'Regional dairy lane',ingredients:'Milk',storage:'Keep refrigerated',cold:true}
    ],
    'mom-pop':[
      {sku:'MP-RICE',name:'Rice 5 lb',emoji:'🍚',category:'grocery',price:6.99,origin:'Distributor lane',ingredients:'Rice',storage:'Cool dry place',cold:false},
      {sku:'MP-HONEY',name:'Local Honey',emoji:'🍯',category:'honey',price:12.99,origin:'Local U.S. producer lane',ingredients:'Honey',storage:'Room temperature',cold:false},
      {sku:'MP-PRODUCE',name:'Local Produce Box',emoji:'🥬',category:'produce',price:29.99,origin:'Local farm/CSA lane',ingredients:'Seasonal produce',storage:'Refrigerate as needed',cold:true}
    ],
    butcher:[
      {sku:'BF-BEEF',name:'Local Beef Family Box',emoji:'🥩',category:'beef',price:119,origin:'U.S. ranch / inspected processor lane',ingredients:'Beef',storage:'Keep refrigerated or frozen',cold:true},
      {sku:'BF-CHICKEN',name:'Pasture-Raised Chicken Box',emoji:'🍗',category:'poultry',price:69,origin:'U.S. farm / inspected processor lane',ingredients:'Chicken',storage:'Keep refrigerated or frozen',cold:true},
      {sku:'BF-LAMB',name:'Local Lamb Box',emoji:'🍖',category:'lamb',price:109,origin:'U.S. farm / inspected processor lane',ingredients:'Lamb',storage:'Keep refrigerated or frozen',cold:true}
    ],
    beauty:[
      {sku:'BE-WIG',name:'Premium Synthetic Wig',emoji:'👩🏾‍🦱',category:'beauty',price:49.99,origin:'Verified beauty wholesaler lane',ingredients:'See manufacturer label',storage:'Dry storage',cold:false},
      {sku:'BE-BRAID',name:'Braiding Hair Pack',emoji:'🧶',category:'hair',price:6.99,origin:'Verified beauty wholesaler lane',ingredients:'Synthetic fiber',storage:'Dry storage',cold:false},
      {sku:'BE-LASH',name:'Lash Multipack',emoji:'👁️',category:'beauty',price:9.99,origin:'Verified beauty wholesaler lane',ingredients:'See manufacturer label',storage:'Dry storage',cold:false}
    ],
    telecom:[
      {sku:'HF-PHONE',name:'Holo Fon Device Lane',emoji:'📱',category:'phone',price:299,origin:'Provider/device catalog lane',ingredients:'Electronic device',storage:'Dry storage',cold:false},
      {sku:'HF-CASE',name:'Protective Phone Case',emoji:'🛡️',category:'accessory',price:19.99,origin:'Accessory supplier lane',ingredients:'See product materials',storage:'Dry storage',cold:false}
    ],
    default:[
      {sku:'GEN-001',name:'Store Product Demo',emoji:'📦',category:'general',price:19.99,origin:'Verified supplier lane',ingredients:'See product label',storage:'As labeled',cold:false},
      {sku:'GEN-002',name:'Local Creator Product',emoji:'✨',category:'creator',price:29.99,origin:'Creator/seller lane',ingredients:'See product label',storage:'As labeled',cold:false}
    ]
  }
  const state={store:{id:'yahavah',name:'YAHAVAH Grocery',icon:'🛒'},basket:[],held:null,verifiedProducts:{}}
  const css=`
  #sv-store-open{position:fixed;right:12px;bottom:74px;z-index:22130;min-height:44px;padding:0 12px;border-radius:999px;border:1px solid #ffd66b;background:#211608ee;color:#fff;font:900 10px/1 system-ui;box-shadow:0 8px 24px #000a}
  #sv-store{position:fixed;inset:10px;z-index:22140;display:none;overflow:auto;border-radius:18px;border:1px solid #e6bc57;background:linear-gradient(180deg,#17130df8,#090b0df9);color:#fff;padding:12px;font-family:system-ui,sans-serif;box-shadow:0 18px 55px #000d}
  #sv-store[data-open="true"]{display:block}.top{display:flex;justify-content:space-between;align-items:center;gap:8px;position:sticky;top:0;background:#17130df2;padding:4px 0 9px;z-index:3}.top b{color:#ffe49b}.top small{display:block;color:#cdbd8b;margin-top:2px}
  #sv-store button{min-height:44px;border:1px solid #d7b660;border-radius:10px;background:#281e0c;color:#fff;font:900 10px/1.15 system-ui;padding:7px 9px}#sv-store button:focus,#sv-store-open:focus{outline:3px solid #fff;outline-offset:2px}
  .shelves{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.item{text-align:left;background:#111821!important;border-color:#42526b!important;padding:9px;min-height:105px}.item .emoji{font-size:27px;display:block}.price{color:#ffe08a}.hold{color:#ffcb8a;font-size:8px;margin-top:5px}
  .section{margin-top:10px;padding:10px;border-radius:12px;border:1px solid #405767;background:#08151d}.label{display:none}.label[data-open="true"]{display:block}.facts{display:grid;grid-template-columns:1fr 1fr;gap:6px}.fact{padding:7px;border-radius:8px;background:#0d202d;font-size:9px;color:#d8eef7}.status{font-size:9px;line-height:1.35;color:#d9f4ff}.basket{color:#c9f7d2;font-size:9px}.shipping{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:7px}.shipping div{padding:7px;border:1px solid #566b50;border-radius:8px;background:#0a1b10;font-size:8px}.shipping .no{border-color:#765d35;background:#211809;color:#ffdba2}@media(max-width:390px){.shelves,.facts,.shipping{grid-template-columns:1fr}}
  `
  const money=n=>`$${Number(n||0).toFixed(2)}`
  const emit=(type,detail)=>window.dispatchEvent(new CustomEvent(type,{detail:{source:'streetverse-immersive-store',version:VERSION,...detail}}))
  function products(){return (catalogs[state.store.id]||catalogs.default).map(p=>({...p,...(state.verifiedProducts[p.sku]||{}),sellable:Boolean((state.verifiedProducts[p.sku]||{}).sellable),verified:Boolean((state.verifiedProducts[p.sku]||{}).verified)}))}
  function gate(product){
    if(product.verified&&product.sellable)return 'VERIFIED SELLABLE SKU'
    if(['beef','poultry','lamb','dairy','eggs','produce'].includes(product.category))return 'HOLD: supplier/origin/inventory and applicable inspection/cold-chain verification required.'
    if(['phone','esim'].includes(product.category))return 'HOLD: device/carrier/provider verification required.'
    return 'HOLD: supplier/inventory/rights or authenticity verification required.'
  }
  function mount(){
    if(mounted)return;mounted=true
    const style=document.createElement('style');style.id='sv-immersive-store-style';style.textContent=css;document.head.appendChild(style)
    const open=document.createElement('button');open.id='sv-store-open';open.type='button';open.textContent='🛒 ENTER STORE';open.setAttribute('aria-controls','sv-store');open.setAttribute('aria-expanded','false')
    const panel=document.createElement('section');panel.id='sv-store';panel.dataset.open='false';panel.setAttribute('aria-label','StreetVerse immersive store')
    panel.innerHTML='<div class="top"><div><b class="store-title"></b><small>Walk in • pick up • inspect/read label • basket • purchase</small></div><button class="close" type="button">EXIT</button></div><p style="font-size:10px;color:#d8d1bf">Tap an item to pick it up. Real payment only unlocks for verified sellable inventory.</p><div class="shelves"></div><div class="section label" aria-live="polite"></div><div class="section"><b>🧺 BASKET</b><div class="basket">Empty</div><div class="shipping"></div><p><button class="purchase" type="button">PURCHASE</button> <button class="pickup" type="button">PICKUP</button> <button class="overnight" type="button">FREE OVERNIGHT CHECK</button> <button class="delivery" type="button">DELIVERY</button></p></div><div class="section status" aria-live="polite">Choose an item.</div>'
    const title=panel.querySelector('.store-title'),shelves=panel.querySelector('.shelves'),label=panel.querySelector('.label'),basket=panel.querySelector('.basket'),shipping=panel.querySelector('.shipping'),status=panel.querySelector('.status')
    const total=()=>state.basket.reduce((s,p)=>s+Number(p.price||0),0)
    function syncBasket(){basket.textContent=state.basket.length?`${state.basket.map(x=>x.name).join(' • ')} • TOTAL ${money(total())}`:'Empty'}
    function syncStore(){title.textContent=`${state.store.icon||'🏪'} ${state.store.name}`;shelves.innerHTML='';products().forEach(product=>{const b=document.createElement('button');b.type='button';b.className='item';b.innerHTML=`<span class="emoji">${product.emoji}</span><b>${product.name}</b><br><span class="price">${money(product.price)}</span><div class="hold">${product.verified&&product.sellable?'IN STOCK':'DEMO • VERIFY TO SELL'}</div>`;b.addEventListener('click',()=>inspect(product));shelves.appendChild(b)});label.dataset.open='false';status.textContent=`Inside ${state.store.name}. Pick up an item to inspect it.`}
    function inspect(product){
      state.held=product;label.dataset.open='true';label.innerHTML=`<b>${product.emoji} ${product.name} • ${money(product.price)}</b><div class="facts"><div class="fact"><b>SKU</b><br>${product.sku}</div><div class="fact"><b>ORIGIN</b><br>${product.origin}</div><div class="fact"><b>INGREDIENTS / CONTENT</b><br>${product.ingredients}</div><div class="fact"><b>STORAGE</b><br>${product.storage}</div></div><p class="hold">${gate(product)}</p><p><button class="add" type="button">${product.sellable?'ADD TO BASKET':'ADD TO DEMO BASKET'}</button> <button class="read" type="button">🔊 READ LABEL</button> <button class="putback" type="button">PUT BACK</button></p>`
      label.querySelector('.add').addEventListener('click',()=>{state.basket.push({...product,storeId:state.store.id});syncBasket();status.textContent=`${product.name} added to ${product.sellable?'basket':'demo basket'}.`})
      label.querySelector('.read').addEventListener('click',()=>{const text=`${product.name}. Price ${money(product.price)}. Origin ${product.origin}. Ingredients or contents: ${product.ingredients}. Storage: ${product.storage}. ${gate(product)}`;if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text))};status.textContent='Reading product label aloud.'})
      label.querySelector('.putback').addEventListener('click',()=>{label.dataset.open='false';state.held=null;status.textContent='Item returned to shelf.'});emit('tryamm:store-item-picked-up',{storeId:state.store.id,sku:product.sku})
    }
    function showShipping(){
      const cold=state.basket.some(x=>x.cold);const out=window.TRYAMMDeliveryOptions?.evaluate?.({orderTotal:total(),inventoryLocal:false,addressEligible:false,carrierAvailable:false,coldRequired:cold,coldChainReady:false,freeOvernightFunded:false,pickupAvailable:true,sameDayAvailable:false})
      shipping.innerHTML=out?out.options.map(o=>`<div class="${o.eligible?'':'no'}"><b>${o.label}</b><br>${o.eligible?'ELIGIBLE':o.reason||'NOT VERIFIED'}</div>`).join(''):'<div class="no">Delivery engine not loaded.</div>'
      return out
    }
    function checkout(mode){
      if(!state.basket.length){status.textContent='Basket is empty.';return}
      const blocked=state.basket.filter(p=>!p.sellable||!p.verified);const delivery=showShipping()
      if(mode==='free-overnight'&&!delivery?.freeOvernight){status.textContent='FREE OVERNIGHT HOLD: address, nearby inventory, cutoff, carrier, cold-chain and funded-promotion eligibility must all pass.';emit('tryamm:free-overnight-held',{storeId:state.store.id,amount:total()});return}
      if(blocked.length){status.textContent=`PURCHASE HOLD: ${blocked.length} item(s) are demo/unverified inventory. Shopping works; real payment remains blocked.`;emit('tryamm:store-checkout-held',{mode,storeId:state.store.id,skus:blocked.map(p=>p.sku),amount:total()});return}
      const detail={mode,store:state.store.id,items:state.basket.map(({sku,name,price})=>({sku,name,price})),amount:total(),currency:'USD',verifiedInventory:true,delivery};emit('tryamm:commerce-checkout-request',detail);status.textContent=`Checkout request created for ${money(detail.amount)} • ${mode}. Waiting for verified payment result.`
    }
    panel.querySelector('.purchase').addEventListener('click',()=>checkout('purchase'));panel.querySelector('.pickup').addEventListener('click',()=>checkout('pickup'));panel.querySelector('.overnight').addEventListener('click',()=>checkout('free-overnight'));panel.querySelector('.delivery').addEventListener('click',()=>checkout('delivery'))
    const setOpen=v=>{panel.dataset.open=String(v);open.setAttribute('aria-expanded',String(v));if(v){syncStore();showShipping();emit('tryamm:store-entered',{storeId:state.store.id})}}
    open.addEventListener('click',()=>setOpen(true));panel.querySelector('.close').addEventListener('click',()=>setOpen(false))
    window.addEventListener('tryamm:retail-store-selected',e=>{state.store={id:e.detail?.id||'yahavah',name:e.detail?.name||'YAHAVAH Grocery',icon:e.detail?.icon||'🏪'};syncStore();setOpen(true)})
    document.body.append(open,panel);syncBasket();syncStore()
    window.TRYAMMImmersiveStore={version:VERSION,open:()=>setOpen(true),close:()=>setOpen(false),selectStore:store=>{state.store={...state.store,...store};syncStore();return true},snapshot:()=>JSON.parse(JSON.stringify(state)),upsertProduct:product=>{if(!product?.sku)return false;state.verifiedProducts[product.sku]={...state.verifiedProducts[product.sku],...product};syncStore();return true}}
    emit('tryamm:immersive-store-ready',{features:['multi-store','enter-store','browse-shelves','pick-up-item','inspect-label','read-label-aloud','basket','purchase','pickup','delivery','free-overnight-eligibility'],realCheckoutGate:'verified-sellable-inventory-only'})
  }
  mount()
})()
