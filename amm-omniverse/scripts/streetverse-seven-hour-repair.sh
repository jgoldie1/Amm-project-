#!/usr/bin/env bash
# StreetVerse 7-hour no-regression repair budget.
# Run as two independent <= 210-minute GitHub-hosted jobs (GitHub caps each at 6h).
# Does not use AI/provider credits, change Supabase objects, or push/deploy to main.
set -Eeuo pipefail
if (( $# != 2 )); then
  echo "Usage: bash scripts/streetverse-seven-hour-repair.sh assets|gameplay BUDGET_MINUTES" >&2
  exit 2
fi
MODE="$1"
BUDGET_MINUTES="$2"
if [[ "$MODE" != "assets" && "$MODE" != "gameplay" ]]; then
  echo "Invalid mode. Use assets or gameplay." >&2
  exit 2
fi
if [[ ! "$BUDGET_MINUTES" =~ ^[0-9]+$ ]] || (( BUDGET_MINUTES < 1 || BUDGET_MINUTES > 210 )); then
  echo "Budget must be 1-210 minutes per job." >&2
  exit 2
fi

cd "$(dirname "$0")/.."
APP_DIR="$PWD"
EVIDENCE_DIR="$APP_DIR/../release-evidence/streetverse-seven-hour/$MODE"
mkdir -p "$EVIDENCE_DIR"
SUMMARY="$EVIDENCE_DIR/summary.md"
START_UTC="$(date -u -Iseconds)"
START_SECONDS="$SECONDS"
END_SECONDS=$((START_SECONDS + BUDGET_MINUTES * 60))
MAX_PASSES=16
FAILURES=0
PASS=0

{
  echo "# StreetVerse 7-hour repair — $MODE"
  echo
  echo "- Started: $START_UTC"
  echo "- Source commit: $(git rev-parse HEAD)"
  echo "- Mode: $MODE"
  echo "- Budget: $BUDGET_MINUTES minutes"
  echo "- No Git push, production deploy, provider generation, or Supabase writes."
  echo "- Pre-existing source models and safety fallbacks are never replaced."
  echo
} > "$SUMMARY"

run_gate(){
  local label="$1"
  shift
  local logfile="$EVIDENCE_DIR/pass-$PASS-$label.log"
  echo "RUN pass=$PASS gate=$label : $*"
  if "$@" > "$logfile" 2>&1; then
    echo "- PASS $PASS / $label" >> "$SUMMARY"
    return 0
  else
    local code="$?"
    echo "::warning::StreetVerse $MODE pass $PASS gate $label failed (exit $code). See artifact $logfile"
    echo "- FAIL $PASS / $label (exit $code)" >> "$SUMMARY"
    FAILURES=$((FAILURES+1))
    return 1
  fi
}

guarded_repair(){
  # Existing repair scripts are the ONLY automatic source repair operations.
  # Their output stays in this isolated ephemeral checkout; no auto-commit.
  run_gate repair-entry node scripts/repair-streetverse-entry.mjs || true
  run_gate repair-hero node scripts/inject-streetverse-hero-spawn.mjs || true
  run_gate generate-native-models npm run native:assets || true
}

asset_pass(){
  case "$PASS" in
    1|6|11|16)
      run_gate asset-inventory node --test tests/streetverse-preservation-safety.test.mjs || true
      run_gate resident-integration node --test tests/streetverse-preserved-resident-runtime.test.mjs || true
      run_gate meshy-wave1 node tests/meshy-durable-wave1-contract.mjs || true
      run_gate meshy-wave2 node tests/meshy-durable-wave2-contract.mjs || true
      run_gate meshy-mobile node tests/meshy-character-mobile-readability-contract.mjs || true
      ;;
    2|7|12)
      guarded_repair
      run_gate native-foundry node tests/tryamm-native-asset-foundry-contract.mjs || true
      run_gate native-runtime node tests/tryamm-native-runtime-asset-contract.mjs || true
      run_gate bj-v12 node tests/bj-v12-published-glb-contract.mjs || true
      ;;
    3|8|13)
      run_gate chicago-native node tests/streetverse-chicago-native-glb-layer-contract.mjs || true
      run_gate chicago-city node tests/streetverse-chicago-alive-contract.mjs || true
      run_gate city-grid node tests/streetverse-chicago-grid-reality-contract.mjs || true
      ;;
    4|9|14)
      run_gate typecheck npm run typecheck || true
      run_gate lint npm run lint || true
      ;;
    5|10|15)
      run_gate production-build npm run build || true
      ;;
  esac
}

