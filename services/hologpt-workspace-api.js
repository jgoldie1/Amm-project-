'use strict';

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const router = express.Router();
const MAX_FILE_BYTES = Number(process.env.HOLOGPT_MAX_FILE_BYTES || 25 * 1024 * 1024);
const ALLOWED_MIME = new Set([
  'image/png','image/jpeg','image/webp','image/gif','application/pdf',
  'text/plain','text/markdown','text/csv','application/json','application/xml','text/xml',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'audio/mpeg','audio/wav','audio/mp4','video/mp4','video/webm','application/zip'
]);

function clients() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) return null;
  return {
    auth: createClient(url, anon, { auth: { persistSession: false } }),
    admin: createClient(url, service, { auth: { persistSession: false } })
  };
}

async function requireUser(req, res, next) {
  try {
    const configured = clients();
    if (!configured) return res.status(503).json({ error: 'Supabase is not configured.' });
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return res.status(401).json({ error: 'Authentication is required.' });
    const { data, error } = await configured.auth.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired session.' });
    req.holoUser = data.user;
    req.holoDb = configured.admin;
    next();
  } catch (error) { next(error); }
}

function safeName(value) {
  return String(value || 'file').normalize('NFKC').replace(/[^a-zA-Z0-9._ -]/g, '_').replace(/\s+/g, '-').slice(0, 120);
}

router.get('/status', (req, res) => res.json({
  configured: Boolean(clients()),
  maxFileBytes: MAX_FILE_BYTES,
  acceptedMimeTypes: [...ALLOWED_MIME],
  features: ['signed-upload','file-library','threads','messages','analysis-jobs','delete','export-metadata']
}));

router.use(requireUser);

router.post('/uploads/sign', async (req, res, next) => {
  try {
    const filename = safeName(req.body.filename);
    const mimeType = String(req.body.mimeType || '').toLowerCase();
    const sizeBytes = Number(req.body.sizeBytes || 0);
    if (!ALLOWED_MIME.has(mimeType)) return res.status(415).json({ error: 'Unsupported file type.' });
    if (!Number.isFinite(sizeBytes) || sizeBytes < 1 || sizeBytes > MAX_FILE_BYTES) {
      return res.status(413).json({ error: `File must be between 1 byte and ${MAX_FILE_BYTES} bytes.` });
    }
    const fileId = crypto.randomUUID();
    const objectPath = `${req.holoUser.id}/${fileId}/${filename}`;
    const { data, error } = await req.holoDb.storage.from('hologpt-files').createSignedUploadUrl(objectPath);
    if (error) throw error;
    res.status(201).json({ fileId, objectPath, token: data.token, signedUrl: data.signedUrl, filename, mimeType, sizeBytes });
  } catch (error) { next(error); }
});

router.post('/uploads/complete', async (req, res, next) => {
  try {
    const record = {
      id: String(req.body.fileId || crypto.randomUUID()),
      owner_id: req.holoUser.id,
      object_path: String(req.body.objectPath || ''),
      filename: safeName(req.body.filename),
      mime_type: String(req.body.mimeType || ''),
      size_bytes: Number(req.body.sizeBytes || 0),
      status: 'uploaded',
      metadata: req.body.metadata && typeof req.body.metadata === 'object' ? req.body.metadata : {}
    };
    if (!record.object_path.startsWith(`${req.holoUser.id}/`)) return res.status(403).json({ error: 'Invalid object ownership.' });
    const { data, error } = await req.holoDb.from('hologpt_files').insert(record).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) { next(error); }
});

router.get('/files', async (req, res, next) => {
  try {
    const { data, error } = await req.holoDb.from('hologpt_files').select('*').eq('owner_id', req.holoUser.id).order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    res.json(data || []);
  } catch (error) { next(error); }
});

