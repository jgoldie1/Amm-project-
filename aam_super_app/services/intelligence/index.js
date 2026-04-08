const { loadJson, saveJson } = require('../../shared/store');
const { ok, fail } = require('../../shared/http');
const { now } = require('../../shared/utils');

const TRACK_FILE = 'data/tracks.json';
const STREAM_FILE = 'data/streams.json';
const TX_FILE = 'data/transactions.json';
const MEMORY_FILE = 'data/creator_memory.json';

function getTracks() { return loadJson(TRACK_FILE, {}); }
function getStreams() { return loadJson(STREAM_FILE, []); }
function getTxs() { return loadJson(TX_FILE, []); }
function getMemory() { return loadJson(MEMORY_FILE, {}); }
function saveMemory(memory) { saveJson(MEMORY_FILE, memory); }

exports.myInsights = (req, res) => {
  const userId = req.user.userId;
  const tracks = Object.values(getTracks()).filter(t => t.artistId === userId);
  const streams = getStreams().filter(s => s.artistId === userId);
  const txs = getTxs().filter(t => t.userId === userId || t.creatorId === userId || t.toUser === userId || t.fromUser === userId);

  const qualifiedStreams = streams.filter(s => s.qualified).length;
  const totalPayout = streams.reduce((acc, s) => acc + Number(s.payout || 0), 0);
  const totalDeposits = txs.filter(t => t.type === 'deposit').reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const suggestions = [];
  if (tracks.length === 0) suggestions.push('Upload your first track to start collecting streaming data.');
  if (tracks.length > 0 && streams.length === 0) suggestions.push('Promote your tracks to start generating stream activity.');
  if (qualifiedStreams < streams.length) suggestions.push('Increase verified listening and reduce repeat-loop behavior to improve qualified streams.');
  if (totalPayout === 0 && streams.length > 0) suggestions.push('Focus on higher-retention plays so more streams qualify for payout.');
  if (suggestions.length === 0) suggestions.push('Your creator account is active. Keep uploading, promoting, and monitoring payout quality.');

  return ok(res, {
    insights: {
      totalTracks: tracks.length,
      totalStreams: streams.length,
      qualifiedStreams,
      totalPayout,
      totalDeposits
    },
    suggestions
  });
};

exports.saveNote = (req, res) => {
  const userId = req.user.userId;
  const note = String(req.body.note || '').trim();
  if (!note) return fail(res, 400, 'note_required');
  if (note.length > 1000) return fail(res, 400, 'note_too_long');

  const memory = getMemory();
  if (!memory[userId]) memory[userId] = [];
  memory[userId].push({ note, createdAt: now() });
  saveMemory(memory);

  return ok(res, { count: memory[userId].length, notes: memory[userId] });
};

exports.myNotes = (req, res) => {
  const userId = req.user.userId;
  const memory = getMemory();
  return ok(res, { count: (memory[userId] || []).length, notes: memory[userId] || [] });
};

exports.myTransactions = (req, res) => {
  const userId = req.user.userId;
  const txs = getTxs().filter(t => t.userId === userId || t.creatorId === userId || t.toUser === userId || t.fromUser === userId);
  return ok(res, { count: txs.length, transactions: txs });
};
