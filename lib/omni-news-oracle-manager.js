const crypto = require('crypto');

const ALLOWED_INGESTION_MODES = new Set([
  'licensed_api',
  'rss_atom',
  'official_feed',
  'public_open_data',
  'partner_push',
  'approved_metadata_feed',
  'community_submission',
  'html_scrape'
]);

const VERIFICATION_WEIGHT = {
  unverified: 0.2,
  ingested: 0.25,
  corroborated: 0.6,
  verified: 0.82,
  confirmed: 0.86,
  official: 0.92
};

function clamp(value) { return Math.max(0, Math.min(1, Number(value) || 0)); }

function freshnessScore(publishedAt) {
  if (!publishedAt) return 0.25;
  const ageHours = Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / 36e5);
  if (ageHours <= 1) return 1;
  if (ageHours <= 6) return 0.9;
  if (ageHours <= 24) return 0.75;
  if (ageHours <= 72) return 0.55;
  if (ageHours <= 168) return 0.35;
  return 0.15;
}

function confidenceScore({ verificationStatus = 'ingested', sourceType = '', corroborations = 0 } = {}) {
  const base = VERIFICATION_WEIGHT[verificationStatus] ?? 0.2;
  const sourceBoost = {
    licensed_news_api: 0.06,
    licensed_api: 0.06,
    official_public_feed: 0.08,
    official_feed: 0.08,
    public_open_data: 0.04,
    licensed_partner_push: 0.06,
    partner_push: 0.06,
    rss_atom: 0,
    creator_community_submission: -0.08,
    community_submission: -0.08
  }[sourceType] || 0;
  return clamp(base + sourceBoost + Math.min(0.08, Math.max(0, Number(corroborations) || 0) * 0.02));
}

