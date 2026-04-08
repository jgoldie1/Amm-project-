function ok(res, payload = {}) {
  return res.json({ ok: true, ...payload });
}

function fail(res, code, error, extra = {}) {
  return res.status(code).json({ ok: false, error, ...extra });
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

module.exports = { ok, fail, num };
