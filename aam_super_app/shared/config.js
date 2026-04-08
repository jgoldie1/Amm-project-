const fs = require('fs');
const path = require('path');

const DEFAULTS = {
  appName: 'AAM Super App',
  port: 4000,
  platformFeePercent: 30,
  qualifiedStreamMinSeconds: 30,
  maxRepeatCount: 5,
  environment: 'development'
};

function getConfig() {
  try {
    const p = path.resolve('config/app.json');
    if (!fs.existsSync(p)) return DEFAULTS;
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
    return { ...DEFAULTS, ...raw };
  } catch (e) {
    return DEFAULTS;
  }
}

module.exports = { getConfig };
