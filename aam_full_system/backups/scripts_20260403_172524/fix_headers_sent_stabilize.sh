#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== FIX HEADERS SENT + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports

########################################
# 1) BACKUP FIRST
########################################
cp apps/dashboard.js "backups/dashboard_headers_fix_${STAMP}.js"
cp db/aam.db "backups/aam_headers_fix_${STAMP}.db"

########################################
# 2) CAPTURE ERROR CONTEXT
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
lines = p.read_text().splitlines()

target = 5219
start = max(0, target - 25)
end = min(len(lines), target + 25)

out = []
for i in range(start, end):
    out.append(f"{i+1}: {lines[i]}")

snap = Path.home() / "aam_full_system" / "snapshots" / f"dashboard_error_context_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
snap.write_text("\n".join(out))
print(f"[OK] wrote error context snapshot: {snap}")
PYEOF

########################################
# 3) PATCH RESPONSE GUARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

marker = "const server = http.createServer(async (req, res) => {"
guard = r"""const server = http.createServer(async (req, res) => {
  const __origWriteHead = res.writeHead.bind(res);
  const __origEnd = res.end.bind(res);

  res.writeHead = (...args) => {
    if (res.headersSent || res.writableEnded) {
      return res;
    }
    return __origWriteHead(...args);
  };

  res.end = (...args) => {
    if (res.writableEnded) {
      return res;
    }
    return __origEnd(...args);
  };
"""

if "const __origWriteHead = res.writeHead.bind(res);" not in text and marker in text:
    text = text.replace(marker, guard, 1)
    print("[OK] inserted response guard")
else:
    print("[OK] response guard already present or marker not found")

p.write_text(text)
PYEOF

########################################
# 4) RESTART CLEANLY
########################################
bash scripts/restart_world_socket.sh || true
bash scripts/safe_restart.sh || true

########################################
# 5) VERIFY
########################################
bash scripts/check_js.sh
bash scripts/status.sh || true

echo "--- DASHBOARD HEALTH ---"
curl -s http://127.0.0.1:4900/health || true

echo "--- JARVIS HEALTH ---"
curl -s http://127.0.0.1:5000/health || true

echo "--- SOCKET HEALTH ---"
curl -s http://127.0.0.1:5090/health || true

########################################
# 6) REPORT
########################################
cat > "reports/headers_sent_fix_${STAMP}.txt" <<REPORT
HEADERS SENT FIX REPORT
Timestamp: ${STAMP}

Applied:
- dashboard.js backup
- DB backup
- error context snapshot near line 5219
- response guard inserted into Node server callback
- clean restart attempted
- health checks run

This is a stabilization hotfix to stop the dashboard from crashing
when a route tries to write headers twice.
REPORT

echo "FIX HEADERS SENT + STABILIZE COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/heirs"
echo "  termux-open-url http://127.0.0.1:4900/heirs-ecosystem"
echo "  termux-open-url http://127.0.0.1:4900/heir-operations"
echo "  termux-open-url http://127.0.0.1:4900/progress"
