const http = require('http');

const PORT = 5000;

function sendJSON(res, obj) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj, null, 2));
}

function sendHTML(res, html) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

const server = http.createServer((req, res) => {
  const requestURL = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const pathname = requestURL.pathname;
  const q = requestURL.searchParams.get('q') || 'No command provided';

  if (pathname === '/health') {
    return sendJSON(res, {
      ok: true,
      service: 'jarvis-core',
      port: PORT
    });
  }

  if (pathname === '/command') {
    return sendJSON(res, {
      ok: true,
      jarvis: 'online',
      received_command: q,
      next_phase: 'voice + automation + memory routing'
    });
  }

  return sendHTML(res, `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Jarvis Core</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #020617;
      color: #e2e8f0;
      padding: 20px;
    }
    .card {
      max-width: 820px;
      margin: 0 auto;
      background: #111827;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 20px;
    }
    a {
      color: white;
      background: #2563eb;
      border-radius: 10px;
      padding: 10px 14px;
      text-decoration: none;
      display: inline-block;
      margin-right: 8px;
    }
    code {
      background: #1e293b;
      padding: 2px 6px;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Jarvis Core</h1>
    <p>Jarvis is online and ready for command routing.</p>
    <p>Test command endpoint:</p>
    <p><code>http://127.0.0.1:5000/command?q=start%20marketplace</code></p>
    <div style="margin-top:16px;">
      <a href="/health">Health</a>
      <a href="/command?q=hello%20jarvis">Test Command</a>
      <a href="http://127.0.0.1:4900/">Back to Dashboard</a>
    </div>
  </div>
</body>
</html>`);
});

server.listen(PORT, () => {
  console.log(`Jarvis running on ${PORT}`);
});
