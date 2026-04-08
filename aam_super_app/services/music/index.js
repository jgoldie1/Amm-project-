const { id, now } = require('../../shared/utils');
const { loadJson, saveJson } = require('../../shared/store');
const { ok, fail, num } = require('../../shared/http');
const { getConfig } = require('../../shared/config');
const { appendAudit } = require('../../shared/audit');

const TRACK_FILE = 'data/tracks.json';
const STREAM_FILE = 'data/streams.json';

function getTracks() { return loadJson(TRACK_FILE, {}); }
function saveTracks(rows) { saveJson(TRACK_FILE, rows); }
function getStreams() { return loadJson(STREAM_FILE, []); }
function saveStreams(rows) { saveJson(STREAM_FILE, rows); }

exports.upload = (req, res) => {
  const artistId = String(req.body.artistId || '').trim();
  const title = String(req.body.title || '').trim();
  const genre = String(req.body.genre || 'unknown').trim();
  const rate = num(req.body.rate, 0.04);
  const remix = String(req.body.remix || 'open').trim();

  if (!artistId) return fail(res, 400, 'artistId_required');
  if (!title) return fail(res, 400, 'title_required');
  if (title.length > 120) return fail(res, 400, 'title_too_long');
  if (genre.length > 60) return fail(res, 400, 'genre_too_long');
  if (rate < 0 || rate > 100) return fail(res, 400, 'invalid_rate');
  if (req.user && req.user.userId !== artistId) return fail(res, 403, 'artist_mismatch');

  const tracks = getTracks();
  const trackId = id();

  tracks[trackId] = {
    trackId,
    artistId,
    title,
    genre,
    rate,
    remix,
    createdAt: now()
  };

  saveTracks(tracks);
  appendAudit('music_upload', { artistId, trackId, title, genre, rate, remix });

  return ok(res, { trackId, track: tracks[trackId] });
};

exports.streamEvent = (req, res) => {
  const cfg = getConfig();
  const trackId = String(req.body.trackId || '').trim();
  const seconds = num(req.body.seconds, 0);
  const verified = !!req.body.verified;
  const repeatCount = num(req.body.repeatCount, 0);

  const tracks = getTracks();
  const track = tracks[trackId];
  if (!track) return fail(res, 404, 'track_not_found');

  const qualified =
    seconds >= cfg.qualifiedStreamMinSeconds &&
    verified &&
    repeatCount < cfg.maxRepeatCount;

  const payout = qualified ? track.rate : 0;

  const row = {
    id: id(),
    trackId: track.trackId,
    artistId: track.artistId,
    title: track.title,
    genre: track.genre,
    seconds,
    verified,
    repeatCount,
    qualified,
    payout,
    createdAt: now()
  };

  const streams = getStreams();
  streams.push(row);
  saveStreams(streams);

  return ok(res, { qualified, payout, stream: row });
};

exports.listTracks = (_req, res) => {
  const tracks = Object.values(getTracks());
  return ok(res, { count: tracks.length, tracks });
};

exports.streamSummary = (_req, res) => {
  const rows = getStreams();
  const summary = rows.reduce((acc, r) => {
    acc.totalStreams += 1;
    acc.qualifiedStreams += r.qualified ? 1 : 0;
    acc.totalPayout += num(r.payout);
    return acc;
  }, { totalStreams: 0, qualifiedStreams: 0, totalPayout: 0 });

  return ok(res, summary);
};

exports.myTracks = (req, res) => {
  const userId = req.user.userId;
  const tracks = Object.values(getTracks()).filter(t => t.artistId === userId);
  return ok(res, { count: tracks.length, tracks });
};
