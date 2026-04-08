const { ok, num } = require('../../shared/http');

exports.evaluateStream = (req, res) => {
  const nudity = num(req.body.nudity, 0);
  const hate = num(req.body.hate, 0);
  const copyright = num(req.body.copyright, 0);

  const risk = Math.min(1, (nudity * 0.5) + (hate * 0.2) + (copyright * 0.3));

  let action = 'allow';
  if (risk >= 0.8) action = 'terminate';
  else if (risk >= 0.5) action = 'pause_review';
  else if (risk >= 0.3) action = 'warn';

  return ok(res, { risk, action });
};