router.delete('/files/:id', async (req, res, next) => {
  try {
    const { data: file, error: findError } = await req.holoDb.from('hologpt_files').select('*').eq('id', req.params.id).eq('owner_id', req.holoUser.id).single();
    if (findError || !file) return res.status(404).json({ error: 'File not found.' });
    const { error: storageError } = await req.holoDb.storage.from('hologpt-files').remove([file.object_path]);
    if (storageError) throw storageError;
    const { error } = await req.holoDb.from('hologpt_files').delete().eq('id', file.id).eq('owner_id', req.holoUser.id);
    if (error) throw error;
    res.sendStatus(204);
  } catch (error) { next(error); }
});

router.post('/threads', async (req, res, next) => {
  try {
    const { data, error } = await req.holoDb.from('hologpt_threads').insert({ owner_id: req.holoUser.id, title: String(req.body.title || 'New HoloGPT conversation').slice(0, 160) }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) { next(error); }
});

router.get('/threads', async (req, res, next) => {
  try {
    const { data, error } = await req.holoDb.from('hologpt_threads').select('*').eq('owner_id', req.holoUser.id).order('updated_at', { ascending: false }).limit(100);
    if (error) throw error;
    res.json(data || []);
  } catch (error) { next(error); }
});

router.post('/threads/:threadId/messages', async (req, res, next) => {
  try {
    const content = String(req.body.content || '').trim();
    if (!content) return res.status(400).json({ error: 'Message content is required.' });
    const { data: thread } = await req.holoDb.from('hologpt_threads').select('id').eq('id', req.params.threadId).eq('owner_id', req.holoUser.id).single();
    if (!thread) return res.status(404).json({ error: 'Conversation not found.' });
    const attachmentIds = Array.isArray(req.body.attachmentIds) ? req.body.attachmentIds.slice(0, 20) : [];
    const { data, error } = await req.holoDb.from('hologpt_messages').insert({ owner_id: req.holoUser.id, thread_id: thread.id, role: 'user', content, attachment_ids: attachmentIds }).select().single();
    if (error) throw error;
    await req.holoDb.from('hologpt_threads').update({ updated_at: new Date().toISOString() }).eq('id', thread.id);
    res.status(201).json(data);
  } catch (error) { next(error); }
});

router.get('/threads/:threadId/messages', async (req, res, next) => {
  try {
    const { data, error } = await req.holoDb.from('hologpt_messages').select('*').eq('thread_id', req.params.threadId).eq('owner_id', req.holoUser.id).order('created_at', { ascending: true }).limit(500);
    if (error) throw error;
    res.json(data || []);
  } catch (error) { next(error); }
});

router.post('/analysis-jobs', async (req, res, next) => {
  try {
    const fileIds = Array.isArray(req.body.fileIds) ? req.body.fileIds.slice(0, 20) : [];
    const task = String(req.body.task || 'summarize').slice(0, 80);
    const prompt = String(req.body.prompt || '').slice(0, 8000);
    const { data: ownedFiles, error: filesError } = await req.holoDb.from('hologpt_files').select('id').in('id', fileIds.length ? fileIds : ['00000000-0000-0000-0000-000000000000']).eq('owner_id', req.holoUser.id);
    if (filesError) throw filesError;
    if (ownedFiles.length !== fileIds.length) return res.status(403).json({ error: 'One or more files are unavailable.' });
    const { data, error } = await req.holoDb.from('hologpt_analysis_jobs').insert({ owner_id: req.holoUser.id, thread_id: req.body.threadId || null, task, prompt, file_ids: fileIds, status: 'queued' }).select().single();
    if (error) throw error;
    res.status(202).json(data);
  } catch (error) { next(error); }
});

router.get('/analysis-jobs/:id', async (req, res, next) => {
  try {
    const { data, error } = await req.holoDb.from('hologpt_analysis_jobs').select('*').eq('id', req.params.id).eq('owner_id', req.holoUser.id).single();
    if (error || !data) return res.status(404).json({ error: 'Analysis job not found.' });
    res.json(data);
  } catch (error) { next(error); }
});

module.exports = router;
