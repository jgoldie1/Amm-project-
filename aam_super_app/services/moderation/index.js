const { loadJson, saveJson } = require('../../shared/store');
const { ok, fail } = require('../../shared/http');
const { id, now } = require('../../shared/utils');

const REPORT_FILE = 'data/reports.json';
const DMCA_FILE = 'data/dmca.json';
const APPEAL_FILE = 'data/appeals.json';

function load(file, fallback) { return loadJson(file, fallback); }
function save(file, data) { saveJson(file, data); }

exports.report = (req, res) => {
  const contentId = String(req.body.contentId || '').trim();
  const reason = String(req.body.reason || '').trim();
  if (!contentId) return fail(res, 400, 'contentId_required');
  if (!reason) return fail(res, 400, 'reason_required');

  const rows = load(REPORT_FILE, []);
  const report = {
    id: id(),
    contentId,
    reason,
    reporter: req.body.reporter || 'anonymous',
    evidenceWindow: req.body.evidenceWindow || '120s',
    at: now(),
    status: 'open'
  };
  rows.push(report);
  save(REPORT_FILE, rows);

  return ok(res, { reportId: report.id, report });
};

exports.dmcaNotice = (req, res) => {
  const claimant = String(req.body.claimant || '').trim();
  const contentId = String(req.body.contentId || '').trim();
  if (!claimant) return fail(res, 400, 'claimant_required');
  if (!contentId) return fail(res, 400, 'contentId_required');

  const rows = load(DMCA_FILE, []);
  const notice = {
    id: id(),
    claimant,
    contentId,
    statement: req.body.statement || '',
    at: now(),
    status: 'takedown'
  };
  rows.push(notice);
  save(DMCA_FILE, rows);

  return ok(res, { dmcaId: notice.id, action: 'content_removed', notice });
};

exports.appeal = (req, res) => {
  const contentId = String(req.body.contentId || '').trim();
  if (!contentId) return fail(res, 400, 'contentId_required');

  const rows = load(APPEAL_FILE, []);
  const appeal = {
    id: id(),
    contentId,
    appellant: req.body.appellant || 'unknown',
    reason: req.body.reason || '',
    at: now(),
    status: 'pending'
  };
  rows.push(appeal);
  save(APPEAL_FILE, rows);

  return ok(res, { appealId: appeal.id, appeal });
};

exports.updateReportStatus = (req, res) => {
  const idValue = String(req.body.id || '').trim();
  const status = String(req.body.status || '').trim();
  if (!idValue || !status) return fail(res, 400, 'id_status_required');

  const rows = load(REPORT_FILE, []);
  const row = rows.find(r => r.id === idValue);
  if (!row) return fail(res, 404, 'report_not_found');

  row.status = status;
  row.updatedAt = now();
  save(REPORT_FILE, rows);

  return ok(res, { report: row });
};

exports.summary = (_req, res) => {
  const reports = load(REPORT_FILE, []).length;
  const dmca = load(DMCA_FILE, []).length;
  const appeals = load(APPEAL_FILE, []).length;
  return ok(res, { reports, dmca, appeals });
};

exports.listReports = (_req, res) => {
  return ok(res, { reports: load(REPORT_FILE, []) });
};
