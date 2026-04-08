#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p snapshots reports

python3 <<'PYEOF'
from pathlib import Path
import json, sqlite3

db = Path.home() / "aam_full_system" / "db" / "aam.db"
con = sqlite3.connect(db)
cur = con.cursor()

required = [
    "hollywood_budget_registry",
    "hollywood_schedule_registry",
    "hollywood_callsheet_registry",
    "hollywood_castcrew_registry",
    "hollywood_location_permit_registry",
    "hollywood_union_compliance_registry",
    "hollywood_music_clearance_registry",
    "hollywood_distribution_deal_registry",
    "hollywood_publicity_campaign_registry",
    "hollywood_festival_awards_registry",
    "hollywood_delivery_qc_registry",
    "hollywood_franchise_registry",
    "music_project_registry",
    "songwriting_registry",
    "beat_registry",
    "recording_session_registry",
    "vocal_production_registry",
    "mixing_registry",
    "mastering_registry",
    "producer_split_registry",
    "music_publishing_registry",
    "release_rollout_registry",
    "playlist_radio_registry",
    "music_video_sync_registry",
    "royalty_ledger_registry",
    "royalty_statement_registry",
    "artist_dashboard_registry",
    "executive_studio_dashboard_registry",
    "sample_clearance_registry",
    "cue_sheet_registry",
    "sync_licensing_registry",
    "ai_assistance_chat_registry",
    "star_creator_registry",
    "holo_journey_streaming_registry"
]

missing = []
present = []

for t in required:
    row = cur.execute(
        "select name from sqlite_master where type='table' and name=?",
        (t,)
    ).fetchone()
    if row:
        present.append(t)
    else:
        missing.append(t)

summary = {
    "required_count": len(required),
    "present_count": len(present),
    "missing_count": len(missing),
    "present_tables": present,
    "missing_tables": missing,
    "full_stack_status": "stable" if not missing else "needs_attention"
}

out = Path.home() / "aam_full_system" / "snapshots" / "audit_hollywood_music_full_stack_latest.json"
out.write_text(json.dumps(summary, indent=2))
print(json.dumps(summary, indent=2))

con.close()
PYEOF

bash scripts/status.sh || true

cat > "reports/audit_hollywood_music_full_stack_${STAMP}.txt" <<REPORT
AUDIT HOLLYWOOD MUSIC FULL STACK REPORT
Timestamp: ${STAMP}

Purpose:
- verify every Hollywood and music production registry
- identify only what is still missing
- preserve stable runtime before next build
REPORT

echo "=== AUDIT HOLLYWOOD MUSIC FULL STACK COMPLETE ==="
echo "Check:"
echo "  cat snapshots/audit_hollywood_music_full_stack_latest.json"
echo "  cat reports/audit_hollywood_music_full_stack_${STAMP}.txt"
echo "  bash scripts/status.sh"