gameplay_pass(){
  case "$PASS" in
    1|6|11|16)
      guarded_repair
      run_gate clear-iphone node tests/streetverse-mobile-v11-clear-view-contract.mjs || true
      run_gate one-hand-controls node tests/streetverse-one-hand-integration-contract.mjs || true
      run_gate control-reliability node tests/streetverse-mobile-control-reliability-contract.mjs || true
      run_gate vehicle-controls node tests/streetverse-vehicle-control-contract.mjs || true
      ;;
    2|7|12)
      run_gate westside-visible node tests/streetverse-visible-convergence-contract.mjs || true
      run_gate chicago-grid node tests/streetverse-chicago-grid-reality-contract.mjs || true
      run_gate circle-park node tests/circle-park-chicago-completion-contract.mjs || true
      run_gate campus-world node tests/uic-greenville-world-gateway-contract.mjs || true
      run_gate new-native-layer node tests/streetverse-chicago-native-glb-layer-contract.mjs || true
      ;;
    3|8|13)
      run_gate mission-reel node tests/streetverse-mission-reel-handoff-contract.mjs || true
      run_gate mission-pay node tests/streetverse-authoritative-reward-contract.mjs || true
      run_gate mission-dock node tests/streetverse-core-gameplay-dock-contract.mjs || true
      run_gate xr-reach node tests/streetverse-xr-reach-v1-contract.mjs || true
      ;;
    4|9|14)
      run_gate typecheck npm run typecheck || true
      run_gate lint npm run lint || true
      run_gate security npm run security || true
      ;;
    5|10|15)
      run_gate full-build npm run build || true
      ;;
  esac
}

# The run repeatedly works through increasingly broad StreetVerse and app gates.
# When a gate is red, we execute the safe pre-existing fixers on the next cycle.
# Preserve ALL failures in reports and do not falsely call the candidate green.
while (( PASS < MAX_PASSES && SECONDS < END_SECONDS - 150 )); do
  PASS=$((PASS+1))
  echo "Starting StreetVerse $MODE engineering pass $PASS / $MAX_PASSES"
  echo "## Pass $PASS ($(date -u -Iseconds))" >> "$SUMMARY"
  if [[ "$MODE" == "assets" ]]; then asset_pass; else gameplay_pass; fi
  echo >> "$SUMMARY"
  if (( SECONDS >= END_SECONDS - 600 )); then break; fi
done

echo "## Final no-regression gate" >> "$SUMMARY"
run_gate final-typecheck npm run typecheck || true
run_gate final-mobile node tests/streetverse-mobile-v11-clear-view-contract.mjs || true
run_gate final-preserved-assets node --test tests/streetverse-preservation-safety.test.mjs || true
run_gate final-resident-models node --test tests/streetverse-preserved-resident-runtime.test.mjs || true

echo "- Passes executed: $PASS" >> "$SUMMARY"
echo "- Failure observations: $FAILURES (including any intermediate red gates)" >> "$SUMMARY"
echo "- Source commit at end: $(git rev-parse HEAD)" >> "$SUMMARY"
echo "- Source tree changes, if any:" >> "$SUMMARY"
git status --short | head -40 >> "$SUMMARY" || true
echo "- All changes are inside an isolated runner. No source changes are committed or deployed." >> "$SUMMARY"
if (( FAILURES > 0 )); then
  echo "REVIEW REQUIRED: $FAILURES red gate observations. See uploaded reports."
  exit 1
fi
echo "GREEN: $MODE validation finished without recorded regression."
