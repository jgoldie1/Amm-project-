'use strict';

const crypto = require('crypto');

const CITY_NETWORKS = {
  chicago: { id:'chicago', country:'US', label:'Chicago', region:'North America', modes:['L-rail','bus','walk','bike','rideshare','delivery'], lines:['red','blue','pink','brown','green','orange','purple','yellow'], hubs:['Loop','South Side','West Side','North Side'], businessCorridors:true },
  new_york: { id:'new_york', country:'US', label:'New York', region:'North America', modes:['subway','commuter-rail','bus','ferry','walk','bike','rideshare'], lines:[], hubs:['Manhattan','Brooklyn','Queens','Bronx'], businessCorridors:true },
  los_angeles: { id:'los_angeles', country:'US', label:'Los Angeles', region:'North America', modes:['metro-rail','bus','car','rideshare','walk','bike'], lines:[], hubs:['Downtown','South LA','Hollywood','Westside'], businessCorridors:true },
  lagos: { id:'lagos', country:'NG', label:'Lagos', region:'Africa', modes:['rail','brt','bus','ferry','car','rideshare','walk'], lines:[], hubs:['Lagos Island','Mainland','Ikeja','Lekki'], businessCorridors:true },
  abuja: { id:'abuja', country:'NG', label:'Abuja', region:'Africa', modes:['rail','bus','taxi','car','rideshare','walk'], lines:[], hubs:['Central Area','Garki','Wuse','Airport Corridor'], businessCorridors:true },
  accra: { id:'accra', country:'GH', label:'Accra', region:'Africa', modes:['shared-transit','bus','taxi','car','walk'], lines:[], hubs:['Central Accra','Osu','Airport','Tema Corridor'], businessCorridors:true },
  nairobi: { id:'nairobi', country:'KE', label:'Nairobi', region:'Africa', modes:['shared-transit','bus','rail','taxi','car','walk'], lines:[], hubs:['CBD','Westlands','Industrial Area','Airport Corridor'], businessCorridors:true },
  johannesburg: { id:'johannesburg', country:'ZA', label:'Johannesburg', region:'Africa', modes:['rapid-rail','commuter-rail','minibus','bus','car','walk'], lines:[], hubs:['CBD','Sandton','Soweto','Airport Corridor'], businessCorridors:true }
};

const EVENT_TYPES = new Set(['station-enter','board','ride-complete','district-enter','business-discovery','delivery-complete','job-complete','creator-checkin','radio-attribution']);
const digest = value => crypto.createHash('sha256').update(String(value)).digest('hex');

