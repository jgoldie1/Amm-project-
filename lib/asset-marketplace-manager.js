const crypto = require('crypto');

function createAssetMarketplaceManager({ manifest, io, dnaProtection = null }) {
  const assets = new Map();
  const listings = new Map();
  const entitlements = new Map();
  const usage = [];

  function now() { return new Date().toISOString(); }
  function emit(event, payload) { if (io) io.emit(event, payload); }
  function text(value, max = 500) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }

  function createAsset(input = {}) {
    const name = text(input.name, 160); const type = text(input.type, 80); const ownerId = text(input.ownerId, 160);
    if (!name || !type || !ownerId) throw new Error('name, type and ownerId are required');
    const asset = { id: crypto.randomUUID(), name, type, ownerId, description: text(input.description, 3000), tags: Array.isArray(input.tags) ? input.tags.slice(0, 50).map(v => text(v, 80)).filter(Boolean) : [], version: '1.0.0', parentAssetId: input.parentAssetId || null, dnaId: text(input.dnaId, 160) || null, contentHash: text(input.contentHash, 256) || null, sourceRef: text(input.sourceRef, 1000) || null, previewRef: text(input.previewRef, 1000) || null, aiDisclosure: text(input.aiDisclosure, 1000) || null, rights: input.rights || {}, moderationStatus: 'pending', status: 'draft', createdAt: now(), updatedAt: now() };
    assets.set(asset.id, asset); emit('asset-marketplace:asset', asset); return asset;
  }

  function getAsset(id) { return assets.get(id) || null; }
  function listAssets() { return Array.from(assets.values()); }
  function updateAsset(id, patch = {}) {
    const asset = getAsset(id); if (!asset) return null;
    const allowed = ['description','tags','previewRef','sourceRef','contentHash','aiDisclosure','rights','moderationStatus','status','version','dnaId'];
    for (const key of allowed) if (patch[key] !== undefined) asset[key] = patch[key];
    if (patch.status === 'published') {
      if (!asset.dnaId) throw new Error('DNA_RECORD_REQUIRED');
      if (dnaProtection && !dnaProtection.canPublish(asset.dnaId)) throw new Error('DNA_ATTESTATION_REQUIRED');
    }
    asset.updatedAt = now(); emit('asset-marketplace:asset', asset); return asset;
  }

  function createListing(assetId, input = {}) {
    const asset = getAsset(assetId); if (!asset) throw new Error('ASSET_NOT_FOUND');
    if (asset.moderationStatus !== 'approved' || asset.status !== 'published') throw new Error('ASSET_NOT_PUBLISHABLE');
    if (!asset.dnaId) throw new Error('DNA_RECORD_REQUIRED');
    if (dnaProtection && !dnaProtection.canPublish(asset.dnaId)) throw new Error('DNA_ATTESTATION_REQUIRED');
    const priceUsd = Number(input.priceUsd); if (!Number.isFinite(priceUsd) || priceUsd < 0) throw new Error('VALID_PRICE_REQUIRED');
    const licenseId = text(input.licenseId, 80); if (!manifest.licenses.some(l => l.id === licenseId)) throw new Error('UNKNOWN_LICENSE');
    const listing = { id: crypto.randomUUID(), assetId, dnaId: asset.dnaId, sellerId: asset.ownerId, title: text(input.title, 180) || asset.name, licenseId, priceUsd: Math.round(priceUsd * 100) / 100, currency: 'USD', status: 'active', createdAt: now(), updatedAt: now() };
    listings.set(listing.id, listing); emit('asset-marketplace:listing', listing); return listing;
  }

  function listListings() { return Array.from(listings.values()).filter(x => x.status === 'active').map(x => ({ ...x, asset: getAsset(x.assetId) })); }
  function grantEntitlement(input = {}) { const listing = listings.get(input.listingId); if (!listing) throw new Error('LISTING_NOT_FOUND'); const buyerId = text(input.buyerId,160); if (!buyerId) throw new Error('buyerId required'); const entitlement = { id: crypto.randomUUID(), listingId: listing.id, assetId: listing.assetId, dnaId: listing.dnaId, buyerId, licenseId: listing.licenseId, paymentReference: text(input.paymentReference,300), status: 'active', grantedAt: now() }; entitlements.set(entitlement.id, entitlement); emit('asset-marketplace:entitlement', entitlement); return entitlement; }
  function recordUsage(input = {}) { const entitlement = entitlements.get(input.entitlementId); if (!entitlement || entitlement.status !== 'active') throw new Error('ACTIVE_ENTITLEMENT_REQUIRED'); const event = { id: crypto.randomUUID(), entitlementId: entitlement.id, assetId: entitlement.assetId, dnaId: entitlement.dnaId, projectId: text(input.projectId,160), surface: text(input.surface,120), version: text(input.version,80), at: now() }; usage.unshift(event); if (usage.length > 10000) usage.length = 10000; return event; }
  function report() { return { assets: assets.size, publishedAssets: listAssets().filter(x => x.status === 'published').length, dnaLinkedAssets: listAssets().filter(x => x.dnaId).length, activeListings: listListings().length, activeEntitlements: Array.from(entitlements.values()).filter(x => x.status === 'active').length, usageEvents: usage.length }; }

  return { createAsset, getAsset, listAssets, updateAsset, createListing, listListings, grantEntitlement, recordUsage, report };
}
module.exports = { createAssetMarketplaceManager };
