function registerAssetMarketplaceRoutes({ app, manifest, manager, requireInternalSecret, appendAudit }) {
  app.get('/api/assets/marketplace', (_req,res) => res.json(manifest));
  app.get('/api/assets', (_req,res) => res.json({ assets: manager.listAssets() }));
  app.get('/api/assets/listings', (_req,res) => res.json({ listings: manager.listListings() }));
  app.get('/api/assets/report', requireInternalSecret, (_req,res) => res.json(manager.report()));
  app.post('/api/assets', requireInternalSecret, (req,res) => { try { const asset=manager.createAsset(req.body||{}); appendAudit({event:'asset-vault.created',assetId:asset.id,at:new Date().toISOString()}); res.status(201).json(asset); } catch(e){ res.status(400).json({error:e.message}); } });
  app.get('/api/assets/:id', (req,res) => { const asset=manager.getAsset(req.params.id); if(!asset) return res.status(404).json({error:'Asset not found'}); res.json(asset); });
  app.post('/api/assets/:id', requireInternalSecret, (req,res) => { const asset=manager.updateAsset(req.params.id,req.body||{}); if(!asset) return res.status(404).json({error:'Asset not found'}); appendAudit({event:'asset-vault.updated',assetId:asset.id,at:new Date().toISOString()}); res.json(asset); });
  app.post('/api/assets/:id/listings', requireInternalSecret, (req,res) => { try { const listing=manager.createListing(req.params.id,req.body||{}); appendAudit({event:'asset-marketplace.listed',listingId:listing.id,assetId:listing.assetId,at:new Date().toISOString()}); res.status(201).json(listing); } catch(e){ res.status(400).json({error:e.message}); } });
  app.post('/api/assets/entitlements', requireInternalSecret, (req,res) => { try { const entitlement=manager.grantEntitlement(req.body||{}); appendAudit({event:'asset-marketplace.entitlement',entitlementId:entitlement.id,assetId:entitlement.assetId,at:new Date().toISOString()}); res.status(201).json(entitlement); } catch(e){ res.status(400).json({error:e.message}); } });
  app.post('/api/assets/usage', requireInternalSecret, (req,res) => { try { const usage=manager.recordUsage(req.body||{}); appendAudit({event:'asset-marketplace.usage',...usage}); res.status(201).json(usage); } catch(e){ res.status(400).json({error:e.message}); } });
}
module.exports={registerAssetMarketplaceRoutes};
