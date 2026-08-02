'use strict';

function ensureQueue(store) {
  if (!Array.isArray(store.persistenceRetryQueue)) store.persistenceRetryQueue = [];
  return store.persistenceRetryQueue;
}

function createPersistenceRetryQueue({ getStore, saveStore, id }) {
  async function enqueue({ table, record, onConflict, error }) {
    const store = getStore();
    const queue = ensureQueue(store);
    const existing = queue.find(item => item.table === table && item.record?.id && item.record.id === record?.id && item.status !== 'resolved');
    if (existing) {
      existing.attempts += 1;
      existing.lastError = String(error || 'unknown persistence failure');
      existing.updatedAt = new Date().toISOString();
      await saveStore();
      return existing;
    }
    const item = {
      id: id('retry'),
      table,
      record,
      onConflict: onConflict || null,
      status: 'pending',
      attempts: 1,
      lastError: String(error || 'unknown persistence failure'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    queue.push(item);
    await saveStore();
    return item;
  }

  function summary() {
    const queue = ensureQueue(getStore());
    return {
      pending: queue.filter(item => item.status === 'pending').length,
      processing: queue.filter(item => item.status === 'processing').length,
      resolved: queue.filter(item => item.status === 'resolved').length,
      failed: queue.filter(item => item.status === 'failed').length,
      total: queue.length
    };
  }

  return { enqueue, summary, ensureQueue: () => ensureQueue(getStore()) };
}

module.exports = { createPersistenceRetryQueue };
