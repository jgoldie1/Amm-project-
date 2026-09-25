const crypto = require('crypto');

function createOmniNewsOracleManager() {
  const sources = new Map();
  const items = new Map();
  const submissions = new Map();

  function registerSource(input = {}) {
    if (!input.name || !input.type) throw new Error('SOURCE_NAME_AND_TYPE_REQUIRED');
    const id = crypto.randomUUID();
    const source = {
      id,
      name: input.name,
      type: input.type,
      baseUrl: input.baseUrl || null,
      region: input.region || 'global',
      categories: input.categories || [],
      license: {
        plan: input.license?.plan || null,
        commercialUse: Boolean(input.license?.commercialUse),
        redistributionAllowed: Boolean(input.license?.redistributionAllowed),
        fullContentAllowed: Boolean(input.license?.fullContentAllowed),
        attributionRequired: input.license?.attributionRequired !== false,
        termsUrl: input.license?.termsUrl || null,
        reviewedAt: input.license?.reviewedAt || null
      },
      rateLimit: input.rateLimit || null,
      enabled: false,
      createdAt: new Date().toISOString()
    };
    sources.set(id, source);
    return source;
  }

  function approveSource(id) {
    const source = sources.get(id);
    if (!source) throw new Error('SOURCE_NOT_FOUND');
    if (!source.license.commercialUse) throw new Error('COMMERCIAL_LICENSE_REQUIRED');
    if (!source.license.reviewedAt) throw new Error('LICENSE_REVIEW_REQUIRED');
    source.enabled = true;
    source.approvedAt = new Date().toISOString();
    return source;
  }

  function listSources() { return [...sources.values()]; }

  function ingest(input = {}) {
    const source = sources.get(input.sourceId);
    if (!source || !source.enabled) throw new Error('APPROVED_SOURCE_REQUIRED');
    if (!input.headline || !input.url) throw new Error('HEADLINE_AND_URL_REQUIRED');
    const fingerprint = String(input.canonicalUrl || input.url).toLowerCase();
    const duplicate = [...items.values()].find((x) => x.fingerprint === fingerprint);
    if (duplicate) return { duplicate: true, item: duplicate };
    const id = crypto.randomUUID();
    const item = {
      id,
      sourceId: source.id,
      sourceName: source.name,
      sourceType: source.type,
      headline: input.headline,
      summary: input.summary || '',
      url: input.url,
      canonicalUrl: input.canonicalUrl || input.url,
      fingerprint,
      publishedAt: input.publishedAt || null,
      providerTimestamp: input.providerTimestamp || null,
      region: input.region || source.region,
      category: input.category || 'general',
      author: input.author || null,
      mediaUrl: source.license.fullContentAllowed ? (input.mediaUrl || null) : null,
      attributionRequired: source.license.attributionRequired,
      verificationStatus: 'ingested',
      editorialStatus: 'queued',
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
      headline: input.headline,
      description: input.description,
      location: input.location || null,
      evidence: input.evidence || [],
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
    item.reviewedAt = new Date().toISOString();
    return item;
  }

  function createAnchorScript(input = {}) {
    const selected = (input.itemIds || []).map((id) => items.get(id)).filter(Boolean);
    return {
      id: crypto.randomUUID(),
      title: input.title || 'OmniNews Brief',
      scope: input.scope || 'local',
      anchorLevel: input.anchorLevel || 'community_correspondent',
      stories: selected.map((item) => ({
        itemId: item.id,
        headline: item.headline,
        source: item.sourceName,
        verificationStatus: item.verificationStatus,
        scriptLine: `${item.headline}. Source: ${item.sourceName}.`
      })),
      publishBlocked: selected.some((item) => !['verified', 'confirmed'].includes(item.verificationStatus)),
      createdAt: new Date().toISOString()
    };
  }

  function listItems(filters = {}) {
    return [...items.values()].filter((item) =>
      (!filters.region || item.region === filters.region) &&
      (!filters.category || item.category === filters.category) &&
      (!filters.verificationStatus || item.verificationStatus === filters.verificationStatus)
    );
  }

  return { registerSource, approveSource, listSources, ingest, submitCommunityReport, reviewItem, createAnchorScript, listItems };
}

module.exports = { createOmniNewsOracleManager };
