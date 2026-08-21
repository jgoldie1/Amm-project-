export const STREETVERSE_RETAIL_DISTRICT = {
  districtName: 'All American Retail District',
  stores: [
    {
      id:'yahavah-grocery', name:'YAHAVAH Grocery', type:'grocery',
      features:['fresh food','pantry','household','local vendors','eligible delivery','loyalty','Holo Fridge sync','supplier ordering','store jobs'],
      missions:['Stock the Block','Fresh Food Run','Supplier Shortage','Community Basket','Open Your First Grocery'],
    },
    {
      id:'holo-fridge', name:'Holo Fridge', type:'smart-home/retail bridge',
      features:['household inventory','expiration reminders','shopping list','recipe suggestions','eligible reorder','family controls','accessibility voice mode'],
      missions:['Build the Family Pantry','Waste Less','Emergency Grocery Run'],
    },
    {
      id:'all-american-store-gas', name:'All American Store + Gas Station', type:'convenience/fuel',
      features:['convenience retail','eligible fuel partner integration','EV charging path','food/beverage','vehicle supplies','delivery pickup','24-hour staffing simulation','fleet/trucking missions'],
      missions:['Night Shift','Fuel the Fleet','Road Trip Supply','Storm Logistics'],
    },
    {
      id:'beauty-supply', name:'All American Beauty Supply', type:'beauty-retail',
      features:['hair care','skin care','beauty tools','salon/pro inventory','creator storefronts','supplier sourcing','training','local pickup'],
      missions:['Build the Beauty Store','Salon Supply Rush','Creator Product Drop','Wholesale Buyer'],
    },
    {
      id:'wig-emporium', name:'Wig Emporium', type:'hair/wig retail',
      features:['wigs','bundles','extensions','accessories','virtual try-on pathway','appointments','stylist marketplace','wholesale cases','creator campaigns'],
      missions:['Find the Right Supplier','Style Session','Grand Opening','Regional Expansion'],
    },
  ],
  claimPath:'DISCOVER STOREFRONT → SIGN IN → CLAIM OR CREATE BUSINESS → VERIFY AUTHORITY → CHOOSE STORE TYPE → SUPPLIERS → INVENTORY → STAFF → PRICING → OPEN → CUSTOMERS → SALES → REORDER → HIRE → EXPAND',
  worldLoop:'PLAYER LIVES IN STREETVERSE → NEEDS GOODS/SERVICES → VISITS STORE → STORE EMPLOYS NPC/PLAYERS → INVENTORY CHANGES → SUPPLIERS DELIVER → CUSTOMER TRAFFIC CHANGES → BUSINESS GROWS/FAILS/EXPANDS → WORLD MEMORY RECORDS CONSEQUENCES',
} as const

export const QUANTUM_SOURCING_RETAIL = {
  purpose:'AI-assisted sourcing/profit engine for original/private-label and authorized goods.',
  pipeline:['PRODUCT NEED','SUPPLIER SEARCH','MOQ','SAMPLE','QUALITY SCORE','CERTIFICATIONS/DOCUMENTS','IP/TRADEMARK CHECK','FACTORY CAPACITY','UNIT COST','FREIGHT','DUTY/TARIFF','PACKAGING','PAYMENT FEES','RETURN/WARRANTY RESERVE','LANDED COST','TARGET RETAIL','GROSS MARGIN','INVENTORY RISK','TEST ORDER','SALES DATA','REORDER'],
  storeCategories:['grocery shelf-stable/private-label where compliant','beauty accessories','wigs/hair extensions','salon tools','store fixtures','RFID/NFC tags','packaging','apparel','venue merchandise'],
  rules:['no counterfeit goods','no unsafe/unverified cosmetics','no unsupported health claims','food/cosmetic imports require applicable compliance','samples before bulk orders','supplier documents retained','country-of-origin and labeling handled where required'],
} as const

export const STUBBS_AI_RETAIL_OPERATOR = {
  roles:['store setup coach','supplier comparison','inventory forecast','margin monitor','staffing planner','promotion planner','customer service router','fraud/risk alert','mission director'],
  decisionsRequireHuman:['supplier contract acceptance','regulated product approval','large purchase order','price changes affecting regulated goods','employee termination','insurance/legal/compliance decisions'],
  promptPath:'MEET THE STUBBS → WHAT BUSINESS DO YOU WANT? → PICK/CLAIM LOCATION → BUILD PLAN → SOURCE PRODUCTS → OPEN STORE → RUN MISSIONS → SERVE CUSTOMERS → REVIEW PROFIT → EXPAND',
} as const

export const RETAIL_PROFIT_ENGINE = {
  revenue:['retail margin','wholesale case sales','private-label margin','delivery/service fees where eligible','promoted storefronts','business subscriptions','supplier marketplace fees when disclosed','stylist/salon marketplace commissions','advertising/sponsorship','franchise/license revenue after legal readiness'],
  costs:['landed inventory cost','payment processing','returns/shrink','rent/utilities','labor','insurance','taxes','delivery','marketing','software/support'],
  guardrail:'Display contribution margin and cash conversion, not just gross sales. Do not promise store profitability.',
} as const
