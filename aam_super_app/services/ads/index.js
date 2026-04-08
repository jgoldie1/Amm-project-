const { id, now } = require('../../shared/utils');
const { loadJson, saveJson } = require('../../shared/store');
const { ok, fail, num } = require('../../shared/http');

const FILE = 'data/ads.json';

function getRows() { return loadJson(FILE, []); }
function saveRows(rows) { saveJson(FILE, rows); }

exports.impression = (req, res) => {
  const adId = String(req.body.adId || 'free-approved-ad').trim();
  const placement = String(req.body.placement || 'holo-overlay').trim();
  const viewerId = String(req.body.viewerId || 'anon').trim();
  const revenue = num(req.body.revenue, 0);

  if (revenue < 0) return fail(res, 400, 'invalid_revenue');

  const rows = getRows();
  const row = {
    id: id(),
    adId,
    placement,
    viewerId,
    revenue,
    at: now()
  };
  rows.push(row);
  saveRows(rows);

  return ok(res, { impression: row });
};

exports.summary = (_req, res) => {
  const rows = getRows();
  const totalRevenue = rows.reduce((acc, r) => acc + num(r.revenue), 0);
  return ok(res, { count: rows.length, totalRevenue });
};
