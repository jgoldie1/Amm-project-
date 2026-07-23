const crypto = require('crypto');

function createEconomicOpportunityManager({ manifest, io }) {
  const records = [];

  function getDomain(id) {
    return manifest.domains.find((item) => item.id === id) || null;
  }

  function create(input = {}) {
    const domain = getDomain(input.domainId);
    if (!domain) throw new Error('UNKNOWN_DOMAIN');
    const record = {
      id: crypto.randomUUID(),
      domainId: domain.id,
      userId: input.userId || 'anonymous',
      type: input.type || 'general-request',
      title: String(input.title || 'Untitled request').slice(0, 200),
      details: String(input.details || '').slice(0, 5000),
      status: 'submitted',
      productionGates: domain.productionGates || [],
      complianceReviewRequired: Boolean((domain.productionGates || []).length),
      assignedTo: null,
      outcome: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.unshift(record);
    io?.emit('economic-opportunity:created', record);
    return record;
  }

  function list(domainId) {
    return domainId ? records.filter((r) => r.domainId === domainId) : records;
  }

  function get(id) {
    return records.find((r) => r.id === id) || null;
  }

  function update(id, patch = {}) {
    const record = get(id);
    if (!record) return null;
    const allowed = ['status', 'assignedTo', 'outcome'];
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(patch, key)) record[key] = patch[key];
    record.updatedAt = new Date().toISOString();
    io?.emit('economic-opportunity:update', record);
    return record;
  }

  return { getDomain, create, list, get, update };
}

module.exports = { createEconomicOpportunityManager };
