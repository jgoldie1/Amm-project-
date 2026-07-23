const crypto = require('crypto');

function createServicesHubManager({ servicesManifest, io }) {
  const requests = [];
  const serviceIds = new Set(servicesManifest.services.map((service) => service.id));

  function createRequest(input = {}) {
    const serviceId = String(input.serviceId || '');
    if (!serviceIds.has(serviceId)) throw new Error('UNKNOWN_SERVICE');
    const request = {
      id: crypto.randomUUID(),
      serviceId,
      userId: input.userId || 'anonymous',
      type: input.type || 'general',
      payload: input.payload || {},
      status: 'created',
      estimatedCredits: Number.isFinite(Number(input.estimatedCredits)) ? Number(input.estimatedCredits) : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      providerReference: null,
      audit: [{ event: 'created', at: new Date().toISOString() }],
    };
    requests.unshift(request);
    if (requests.length > 5000) requests.length = 5000;
    io?.emit('services:request', request);
    return request;
  }

  function getRequest(id) {
    return requests.find((request) => request.id === id) || null;
  }

  function updateRequest(id, patch = {}) {
    const request = getRequest(id);
    if (!request) return null;
    const allowed = ['status', 'providerReference', 'estimatedCredits'];
    for (const key of allowed) {
      if (patch[key] !== undefined) request[key] = patch[key];
    }
    request.updatedAt = new Date().toISOString();
    request.audit.push({ event: 'updated', status: request.status, at: request.updatedAt });
    io?.emit('services:update', request);
    return request;
  }

  function listRequests(serviceId) {
    return serviceId ? requests.filter((request) => request.serviceId === serviceId) : requests;
  }

  return { createRequest, getRequest, updateRequest, listRequests };
}

module.exports = { createServicesHubManager };