function createOmniNewsOracleManager() {
  const sources = new Map();
  const items = new Map();
  const submissions = new Map();

  function registerSource(input = {}) {
    if (!input.name || !input.type) throw new Error('SOURCE_NAME_AND_TYPE_REQUIRED');
    const ingestionMode = input.ingestionMode || input.type;
    if (!ALLOWED_INGESTION_MODES.has(ingestionMode)) throw new Error('INGESTION_MODE_NOT_ALLOWED');
    const id = crypto.randomUUID();
    const source = {
      id,
      name: input.name,
      type: input.type,
      provider: input.provider || input.name,
      ingestionMode,
      baseUrl: input.baseUrl || null,
      region: input.region || 'global',
      geographies: Array.isArray(input.geographies) ? input.geographies : [input.region || 'global'],
      categories: Array.isArray(input.categories) ? input.categories : [],
      lanes: Array.isArray(input.lanes) ? input.lanes : ['global_international'],
      purposes: Array.isArray(input.purposes) ? input.purposes : ['newsroom'],
      publicSafety: Boolean(input.publicSafety),
      privacyMode: input.privacyMode || 'public',
      retentionHours: Number.isFinite(Number(input.retentionHours)) ? Math.max(1, Number(input.retentionHours)) : 72,
      license: {
        plan: input.license?.plan || null,
        commercialUse: Boolean(input.license?.commercialUse),
        redistributionAllowed: Boolean(input.license?.redistributionAllowed),
        fullContentAllowed: Boolean(input.license?.fullContentAllowed),
        scrapingAllowed: Boolean(input.license?.scrapingAllowed),
        attributionRequired: input.license?.attributionRequired !== false,
        termsUrl: input.license?.termsUrl || null,
        reviewedAt: input.license?.reviewedAt || null,
        contractReviewedAt: input.license?.contractReviewedAt || null
      },
      controls: {
        purposeLimited: Boolean(input.controls?.purposeLimited),
        retentionReviewed: Boolean(input.controls?.retentionReviewed),
        noPrivatePersonTracking: input.controls?.noPrivatePersonTracking !== false
      },
      rateLimit: input.rateLimit || null,
      enabled: false,
      live: false,
      createdAt: new Date().toISOString()
    };
    sources.set(id, source);
    return source;
  }

  function approveSource(id) {
    const source = sources.get(id);
    if (!source) throw new Error('SOURCE_NOT_FOUND');
    if (!source.license.commercialUse) throw new Error('COMMERCIAL_LICENSE_REQUIRED');
    if (!source.license.reviewedAt || !source.license.termsUrl) throw new Error('LICENSE_TERMS_REVIEW_REQUIRED');
    if (source.ingestionMode === 'html_scrape' && !source.license.scrapingAllowed) throw new Error('SCRAPING_PERMISSION_REQUIRED');
    if (source.ingestionMode === 'partner_push' && !source.license.contractReviewedAt) throw new Error('PARTNER_CONTRACT_REVIEW_REQUIRED');
    if (source.publicSafety) {
      if (!source.controls.purposeLimited) throw new Error('PUBLIC_SAFETY_PURPOSE_LIMIT_REQUIRED');
      if (!source.controls.retentionReviewed) throw new Error('PUBLIC_SAFETY_RETENTION_REVIEW_REQUIRED');
      if (!source.controls.noPrivatePersonTracking) throw new Error('PRIVATE_PERSON_TRACKING_PROHIBITED');
    }
    source.enabled = true;
    source.approvedAt = new Date().toISOString();
    return source;
  }

  function activateSource(id) {
    const source = sources.get(id);
    if (!source || !source.enabled) throw new Error('APPROVED_SOURCE_REQUIRED');
    source.live = true;
    source.activatedAt = new Date().toISOString();
    return source;
  }

  function listSources(filters = {}) {
    return [...sources.values()].filter((source) =>
      (!filters.lane || source.lanes.includes(filters.lane)) &&
      (!filters.purpose || source.purposes.includes(filters.purpose)) &&
      (filters.live === undefined || source.live === Boolean(filters.live))
    );
  }

  function ingest(input = {}) {
    const source = sources.get(input.sourceId);
    if (!source || !source.enabled) throw new Error('APPROVED_SOURCE_REQUIRED');
    if (!input.headline || !input.url) throw new Error('HEADLINE_AND_URL_REQUIRED');
    const lane = input.lane || source.lanes[0] || 'global_international';
    const purposes = Array.isArray(input.purposes) && input.purposes.length ? input.purposes : source.purposes;
    if (!source.lanes.includes(lane)) throw new Error('SOURCE_LANE_NOT_APPROVED');
    if (purposes.some((purpose) => !source.purposes.includes(purpose))) throw new Error('SOURCE_PURPOSE_NOT_APPROVED');
    const fingerprint = String(input.canonicalUrl || input.url).toLowerCase();
    const duplicate = [...items.values()].find((x) => x.fingerprint === fingerprint);
    if (duplicate) return { duplicate: true, item: duplicate };
    const id = crypto.randomUUID();
    const verificationStatus = input.verificationStatus || 'ingested';
    const publishedAt = input.publishedAt || null;
    const item = {
      id,
      sourceId: source.id,
      sourceName: source.name,
      provider: source.provider,
      sourceType: source.type,
      ingestionMode: source.ingestionMode,
      headline: String(input.headline).slice(0, 240),
      summary: String(input.summary || '').slice(0, 2000),
      url: input.url,
      canonicalUrl: input.canonicalUrl || input.url,
      fingerprint,
      publishedAt,
      providerTimestamp: input.providerTimestamp || null,
      region: input.region || source.region,
      lane,
      purposes,
      category: input.category || 'general',
      author: input.author || null,
      mediaUrl: source.license.fullContentAllowed ? (input.mediaUrl || null) : null,
      geo: input.geo || null,
      privacyMode: source.privacyMode,
      attributionRequired: source.license.attributionRequired,
      verificationStatus,
      confidence: confidenceScore({ verificationStatus, sourceType: source.type, corroborations: input.corroborations }),
      freshness: freshnessScore(publishedAt),
      editorialStatus: 'queued',
      live: Boolean(source.live && ['verified','confirmed','official'].includes(verificationStatus)),
      createdAt: new Date().toISOString()
    };
    items.set(id, item);
    return { duplicate: false, item };
  }

  function submitCommunityReport(input = {}) {
    if (!input.headline || !input.description || !input.submitterId) throw new Error('SUBMISSION_FIELDS_REQUIRED');
    const id = crypto.randomUUID();
    const submission = {
      id,
      headline: String(input.headline).slice(0, 240),
      description: String(input.description).slice(0, 2000),
      lane: input.lane || 'local_chicago',
      purposes: Array.isArray(input.purposes) ? input.purposes : ['newsroom'],
      location: input.location || null,
      evidence: Array.isArray(input.evidence) ? input.evidence.slice(0, 10) : [],
      submitterId: input.submitterId,
      contactPermission: Boolean(input.contactPermission),
      status: 'unverified',
      createdAt: new Date().toISOString()
    };
    submissions.set(id, submission);
    return submission;
  }

  function reviewItem(id, input = {}) {
    const item = items.get(id);
    if (!item) throw new Error('ITEM_NOT_FOUND');
    item.verificationStatus = input.verificationStatus || item.verificationStatus;
    item.editorialStatus = input.editorialStatus || item.editorialStatus;
    item.reviewNotes = input.reviewNotes || null;
    item.confidence = confidenceScore({
      verificationStatus: item.verificationStatus,
      sourceType: item.sourceType,
      corroborations: input.corroborations
    });
    item.live = Boolean(['verified','confirmed','official'].includes(item.verificationStatus) && input.publish === true);
    item.reviewedAt = new Date().toISOString();
    return item;
  }

  function createAnchorScript(input = {}) {
    const selected = (input.itemIds || []).map((id) => items.get(id)).filter(Boolean);
    return {
      id: crypto.randomUUID(),
      title: input.title || 'OmniNews Global Brief',
      scope: input.scope || 'global_international',
      anchorLevel: input.anchorLevel || 'community_correspondent',
      stories: selected.map((item) => ({
        itemId: item.id,
        lane: item.lane,
        headline: item.headline,
        source: item.sourceName,
        verificationStatus: item.verificationStatus,
        confidence: item.confidence,
        freshness: item.freshness,
        scriptLine: `${item.headline}. Source: ${item.sourceName}.`
      })),
      publishBlocked: selected.some((item) => !['verified', 'confirmed', 'official'].includes(item.verificationStatus)),
      createdAt: new Date().toISOString()
    };
  }

  function routeItem(id) {
    const item = items.get(id);
    if (!item) throw new Error('ITEM_NOT_FOUND');
    return {
      itemId: item.id,
      lane: item.lane,
      live: item.live,
      routes: item.purposes.map((purpose) => ({
        purpose,
        allowed: item.live || purpose === 'newsroom',
        reason: item.live ? 'verified_live_signal' : purpose === 'newsroom' ? 'editorial_queue_only' : 'verification_required'
      }))
    };
  }

  function listItems(filters = {}) {
    return [...items.values()].filter((item) =>
      (!filters.region || item.region === filters.region) &&
      (!filters.lane || item.lane === filters.lane) &&
      (!filters.purpose || item.purposes.includes(filters.purpose)) &&
      (!filters.category || item.category === filters.category) &&
      (!filters.verificationStatus || item.verificationStatus === filters.verificationStatus) &&
      (filters.live === undefined || item.live === Boolean(filters.live))
    );
  }

  return {
    registerSource,
    approveSource,
    activateSource,
    listSources,
    ingest,
    submitCommunityReport,
    reviewItem,
    createAnchorScript,
    routeItem,
    listItems,
    freshnessScore,
    confidenceScore
  };
}

module.exports = { createOmniNewsOracleManager, freshnessScore, confidenceScore };
