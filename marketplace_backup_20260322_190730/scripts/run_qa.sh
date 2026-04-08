#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
source .venv/bin/activate 2>/dev/null || true
pytest tests -q || true
python scripts/build_inventory.py 2>/dev/null || true
python scripts/route_audit.py 2>/dev/null || true
echo "QA run complete."
