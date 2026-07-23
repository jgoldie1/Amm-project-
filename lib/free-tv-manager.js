const crypto = require('crypto');

function createFreeTvManager() {
  const titles = new Map();
  const watchlists = new Map();
  const progress = new Map();
  const channels = new Map();

  function createTitle(input = {}) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const title = {
      id,
      ownerId: input.ownerId || 'creator-demo',
      type: input.type || 'movie',
      title: String(input.title || 'Untitled').slice(0, 200),
      description: String(input.description || '').slice(0, 5000),
      lane: input.lane || 'general',
      status: 'draft',
      territories: Array.isArray(input.territories) ? input.territories : ['US'],
      monetization: input.monetization || 'AVOD',
      assets: { master: null, trailer: null, poster: null, captions: [] },
      rights: {
        ownershipDeclaration: false,
        participantReleases: 'missing',
        musicRights: 'missing',
        footageRights: 'missing',
        locationReleases: 'missing',
        territoryRights: 'missing'
      },
      review: { technicalQc: 'not_started', compliance: 'not_started', moderation: 'not_started' },
      publish: { eligible: false, reasons: [] },
      createdAt: now,
      updatedAt: now
    };
    titles.set(id, title);
    return title;
  }

  function getTitle(id) { return titles.get(id) || null; }
  function listTitles() { return [...titles.values()]; }

  function updateTitle(id, patch = {}) {
    const title = titles.get(id);
    if (!title) return null;
    if (patch.title) title.title = String(patch.title).slice(0, 200);
    if (patch.description !== undefined) title.description = String(patch.description).slice(0, 5000);
    if (patch.lane) title.lane = patch.lane;
    if (Array.isArray(patch.territories)) title.territories = patch.territories;
    if (patch.monetization) title.monetization = patch.monetization;
    if (patch.assets) title.assets = { ...title.assets, ...patch.assets };
    if (patch.rights) title.rights = { ...title.rights, ...patch.rights };
    if (patch.review) title.review = { ...title.review, ...patch.review };
    title.updatedAt = new Date().toISOString();
    evaluatePublishEligibility(title);
    return title;
  }

  function evaluatePublishEligibility(title) {
    const reasons = [];
    if (!title.assets.master) reasons.push('master_missing');
    if (!title.assets.poster) reasons.push('poster_missing');
    if (!title.rights.ownershipDeclaration) reasons.push('ownership_declaration_missing');
    for (const [key, value] of Object.entries(title.rights)) {
      if (key === 'ownershipDeclaration') continue;
      if (value !== 'approved' && value !== 'not_applicable') reasons.push(`rights_${key}_${value}`);
    }
    if (title.review.technicalQc !== 'passed') reasons.push('technical_qc_not_passed');
    if (title.review.compliance !== 'passed') reasons.push('compliance_not_passed');
    if (title.review.moderation !== 'passed') reasons.push('moderation_not_passed');
    title.publish = { eligible: reasons.length === 0, reasons };
    return title.publish;
  }

  function publishTitle(id) {
    const title = titles.get(id);
    if (!title) return null;
    evaluatePublishEligibility(title);
    if (!title.publish.eligible) return { ok: false, title };
    title.status = 'published';
    title.publishedAt = new Date().toISOString();
    title.updatedAt = title.publishedAt;
    return { ok: true, title };
  }

  function addToWatchlist(userId, titleId) {
    const set = watchlists.get(userId) || new Set();
    set.add(titleId);
    watchlists.set(userId, set);
    return [...set];
  }

  function saveProgress(userId, titleId, positionSeconds = 0, durationSeconds = 0) {
    const key = `${userId}:${titleId}`;
    const item = { userId, titleId, positionSeconds: Math.max(0, Number(positionSeconds) || 0), durationSeconds: Math.max(0, Number(durationSeconds) || 0), updatedAt: new Date().toISOString() };
    progress.set(key, item);
    return item;
  }

  function createChannel(input = {}) {
    const id = crypto.randomUUID();
    const channel = { id, name: String(input.name || 'New Channel').slice(0, 120), lane: input.lane || 'general', schedule: [], status: 'draft', createdAt: new Date().toISOString() };
    channels.set(id, channel);
    return channel;
  }

  function setSchedule(channelId, schedule = []) {
    const channel = channels.get(channelId);
    if (!channel) return null;
    channel.schedule = Array.isArray(schedule) ? schedule.slice(0, 500) : [];
    return channel;
  }

  return { createTitle, getTitle, listTitles, updateTitle, evaluatePublishEligibility, publishTitle, addToWatchlist, saveProgress, createChannel, setSchedule };
}

module.exports = { createFreeTvManager };
