'use strict';

function createQuantumSandboxStore({ supabaseUrl, supabaseAnonKey, fetchImpl = fetch } = {}) {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase configuration required');
  const base = supabaseUrl.replace(/\/$/, '');

  async function request(path, { method = 'GET', token, body } = {}) {
    const response = await fetchImpl(`${base}/rest/v1/${path}`, {
      method,
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`SUPABASE_REQUEST_FAILED:${response.status}:${text.slice(0,300)}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  return {
    async createJob(job, token) {
      const rows = await request('quantum_sandbox_jobs', {
        method: 'POST', token,
        body: {
          id: job.id,
          owner_id: job.ownerId,
          tenant_id: job.tenantId,
          provider_id: job.providerId,
          backend_id: job.backendId,
          execution_type: job.executionType,
          state: job.state,
          workload: job.workload || {},
          estimated_cost_usd: job.estimatedCostUsd || 0,
          provenance: job.provenance || {}
        }
      });
      return rows?.[0] || null;
    },
    async listJobs(ownerId, token) {
      return await request(`quantum_sandbox_jobs?owner_id=eq.${encodeURIComponent(ownerId)}&order=created_at.desc`, { token });
    },
    async getJob(id, ownerId, token) {
      const rows = await request(`quantum_sandbox_jobs?id=eq.${encodeURIComponent(id)}&owner_id=eq.${encodeURIComponent(ownerId)}&limit=1`, { token });
      return rows?.[0] || null;
    },
    async updateJob(job, ownerId, token) {
      const rows = await request(`quantum_sandbox_jobs?id=eq.${encodeURIComponent(job.id)}&owner_id=eq.${encodeURIComponent(ownerId)}`, {
        method: 'PATCH', token,
        body: {
          state: job.state,
          provider_job_id: job.providerJobId || null,
          submitted_at: job.submittedAt || null,
          updated_at: new Date().toISOString(),
          provenance: job.provenance || {}
        }
      });
      return rows?.[0] || null;
    }
  };
}

module.exports = { createQuantumSandboxStore };
