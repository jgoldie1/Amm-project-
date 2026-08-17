'use strict';
const fs=require('fs');const path=require('path');
const sql=fs.readFileSync(path.join(__dirname,'../supabase/migrations/20260817_quantum_index.sql'),'utf8');
const js=fs.readFileSync(path.join(__dirname,'../lib/quantum-persistent-index.js'),'utf8');
function ok(v,m){if(!v)throw new Error(m)}
ok(sql.includes('create extension if not exists vector'),'pgvector extension missing');
ok(sql.includes('using gin(search_vector)'),'full-text GIN index missing');
ok(sql.includes('using hnsw (embedding vector_cosine_ops)'),'HNSW vector index missing');
ok(sql.includes("(safety->>'status') = 'approved'"),'approved-content gate missing');
ok(sql.includes('quantum_hybrid_search'),'hybrid search RPC missing');
ok(js.includes('SUPABASE_SERVICE_ROLE_KEY'),'server-only persistence credential missing');
ok(js.includes('upsertDocument')&&js.includes('hybridSearch'),'persistence/search API missing');
console.log('QUANTUM PERSISTENT INDEX SMOKE: PASS');
