const crypto = require('crypto');

function createDnaProtectionManager({ manifest, io }) {
  const records = new Map();
  const hashIndex = new Map();
  const perceptualIndex = new Map();

  function now(){ return new Date().toISOString(); }
  function emit(event,payload){ if(io) io.emit(event,payload); }
  function clean(v,max=1000){ return typeof v === 'string' ? v.trim().slice(0,max) : ''; }
  function stableHash(payload){ return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'); }

  function register(input={}) {
    const assetId = clean(input.assetId,160); const ownerId = clean(input.ownerId,160);
    if(!assetId || !ownerId) throw new Error('assetId and ownerId are required');
    const contentHash = clean(input.contentHash,256) || stableHash({assetId,ownerId,sourceRef:input.sourceRef||null,version:input.version||'1.0.0'});
    if(hashIndex.has(contentHash)) throw new Error('EXACT_DUPLICATE_HASH');
    const perceptualFingerprint = clean(input.perceptualFingerprint,512) || null;
    const parentDnaId = clean(input.parentDnaId,160) || null;
    if(parentDnaId && !records.has(parentDnaId)) throw new Error('UNKNOWN_PARENT_DNA');
    const record = {
      id: crypto.randomUUID(), assetId, ownerId, contentHash, perceptualFingerprint,
      version: clean(input.version,80) || '1.0.0', parentDnaId,
      lineageRootId: parentDnaId ? (records.get(parentDnaId).lineageRootId || parentDnaId) : null,
      rightsSignature: input.rightsSignature || {}, aiDisclosure: clean(input.aiDisclosure,2000) || null,
      sourceRef: clean(input.sourceRef,1000) || null, status:'verified-foundation', createdAt:now(), updatedAt:now(),
      verification: { exactHashVerified:true, perceptualChecked:Boolean(perceptualFingerprint), provenanceChecked:false, ownershipChecked:false }
    };
    if(!record.lineageRootId) record.lineageRootId = record.id;
    records.set(record.id, record); hashIndex.set(contentHash, record.id);
    if(perceptualFingerprint) perceptualIndex.set(perceptualFingerprint, record.id);
    emit('dna-protection:registered', record); return record;
  }

  function get(id){ return records.get(id)||null; }
  function verify(input={}){
    const contentHash = clean(input.contentHash,256); const perceptualFingerprint = clean(input.perceptualFingerprint,512);
    const exactId = contentHash ? hashIndex.get(contentHash) : null;
    const perceptualId = perceptualFingerprint ? perceptualIndex.get(perceptualFingerprint) : null;
    return { exactMatch: exactId ? get(exactId) : null, perceptualMatch: perceptualId ? get(perceptualId) : null };
  }
  function attest(id,input={}){
    const record=get(id); if(!record) return null;
    record.verification = { ...record.verification, provenanceChecked: Boolean(input.provenanceChecked), ownershipChecked: Boolean(input.ownershipChecked), attestedBy: clean(input.attestedBy,160)||null, attestedAt: now() };
    record.updatedAt=now(); emit('dna-protection:attested',record); return record;
  }
  function lineage(id){ const record=get(id); if(!record) return []; return Array.from(records.values()).filter(r=>r.lineageRootId===record.lineageRootId).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)); }
  function canPublish(id){ const r=get(id); return Boolean(r && r.verification.exactHashVerified && r.verification.provenanceChecked && r.verification.ownershipChecked); }
  function report(){ return { records: records.size, exactFingerprints: hashIndex.size, perceptualFingerprints: perceptualIndex.size, publishReady: Array.from(records.values()).filter(r=>canPublish(r.id)).length }; }
  return { register,get,verify,attest,lineage,canPublish,report };
}
module.exports={createDnaProtectionManager};
