'use strict';

module.exports = function registerDailyBusinessBoostRoutes({ app, auth, clean, id, getStore, saveStore, io }) {
  const store = getStore();
  for (const key of ['businessProfiles','businessBoosts','businessBoostEvents']) if (!Array.isArray(store[key])) store[key] = [];

  const publicBusiness = (b) => ({ id:b.id,name:b.name,category:b.category,city:b.city,state:b.state,blackOwned:Boolean(b.blackOwned),smallBusiness:Boolean(b.smallBusiness),passportStatus:b.passportStatus,status:b.status,offer:b.offer,streetverseLocation:b.streetverseLocation,createdAt:b.createdAt });

  app.get('/api/business/directory', (req,res) => {
    const lane=clean(req.query.lane,30).toLowerCase();
    const q=clean(req.query.q,120).toLowerCase();
    const businesses=store.businessProfiles.filter(b=>b.status==='active')
      .filter(b=>lane!=='black-business'||b.blackOwned)
      .filter(b=>lane!=='small-business'||b.smallBusiness)
      .filter(b=>!q||`${b.name} ${b.category} ${b.city} ${b.state}`.toLowerCase().includes(q));
    res.json({businesses:businesses.map(publicBusiness)});
  });

  app.post('/api/business/passport', auth, async (req,res) => {
    const name=clean(req.body.name,120); if(!name)return res.status(400).json({error:'Business name is required'});
    const business={id:id('biz'),ownerId:req.user.id,name,category:clean(req.body.category,80)||'Small Business',city:clean(req.body.city,80),state:clean(req.body.state,40),blackOwned:Boolean(req.body.blackOwned),smallBusiness:req.body.smallBusiness!==false,passportStatus:'pending-verification',status:'active',offer:clean(req.body.offer,240),streetverseLocation:clean(req.body.streetverseLocation,160),createdAt:new Date().toISOString()};
    store.businessProfiles.push(business);await saveStore();io.emit('business:directory-changed');res.status(201).json({business:publicBusiness(business)});
  });

  app.get('/api/business/boost/today', (_req,res) => {
    const today=new Date().toISOString().slice(0,10);
    const boosts=store.businessBoosts.filter(b=>b.date===today&&b.status==='active').map(b=>({...b,business:publicBusiness(store.businessProfiles.find(x=>x.id===b.businessId)||{})}));
    res.json({date:today,boosts});
  });

  app.post('/api/business/:businessId/boost', auth, async (req,res) => {
    const business=store.businessProfiles.find(b=>b.id===req.params.businessId);if(!business)return res.status(404).json({error:'Business not found'});
    if(business.ownerId!==req.user.id&&req.user.role!=='admin')return res.status(403).json({error:'Business owner or admin required'});
    const lane=['small-business','black-business','community'].includes(req.body.lane)?req.body.lane:(business.blackOwned?'black-business':'small-business');
    const boost={id:id('boost'),businessId:business.id,lane,date:clean(req.body.date,10)||new Date().toISOString().slice(0,10),headline:clean(req.body.headline,160)||`${business.name} — Business Spotlight`,offer:clean(req.body.offer,240)||business.offer,surfaces:['home-feed','streetverse-map','holo-radio','reels','business-directory','missions'],status:'active',impressions:0,clicks:0,visits:0,conversions:0,createdAt:new Date().toISOString()};
    store.businessBoosts.push(boost);await saveStore();io.emit('business:boost-changed',boost);res.status(201).json({boost});
  });

  app.post('/api/business/boost/:boostId/event', auth, async (req,res) => {
    const boost=store.businessBoosts.find(b=>b.id===req.params.boostId);if(!boost)return res.status(404).json({error:'Boost not found'});
    const type=clean(req.body.type,30);if(!['impression','click','visit','conversion'].includes(type))return res.status(400).json({error:'Invalid event'});
    boost[`${type}s`]=(boost[`${type}s`]||0)+1;store.businessBoostEvents.push({id:id('bevt'),boostId:boost.id,businessId:boost.businessId,userId:req.user.id,type,valueCents:Math.max(0,Number(req.body.valueCents||0)),createdAt:new Date().toISOString()});await saveStore();res.json({boost});
  });

  app.get('/api/business/:businessId/boost-analytics', auth, (req,res) => {
    const business=store.businessProfiles.find(b=>b.id===req.params.businessId);if(!business)return res.status(404).json({error:'Business not found'});
    if(business.ownerId!==req.user.id&&req.user.role!=='admin')return res.status(403).json({error:'Business owner or admin required'});
    const boosts=store.businessBoosts.filter(b=>b.businessId===business.id);const revenueCents=store.businessBoostEvents.filter(e=>e.businessId===business.id&&e.type==='conversion').reduce((s,e)=>s+Number(e.valueCents||0),0);
    res.json({business:publicBusiness(business),boosts,revenueCents});
  });
};
