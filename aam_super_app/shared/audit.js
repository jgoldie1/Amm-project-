const fs = require('fs');
const path = require('path');

function appendAudit(event, payload = {}) {
  try {
    const file = path.resolve('logs/audit.log');
    const line = JSON.stringify({
      at: new Date().toISOString(),
      event,
      ...payload
    }) + '\n';
    fs.appendFileSync(file, line);
  } catch (e) {
  }
}

module.exports = { appendAudit };
