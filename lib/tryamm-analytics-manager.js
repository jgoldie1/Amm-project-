const crypto = require('crypto');

function createTryAmmAnalyticsManager({ manifest, io }) {
  const events = [];
  const leads = new Map();
  const now = () => new Date().toISOString();
  const clean = (v, n=500) => typeof v === 'string' ? v.slice(0,n) : v;

  function track(input = {}) {
    if (!manifest.eventFamilies.includes(input.event)) throw new Error('UNKNOWN_EVENT');
    const event = {
      id: crypto.randomUUID(),
      event: input.event,
      at: now(),
      anonymousId: clean(input.anonymousId,160) || null,
      userId: clean(input.userId,160) || null,
      sessionId: clean(input.sessionId,160) || null,
      surface: clean(input.surface,120) || 'web',
      page: clean(input.page,500) || null,
      referrer: clean(input.referrer,1000) || null,
      utm: input.utm || {},
      source: clean(input.source,160) || null,
      campaignId: clean(input.campaignId,160) || null,
      creatorId: clean(input.creatorId,160) || null,
      productId: clean(input.productId,160) || null,
      assetDnaId: clean(input.assetDnaId,160) || null,
      gameId: clean(input.gameId,160) || null,
      valueUsd: Number.isFinite(Number(input.valueUsd)) ? Number(input.valueUsd) : null,
      metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {}
    };
    events.unshift(event);
    if (events.length > 50000) events.length = 50000;
    if (io) io.emit('tryamm-analytics:event', event);
    return event;
  }

  function createLead(input = {}) {
    const email = clean(input.email,320);
    if (!email) throw new Error('EMAIL_REQUIRED');
    const lead = { id: crypto.randomUUID(), email, name: clean(input.name,160)||null, interest: clean(input.interest,200)||null, source: clean(input.source,160)||null, utm: input.utm||{}, consent: Boolean(input.consent), createdAt: now(), status: 'new' };
    leads.set(lead.id, lead);
    track({ event:'lead_created', surface: input.surface||'web', source: lead.source, utm: lead.utm, metadata:{ leadId: lead.id, interest: lead.interest } });
    return lead;
  }

  function summary() {
    const counts = {};
    let revenue = 0;
    for (const e of events) { counts[e.event]=(counts[e.event]||0)+1; if (typeof e.valueUsd==='number') revenue += e.valueUsd; }
    return { events: events.length, leads: leads.size, revenueAttributedUsd: Number(revenue.toFixed(2)), counts };
  }

  return { track, createLead, summary, listEvents: (limit=100) => events.slice(0, Math.min(Number(limit)||100,1000)) };
}
module.exports = { createTryAmmAnalyticsManager };