module.exports = function registerGlobalMobilityRoutes({ app, auth, clean, id, getStore, saveStore }) {
  const store = getStore();
  store.mobilityEvents ||= [];
  store.internalLedger ||= [];
  store.businessPassports ||= [];

  function appendLedgerEvent(event) {
    const ledger = store.internalLedger;
    const previousHash = ledger.length ? ledger[ledger.length - 1].hash : 'GENESIS';
    const createdAt = new Date().toISOString();
    const record = {
      id:id('led'), version:1, previousHash, createdAt,
      type:clean(event.type,80), actorId:clean(event.actorId,120), businessId:clean(event.businessId,120),
      worldId:clean(event.worldId,80), cityId:clean(event.cityId,80), referenceId:clean(event.referenceId,160),
      amountCents:Number.isFinite(Number(event.amountCents)) ? Math.trunc(Number(event.amountCents)) : 0,
      currency:clean(event.currency || 'USD',12).toUpperCase(),
      metadata:event.metadata && typeof event.metadata === 'object' ? event.metadata : {}
    };
    record.hash = digest(`${record.previousHash}|${JSON.stringify(record)}`);
    ledger.push(record);
    return record;
  }

  app.get('/api/mobility/cities', (_req,res) => res.json({ version:1, cities:Object.values(CITY_NETWORKS), principles:['local transport identity','shared mobility engine','accessible routing','business corridors','server-authoritative economy'] }));

  app.get('/api/mobility/cities/:cityId', (req,res) => {
    const city = CITY_NETWORKS[clean(req.params.cityId,80).toLowerCase()];
    if (!city) return res.status(404).json({ error:'Mobility city not found' });
    res.json({ city });
  });

  app.post('/api/mobility/events', auth, async (req,res) => {
    const cityId = clean(req.body.cityId,80).toLowerCase();
    const city = CITY_NETWORKS[cityId];
    if (!city) return res.status(400).json({ error:'Unsupported city' });
    const kind = clean(req.body.kind,60);
    if (!EVENT_TYPES.has(kind)) return res.status(400).json({ error:'Unsupported mobility event' });
    const event = { id:id('mob'), userId:req.user.id, cityId, kind, mode:clean(req.body.mode,40), lineId:clean(req.body.lineId,40), districtId:clean(req.body.districtId,100), businessId:clean(req.body.businessId,120), createdAt:new Date().toISOString() };
    store.mobilityEvents.push(event);
    const ledgerEvent = appendLedgerEvent({ type:`mobility.${kind}`, actorId:req.user.id, businessId:event.businessId, worldId:'streetverse', cityId, referenceId:event.id, metadata:{ mode:event.mode, lineId:event.lineId, districtId:event.districtId } });
    await saveStore();
    res.status(201).json({ event, ledgerEvent });
  });

  app.post('/api/business-passports', auth, async (req,res) => {
    const name = clean(req.body.name,120);
    if (!name) return res.status(400).json({ error:'Business name is required' });
    const passport = { id:id('biz'), ownerId:req.user.id, name, cityId:clean(req.body.cityId,80).toLowerCase(), category:clean(req.body.category,80), community:clean(req.body.community || 'global-business-network',80), bpoEnabled:Boolean(req.body.bpoEnabled), bplEnabled:Boolean(req.body.bplEnabled), radioEnabled:Boolean(req.body.radioEnabled), marketplaceEnabled:Boolean(req.body.marketplaceEnabled), createdAt:new Date().toISOString(), status:'active' };
    store.businessPassports.push(passport);
    const ledgerEvent = appendLedgerEvent({ type:'business.passport.created', actorId:req.user.id, businessId:passport.id, cityId:passport.cityId, referenceId:passport.id, metadata:{ category:passport.category, community:passport.community } });
    await saveStore();
    res.status(201).json({ passport, ledgerEvent });
  });

  app.get('/api/command-agent/economy', auth, (req,res) => {
    const ownBusinessIds = new Set(store.businessPassports.filter(b => b.ownerId === req.user.id).map(b => b.id));
    const relevant = store.internalLedger.filter(e => e.actorId === req.user.id || ownBusinessIds.has(e.businessId));
    const byType = relevant.reduce((acc,item) => { acc[item.type]=(acc[item.type]||0)+1; return acc; },{});
    const byCity = relevant.reduce((acc,item) => { if (item.cityId) acc[item.cityId]=(acc[item.cityId]||0)+1; return acc; },{});
    res.json({ agent:'Stubbs AI Command Agent', scope:'authorized-user-only', businesses:ownBusinessIds.size, ledgerEvents:relevant.length, byType, byCity, recommendations:['Connect high-traffic mobility hubs to participating Business Passports.','Measure Omniverse Radio campaigns by verified business-discovery and order events.','Use BPO for operations and BPL for planning; require human approval for regulated financial actions.'], regulatedActionsAutomatic:false });
  });

  app.get('/api/internal-ledger/verify', auth, (_req,res) => {
    const ledger = store.internalLedger;
    let valid = true;
    for (let i=0;i<ledger.length;i+=1) {
      const item = ledger[i];
      const expectedPrevious = i ? ledger[i-1].hash : 'GENESIS';
      const { hash, ...withoutHash } = item;
      const expectedHash = digest(`${expectedPrevious}|${JSON.stringify(withoutHash)}`);
      if (item.previousHash !== expectedPrevious || hash !== expectedHash) { valid=false; break; }
    }
    res.json({ valid, records:ledger.length, mode:'internal-append-only-hash-chain', publicExchangeEnabled:false });
  });
};
