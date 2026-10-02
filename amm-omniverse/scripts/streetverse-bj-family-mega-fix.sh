#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

EVIDENCE_DIR="${EVIDENCE_DIR:-../release-evidence}"
mkdir -p "$EVIDENCE_DIR"
REPORT="$EVIDENCE_DIR/streetverse-bj-family-mega-fix.txt"
: > "$REPORT"

log(){ printf '%s\n' "$*" | tee -a "$REPORT"; }
run(){ log "▶ $*"; "$@" 2>&1 | tee -a "$REPORT"; }

log "TRYAMM / StreetVerse BJ + Family Mega Fix"
log "SHA=${GITHUB_SHA:-local}"
log "UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
log ""

log "1) Generate / repair native game assets"
run npm run native:assets

log ""
log "2) Character, family, Circle Park, school, emergency, mobile contracts"
contracts=(
  tests/tryamm-native-asset-foundry-contract.mjs
  tests/tryamm-native-runtime-asset-contract.mjs
  tests/meet-the-stubbs-native-character-visuals-contract.mjs
  tests/streetverse-character-scale-contract.mjs
  tests/james-female-circle-park-meshy-wave-contract.mjs
  tests/streetverse-ceo-distinguished-meshy-factory-contract.mjs
  tests/circle-park-west-side-jefferson-emergency-contract.mjs
  tests/west-side-school-day-emergency-missions-contract.mjs
  tests/streetverse-latest-iphone-screenshot-declutter-contract.mjs
  tests/streetverse-mobile-control-reliability-contract.mjs
  tests/streetverse-unified-mobile-controls-contract.mjs
  tests/streetverse-one-hand-integration-contract.mjs
  tests/streetverse-mobile-visible-city-contract.mjs
  tests/streetverse-chicago-grid-reality-contract.mjs
  tests/streetverse-chicago-visual-pass-3-contract.mjs
  tests/streetverse-chicago-traffic-life-pass-4-contract.mjs
  tests/streetverse-chicago-identity-interaction-pass-5-contract.mjs
  tests/streetverse-chicago-pedestrian-routines-pass-6-contract.mjs
)
for test_file in "${contracts[@]}"; do
  if [[ -f "$test_file" ]]; then run node "$test_file"; else log "PENDING / NOT PRESENT: $test_file"; fi
done

log ""
log "3) Social / LIVE / app bridge contracts"
for test_file in   tests/visible-social-ticket-game-dock-contract.mjs   tests/ingame-social-mini-panel-contract.mjs   tests/youth-streaming-ticket-ops-contract.mjs   tests/middleverse-work-ops-contract.mjs   tests/tryamm-app-game-product-boundary-contract.mjs; do
  if [[ -f "$test_file" ]]; then run node "$test_file"; else log "PENDING / NOT PRESENT: $test_file"; fi
done

log ""
log "4) Meshy integration checks"
for test_file in   tests/meshy-asset-pipeline-contract.mjs   tests/meshy-rig-animation-pipeline-contract.mjs   tests/meshy-global-fire-fleet-contract.mjs   tests/tryamm-native-pwa-asset-cache-contract.mjs   tests/streetverse-native-glb-live-fallback-contract.mjs; do
  if [[ -f "$test_file" ]]; then run node "$test_file"; else log "PENDING / NOT PRESENT: $test_file"; fi
done

log ""
log "5) Static production compile"
run npm run typecheck
run npx vite build

log ""
log "6) Character asset inventory"
CHAR_DIR="public/tryamm-assets/meshy/characters"
required_assets=(
  SV_HERO_BJ_STUBBS_V6.glb
  SV_HERO_JAMES_BODY_BASE_V1.glb
  SV_BODY_FEMALE_BASE_V1.glb
  SV_NPC_BLACK_MAN_YOUNGADULT_01.glb
  SV_NPC_BLACK_WOMAN_YOUNGADULT_01.glb
  SV_NPC_BLACK_MAN_ADULT_01.glb
  SV_NPC_BLACK_WOMAN_ADULT_01.glb
)
missing=0
for file in "${required_assets[@]}"; do
  if [[ -s "$CHAR_DIR/$file" ]]; then
    magic="$(head -c 4 "$CHAR_DIR/$file" || true)"
    bytes="$(wc -c < "$CHAR_DIR/$file" | tr -d ' ')"
    if [[ "$magic" == "glTF" ]]; then log "GLB READY: $file bytes=$bytes"; else log "GLB INVALID: $file magic=$magic"; missing=$((missing+1)); fi
  else
    log "GLB EXTERNAL/PENDING: $file"
    missing=$((missing+1))
  fi
done

log ""
log "7) Optional live production Meshy proof"
if [[ -n "${TRYAMM_BASE_URL:-}" ]]; then
  manifest_url="${TRYAMM_BASE_URL%/}/api/meshy/asset-manifest?city=chicago-circle-park"
  log "Manifest: $manifest_url"
  if curl -fsSL --max-time 30 "$manifest_url" -o "$EVIDENCE_DIR/meshy-live-manifest.json"; then
    jq '.assets // [] | map({assetId,ready,url,walkUrl,runUrl,completedAt})' "$EVIDENCE_DIR/meshy-live-manifest.json" | tee -a "$REPORT"
  else
    log "LIVE MESHY MANIFEST NOT REACHABLE"
  fi
else
  log "TRYAMM_BASE_URL not supplied; live provider proof skipped."
fi

log ""
log "RESULT"
log "Code/game convergence: PASSED if this script reaches here."
if (( missing > 0 )); then
  log "Real GLB inventory still has $missing pending/invalid local entries. This is an asset-provider/publishing gap, not a reason to fake completion."
else
  log "All required local GLBs are present and valid."
fi
log "BJ/family likeness rule: generic stand-ins are allowed, but real-person likeness is never claimed without authorized references."
