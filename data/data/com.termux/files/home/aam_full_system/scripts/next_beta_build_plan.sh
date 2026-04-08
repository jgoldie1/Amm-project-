#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system

echo "=== NEXT BETA BUILD PLAN ==="
echo
echo "Current completion: ~80%"
echo
echo "DONE:"
echo "- Dashboard"
echo "- Jarvis"
echo "- Life World"
echo "- Auth/login"
echo "- Smoke tests"
echo "- AI flags"
echo "- Module/world files"
echo
echo "NEXT:"
echo "1. Visible Modules page"
echo "2. Life World dashboard launch link"
echo "3. Holo panel UI"
echo "4. Save/progression/inventory UI"
echo "5. Streaming pricing + payout UI"
echo "6. Creator/public pages"
echo "7. Jarvis real action execution"
echo
echo "=== CURRENT HEALTH ==="
bash scripts/status.sh
bash scripts/smoke_test.sh
curl -s http://127.0.0.1:4902/health || echo "life world down"
curl -s http://127.0.0.1:5000/command?q=next%20beta%20build || echo "jarvis command failed"
echo
echo "PLAN READY"
