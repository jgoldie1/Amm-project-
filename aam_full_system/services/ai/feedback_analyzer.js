const fs = require('fs');

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function analyze() {
  const data = readJSON('data/feedback/beta_reports.json', { reports: [] });
  const issues = {};
  const requests = {};

  for (const r of data.reports) {
    (r.issues || []).forEach(i => {
      issues[i] = (issues[i] || 0) + 1;
    });

    (r.feature_requests || []).forEach(f => {
      requests[f] = (requests[f] || 0) + 1;
    });
  }

  return {
    total_reports: data.reports.length,
    top_issues: Object.entries(issues).sort((a, b) => b[1] - a[1]).slice(0, 5),
    top_requests: Object.entries(requests).sort((a, b) => b[1] - a[1]).slice(0, 5)
  };
}

console.log(JSON.stringify(analyze(), null, 2));
