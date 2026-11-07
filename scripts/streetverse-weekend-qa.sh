#!/usr/bin/env bash
# StreetVerse temporary QA monitor: deterministic, read-only, no AI coding, no deploys.
set -uo pipefail
CUTOFF_UTC='2026-11-08T02:00:00Z'  # Sat Nov 7, 8:00 PM Chicago (CST)
CUTOFF_EPOCH=$(date -u -d "$CUTOFF_UTC" +%s)
START_EPOCH=$(date -u +%s)
REPORT_DIR="${STREETVERSE_QA_REPORT_DIR:-${RUNNER_TEMP:-/tmp}/streetverse-weekend-qa}"
mkdir -p "$REPORT_DIR"
REPORT="$REPORT_DIR/summary.md"
PASS=0
FAIL=0
SKIP=0
{
  echo '# StreetVerse GitHub Actions — timeboxed QA'
  echo
  echo "- Checked at: $(date -u -Is) (UTC)"
  echo '- Cutoff: Saturday, Nov 7, 2026 at 8:00 PM America/Chicago (2026-11-08T02:00:00Z)'
  echo "- Repository: ${GITHUB_REPOSITORY:-local-checkout}"
  echo "- Commit: ${GITHUB_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo unknown)}"
  echo '- Scope: code checks only; not Chromebook, headset, cloud, live payments, or celebrity licenses'
  echo
  echo '| Check | Result |'
  echo '|---|---|'
} > "$REPORT"

record() {
  local name="$1" result="$2"
  printf '| %s | %s |\n' "$name" "$result" >> "$REPORT"
  echo "$name — $result"
}

run_check() {
  local name="$1"; shift
  local now remaining limit rc log
  now=$(date -u +%s)
  remaining=$((CUTOFF_EPOCH - now))
  if (( remaining <= 0 )); then
    record "$name" 'STOPPED: deadline reached'
    SKIP=$((SKIP+1))
    return
  fi
  limit=$remaining
  if (( limit > 360 )); then limit=360; fi
  log="$REPORT_DIR/$(printf '%s' "$name" | tr -cs '[:alnum:]' '_' | tr '[:upper:]' '[:lower:]').log"
  echo "Running: $name (maximum ${limit}s)"
  timeout --signal=TERM --kill-after=5 "${limit}s" "$@" >"$log" 2>&1
  rc=$?
  if (( rc == 0 )); then
    record "$name" 'PASS'
    PASS=$((PASS+1))
  elif (( rc == 124 || rc == 137 )); then
    if (( $(date -u +%s) >= CUTOFF_EPOCH )); then
      record "$name" 'STOPPED: cutoff during check'
      SKIP=$((SKIP+1))
    else
      record "$name" "FAIL: timed out (exit $rc)"
      FAIL=$((FAIL+1))
    fi
  else
    record "$name" "FAIL: exit $rc"
    FAIL=$((FAIL+1))
  fi
}

if (( START_EPOCH >= CUTOFF_EPOCH )); then
  record 'Time window' 'STOPPED: cutoff reached'
  echo -e '\n**Status:** stopped; no checks performed.' >> "$REPORT"
  [[ -n "${GITHUB_STEP_SUMMARY:-}" ]] && cat "$REPORT" >> "$GITHUB_STEP_SUMMARY"
  exit 0
fi
if [[ "${STREETVERSE_QA_SELF_TEST:-0}" == 1 ]]; then
  run_check 'Bash runtime' bash -c 'echo smoke-check'
else
  run_check 'Root syntax' npm run syntax
  run_check 'HoloGPT dialogue smoke' node test/hologpt-chat-smoke.js
  run_check 'StreetVerse competition smoke' node test/streetverse-competition-os-smoke.js
  if [[ -d amm-omniverse/tests ]]; then
    run_check 'StreetVerse WebXR contract' bash -c 'cd amm-omniverse && node tests/streetverse-webxr-contract.mjs'
    run_check 'StreetVerse journey QA contract' bash -c 'cd amm-omniverse && node tests/streetverse-journey-qa-contract.mjs'
    run_check 'StreetVerse reward authority contract' bash -c 'cd amm-omniverse && node tests/streetverse-authoritative-reward-contract.mjs'
  else
    record 'Omniverse path' 'SKIPPED: amm-omniverse/tests missing'
    SKIP=$((SKIP+1))
  fi
fi
{
  echo
  echo "**Totals:** ${PASS} passed, ${FAIL} failed, ${SKIP} stopped/skipped."
  echo 'No game files were changed and no deployment was attempted.'
} >> "$REPORT"
if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then cat "$REPORT" >> "$GITHUB_STEP_SUMMARY"; fi
if (( FAIL > 0 )); then exit 1; fi