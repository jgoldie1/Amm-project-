(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const VERSION='20260903-immersive-store-v1'
  let mounted=false
  const demoProducts=[
    {sku:'LOCAL-BEEF-BOX',name:'Local Grass-Fed Beef Box',emoji:'🥩',category:'beef',price:99,origin:'U.S. farm / ranch lane',ingredients:'100% beef',storage:'Keep refrigerated or frozen',sellable:false,verified:false,labels:['US origin verification required','Inspection/processing verification required','Cold-chain verification required']},
    {sku:'PASTURE-CHICKEN-BOX',name:'Pasture-Raised Chicken Box',emoji:'🍗',category:'poultry',price:69,origin:'U.S. farm lane',ingredients:'Chicken',storage:'Keep refrigerated or frozen',sellable:false,verified:false,labels:['Supplier verification required','Inspection/processing verification required','Cold-chain verification required']},
    {sku:'LOCAL-EGGS-12',name:'Pasture-Raised Eggs',emoji:'🥚',category:'eggs',price:6.99,origin:'Local U.S. farm lane',ingredients:'Eggs',storage:'Keep refrigerated',sellable:false,verified:false,labels:['Supplier verification required','Origin verification required','Inventory verification required']},
    {sku:'CSA-PRODUCE-BOX',name:'Seasonal CSA Produce Box',emoji:'🥬',category:'produce',price:34.99,origin:'Local U.S. CSA lane',ingredients:'Seasonal produce assortment',storage:'Refrigerate perishables as needed',sellable:false,verified:false,labels:['Farm verification required','Current box contents required','Inventory verification required']},
    {sku:'LOCAL-HONEY',name:'Local Honey',emoji:'🍯',category:'honey',price:12.99,origin:'U.S. producer lane',ingredients:'Honey',storage:'Store at room temperature',sellable:false,verified:false,labels:['Producer verification required','Origin verification required','Inventory verification required']},
    {sku:'RICE-5LB',name:'Rice 5 lb',emoji:'🍚',category:'pantry',price:6.99,origin:'YAHAVAH Grocery supplier lane',ingredients:'Rice',storage:'Store in a cool dry place',sellable:false,verified:false,labels:['Supplier quote required','Sellable inventory not verified']}
  ]
  const state={basket:[],held:null,products:demoProducts.map(x=>({...x}))}
  const css=`
  #sv-store-open{position:absolute;left:12px;top:308px;z-index:27;min-height:44px;padding:0 12px;border-radius:12px;border:1px solid #ffd66b;background:#211608e8;color:#fff;font:900 10px/1 system-ui;box-shadow:0 6px 18px #0008;pointer-events:auto}
  #sv-store{position:absolute;inset:8px;z-index:80;display:none;overflow:auto;border-radius:18px;border:1px solid #e6bc57;background:linear-gradient(180deg,#17130df7,#090b0df8);color:#fff;padding:12px;pointer-events:auto;font-family:system-ui,sans-serif;box-shadow:0 18px 50px #000d}
  #sv-store[data-open="true"]{display:block}
  #sv-store .top{display:flex;align-items:center;justify-content:space-between;gap:8px;position:sticky;top:0;background:#17130df4;padding:5px 0 9px;z-index:3}
  #sv-store h2{margin:0;font-size:15px;color:#ffe49b}#sv-store p{font-size:10px;line-height:1.35;color:#d8d1bf}
  #sv-store button{min-height:44px;border:1px solid #d7b660;border-radius:10px;background:#281e0c;color:#fff;font:900 10px/1.15 system-ui;padding:7px 9px}
  #sv-store button:focus,#sv-store-open:focus{outline:3px solid #fff;outline-offset:2px}
  #sv-store .shelves{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  #sv-store .item{min-height:100px;text-align:left;background:#111821;border-color:#42526b;padding:9px}.item .emoji{font-size:26px;display:block}.item .price{color:#ffe08a;font-weight:950}.item .hold{color:#ffcb8a;font-size:8px;margin-top:5px}
  #sv-store .label{margin-top:10px;padding:10px;border-radius:12px;border:1px solid #547087;background:#081520;display:none}.label[data-open="true"]{display:block}.label h3{margin:0 0 6px;color:#bdefff;font-size:13px}.facts{display:grid;grid-template-columns:1fr 1fr;gap:6px}.fact{padding:7px;border-radius:8px;background:#0d202d;font-size:9px;color:#d8eef7}.warnings{margin-top:7px;color:#ffd49a;font-size:9px;line-height:1.35}
  #sv-store .basket{margin-top:10px;padding:9px;border:1px solid #3f694e;border-radius:11px;background:#091b10}.basket strong{color:#baffc8}.basket-items{font-size:9px;color:#d8f5df;margin-top:5px}.status{margin-top:8px;padding:8px;border-radius:9px;background:#121a21;border:1px solid #394c5a;color:#d9f4ff;font-size:9px;line-height:1.35}
  @media(max-width:380px){#sv-store .shelves{grid-template-columns:1fr}.facts{grid-template-columns:1fr}}
  `
  const money=n=>`$${Number(n||0).toFixed(2)}`
  function total(){return state.basket.reduce((s,p)=>s+Number(p.price||0),0)}
  function emit(type,detail){window.dispatchEvent(new CustomEvent(type,{detail:{source:'streetverse-immersive-store',version:VERSION,...detail}}))}
  function mount(){
    if(mounted)return
    const city=document.querySelector('[data-streetverse-html-city="true"]');if(!city)return
    const main=city.querySelector('main');if(!main)return
    mounted=true
    const style=document.createElement('style');style.id='sv-immersive-store-style';style.textContent=css;document.head.appendChild(style)
    const open=document.createElement('button');open.id='sv-store-open';open.type='button';open.textContent='🛒 ENTER STORE';open.setAttribute('aria-controls','sv-store');open.setAttribute('aria-expanded','false')
    const panel=document.createElement('section');panel.id='sv-store';panel.dataset.open='false';panel.setAttribute('aria-label','YAHAVAH Grocery immersive store')
    panel.innerHTML=`<div class="top"><div><b>YAHAVAH GROCERY • STREETVERSE STORE</b><div style="font-size:8px;color:#cdbd8b">Walk in • pick up • read label • basket • checkout</div></div><button class="close" type="button" aria-label="Exit store">EXIT</button></div><p>Tap an item to pick it up and inspect its label. Demo items remain purchase-held until supplier, inventory and required food verification are connected.</p><div class="shelves"></div><div class="label" aria-live="polite"></div><div class="basket"><strong>🧺 Basket</strong><div class="basket-items">Empty</div><div style="margin-top:7px"><button class="checkout" type="button">CHECKOUT / PURCHASE</button> <button class="pickup" type="button">STORE PICKUP</button> <button class="delivery" type="button">DELIVERY</button></div></div><div class="status" aria-live="polite">Enter the aisle and choose an item.</div>`
    const shelves=panel.querySelector('.shelves'),label=panel.querySelector('.label'),basket=panel.querySelector('.basket-items'),status=panel.querySelector('.status')
    function syncBasket(){basket.textContent=state.basket.length?`${state.basket.map(x=>x.name).join(' • ')} • TOTAL ${money(total())}`:'Empty'}
    function inspect(product){
      state.held=product
      label.dataset.open='true'
      label.innerHTML=`<h3>${product.emoji} ${product.name} • ${money(product.price)}</h3><div class="facts"><div class="fact"><b>SKU</b><br>${product.sku}</div><div class="fact"><b>ORIGIN</b><br>${product.origin}</div><div class="fact"><b>INGREDIENTS / CONTENT</b><br>${product.ingredients}</div><div class="fact"><b>STORAGE</b><br>${product.storage}</div></div><div class="warnings">${product.verified?'VERIFIED SELLABLE SKU':`HOLD: ${product.labels.join(' • ')}`}</div><div style="margin-top:8px"><button class="add" type="button">${product.sellable?'ADD TO BASKET':'ADD TO DEMO BASKET'}</button> <button class="read" type="button">🔊 READ LABEL</button> <button class="putback" type="button">PUT BACK</button></div>`
      label.querySelector('.add').addEventListener('click',()=>{state.basket.push(product);syncBasket();status.textContent=`${product.name} added to ${product.sellable?'basket':'demo basket'}.`;emit('tryamm:store-item-added',{sku:product.sku,sellable:product.sellable})})
      label.querySelector('.read').addEventListener('click',()=>{const text=`${product.name}. Price ${money(product.price)}. Origin ${product.origin}. Ingredients or contents: ${product.ingredients}. Storage: ${product.storage}. ${product.verified?'Verified sellable item.':'Purchase hold: '+product.labels.join('. ')}`;if('speechSynthesis' in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text))}status.textContent='Reading product label aloud.';emit('tryamm:store-label-read',{sku:product.sku})})
      label.querySelector('.putback').addEventListener('click',()=>{state.held=null;label.dataset.open='false';status.textContent='Item returned to shelf.';emit('tryamm:store-item-putback',{sku:product.sku})})
      status.textContent=`Picked up ${product.name}. Read or inspect the label before purchase.`
      emit('tryamm:store-item-picked-up',{sku:product.sku,verified:product.verified,sellable:product.sellable})
    }
    state.products.forEach(product=>{const b=document.createElement('button');b.type='button';b.className='item';b.innerHTML=`<span class="emoji">${product.emoji}</span><b>${product.name}</b><br><span class="price">${money(product.price)}</span><div class="hold">${product.sellable?'IN STOCK':'DEMO • VERIFY TO SELL'}</div>`;b.addEventListener('click',()=>inspect(product));shelves.appendChild(b)})
    function checkout(mode){
      if(!state.basket.length){status.textContent='Basket is empty.';return}
      const blocked=state.basket.filter(p=>!p.sellable||!p.verified)
      if(blocked.length){status.textContent=`PURCHASE HOLD: ${blocked.map(p=>p.name).join(', ')} ${blocked.length===1?'is':'are'} not yet verified sellable inventory. The shopping flow works, but real payment is blocked.`;emit('tryamm:store-checkout-held',{mode,skus:blocked.map(p=>p.sku),amount:total()});return}
      const detail={mode,items:state.basket.map(({sku,name,price})=>({sku,name,price})),amount:total(),currency:'USD',store:'yahavah-grocery',verifiedInventory:true}
      emit('tryamm:commerce-checkout-request',detail);status.textContent=`Checkout request created for ${money(detail.amount)} • ${mode}. Waiting for verified payment result.`
    }
    panel.querySelector('.checkout').addEventListener('click',()=>checkout('purchase'))
    panel.querySelector('.pickup').addEventListener('click',()=>checkout('store-pickup'))
    panel.querySelector('.delivery').addEventListener('click',()=>checkout('delivery'))
    const setOpen=v=>{panel.dataset.open=String(v);open.setAttribute('aria-expanded',String(v));if(v)emit('tryamm:store-entered',{store:'yahavah-grocery'});else emit('tryamm:store-exited',{store:'yahavah-grocery'})}
    open.addEventListener('click',()=>setOpen(true));panel.querySelector('.close').addEventListener('click',()=>setOpen(false))
    main.append(open,panel);syncBasket()
    window.TRYAMMImmersiveStore={version:VERSION,open:()=>setOpen(true),close:()=>setOpen(false),snapshot:()=>JSON.parse(JSON.stringify(state)),upsertProduct:product=>{if(!product?.sku)return false;const i=state.products.findIndex(x=>x.sku===product.sku);if(i>=0)state.products[i]={...state.products[i],...product};else state.products.push(product);return true}}
    emit('tryamm:immersive-store-ready',{store:'yahavah-grocery',features:['enter-store','browse-shelves','pick-up-item','inspect-label','read-label-aloud','basket','purchase','pickup','delivery'],realCheckoutGate:'verified-sellable-inventory-only'})
  }
  const observer=new MutationObserver(mount);observer.observe(document.documentElement,{subtree:true,childList:true});mount();addEventListener('pagehide',()=>observer.disconnect(),{once:true})
})()
