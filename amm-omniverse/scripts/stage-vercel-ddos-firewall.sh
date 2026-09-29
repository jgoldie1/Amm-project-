#!/usr/bin/env bash
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI is required" >&2
  exit 2
fi

has_rule(){
  local name="$1"
  vercel firewall rules list --json | jq -e --arg n "$name" '(.rules // .) | map(select(.name==$n)) | length > 0' >/dev/null
}

add_log_rule(){
  local name="$1"; shift
  if has_rule "$name"; then
    echo "Rule already exists: $name"
    return 0
  fi
  vercel firewall rules add "$name" "$@" --yes
}

echo "Staging TRYAMM firewall rules in LOG-FIRST mode. Nothing is published automatically."

add_log_rule "TRYAMM log exploit probes"   --condition '{"type":"path","op":"inc","value":["/.env","/.git/config","/wp-admin","/wp-login.php","/phpmyadmin","/server-status","/actuator/env"]}'   --action log

add_log_rule "TRYAMM AI burst observation"   --condition '{"type":"path","op":"pre","value":"/api/ai"}'   --condition '{"type":"method","op":"eq","value":"POST"}'   --action rate_limit   --rate-limit-window 60   --rate-limit-requests 300   --rate-limit-keys ip   --rate-limit-action log

add_log_rule "TRYAMM media burst observation"   --condition '{"type":"path","op":"pre","value":"/api/media"}'   --condition '{"type":"method","op":"eq","value":"POST"}'   --action rate_limit   --rate-limit-window 60   --rate-limit-requests 240   --rate-limit-keys ip   --rate-limit-action log

add_log_rule "TRYAMM commerce burst observation"   --condition '{"type":"path","op":"pre","value":"/api/commerce"}'   --condition '{"type":"method","op":"eq","value":"POST"}'   --action rate_limit   --rate-limit-window 60   --rate-limit-requests 180   --rate-limit-keys ip   --rate-limit-action log

add_log_rule "TRYAMM security route burst observation"   --condition '{"type":"path","op":"pre","value":"/api/security"}'   --action rate_limit   --rate-limit-window 60   --rate-limit-requests 120   --rate-limit-keys ip   --rate-limit-action log

add_log_rule "TRYAMM legacy edge proxy burst observation"   --condition '{"type":"path","op":"inc","value":["/api/checkout","/api/payments/status","/api/payments/verify-checkout","/api/creator/earnings","/api/stripe/webhook"]}'   --action rate_limit   --rate-limit-window 60   --rate-limit-requests 120   --rate-limit-keys ip   --rate-limit-action log

echo
echo "Draft diff:"
vercel firewall diff
echo
echo "DO NOT publish automatically. Review matched traffic first, then publish manually after validation."
