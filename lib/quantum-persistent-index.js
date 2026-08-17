'use strict';

const { makeIndexDocument } = require('./quantum-index-store');

function env(name) { return String(process.env[name] || '').trim(); }
function supabaseBase() { return env('SUPABASE_URL') || env('NEXT_PUBLIC_SUPABASE_URL') || env('VITE_SUPABASE_URL'); }
function serviceKey() { return env('SUPABASE_SERVICE_ROLE_KEY'); }

async function rest(path, options = {}) {
  const base = supabaseBase(); const key = serviceKey();
  if (!base || !key) throw new Error('quantum_index_storage_not_configured');
  const response = await fetch(`${base.replace(/\/$/,'')}/rest/v1/${path}`, {
    ...options,
    headers: { apikey:key, authorization:`Bearer ${key}`, 'content-type':'application/json', prefer:'return=representation', ...(options.headers||{}) }
  });
  if (!response.ok) throw new Error(`quantum_index_storage_${response.status}`);
  const text = await response.text(); return text ? JSON.parse(text) : null;
}

async function upsertDocument(input) {
  const d = makeIndexDocument(input);
  const rows = await rest('quantum_documents?on_conflict=canonical_url,content_hash', {
    method:'POST',
    headers:{ prefer:'resolution=merge-duplicates,return=representation' },
    body:JSON.stringify({ canonical_url:d.canonicalUrl, source_url:d.url, title:d.title, body:d.text, language:d.language, source_type:d.sourceType, captured_at:d.capturedAt, content_hash:d.contentHash, provenance:d.provenance, safety:d.safety })
  });
  return rows && rows[0];
}

async function approveDocument(id) {
  return rest(`quantum_documents?id=eq.${encodeURIComponent(id)}`, { method:'PATCH', body:JSON.stringify({ safety:{status:'approved'}, indexed_at:new Date().toISOString() }) });
}

async function lexicalSearch(query, limit=20) {
  const q = encodeURIComponent(query);
  return rest(`quantum_documents?select=id,canonical_url,source_url,title,body,source_type,captured_at,provenance&safety->>status=eq.approved&search_vector=fts.${q}&order=captured_at.desc&limit=${Math.min(Math.max(limit,1),100)}`);
}

async function hybridSearch(query, embedding=null, limit=20) {
  const base = supabaseBase(); const key = serviceKey();
  if (!base || !key) throw new Error('quantum_index_storage_not_configured');
  const response = await fetch(`${base.replace(/\/$/,'')}/rest/v1/rpc/quantum_hybrid_search`, { method:'POST', headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json'}, body:JSON.stringify({query_text:query,query_embedding:embedding,match_count:limit}) });
  if (!response.ok) throw new Error(`quantum_hybrid_search_${response.status}`);
  return response.json();
}

module.exports={ upsertDocument, approveDocument, lexicalSearch, hybridSearch };
