const crypto = require('crypto');

function createOmniCare360Manager({ manifest, io }) {
  const cases = [];

  function createCase(input = {}) {
    const caseRecord = {
      id: crypto.randomUUID(),
      userId: input.userId || 'anonymous',
      category: input.category || 'care-navigation',
      summary: String(input.summary || '').slice(0, 2000),
      preferredLanguage: input.preferredLanguage || 'en',
      accessibilityNeeds: Array.isArray(input.accessibilityNeeds) ? input.accessibilityNeeds.slice(0, 20) : [],
      urgency: input.urgency || 'routine',
      status: 'submitted',
      assignedRoute: null,
      licensedPartnerRequired: true,
      aiSupportAllowed: true,
      aiSummary: null,
      appointments: [],
      transportNeeds: [],
      documents: [],
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    cases.unshift(caseRecord);
    io?.emit('omnicare:case-created', caseRecord);
    return caseRecord;
  }

  function listCases() { return cases; }
  function getCase(id) { return cases.find((item) => item.id === id) || null; }

  function updateCase(id, patch = {}) {
    const item = getCase(id);
    if (!item) return null;
    const allowed = ['status', 'assignedRoute', 'aiSummary'];
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(patch, key)) item[key] = patch[key];
    item.updatedAt = new Date().toISOString();
    io?.emit('omnicare:case-updated', item);
    return item;
  }

  function addAppointment(id, appointment = {}) {
    const item = getCase(id);
    if (!item) return null;
    item.appointments.push({ id: crypto.randomUUID(), ...appointment, createdAt: new Date().toISOString() });
    item.updatedAt = new Date().toISOString();
    return item;
  }

  function addTransportNeed(id, transport = {}) {
    const item = getCase(id);
    if (!item) return null;
    item.transportNeeds.push({ id: crypto.randomUUID(), ...transport, createdAt: new Date().toISOString() });
    item.updatedAt = new Date().toISOString();
    return item;
  }

  return { manifest, createCase, listCases, getCase, updateCase, addAppointment, addTransportNeed };
}

module.exports = { createOmniCare360Manager };
