#!/usr/bin/env bash
# Activate TRYAMM main ruleset using repository owner's GitHub CLI login.
# No operation by default; explicit --apply required.
set -euo pipefail
repo='jgoldie1/Amm-project-'
root="$(cd "$(dirname "$0")" && pwd)"
payload="$root/main-branch-ruleset.json"
mode='--check'
if [[ $# -gt 0 ]]; then mode="$1"; fi
[[ "$mode" == --apply || "$mode" == --check ]] || { echo 'Usage: bash protect-main.sh [--check|--apply]' >&2; exit 2; }
command -v gh >/dev/null || { echo 'Install GitHub CLI (gh) first.' >&2; exit 1; }
command -v python3 >/dev/null || { echo 'Python 3 is required.' >&2; exit 1; }
python3 - "$payload" <<'PY'
import json,sys
p=json.load(open(sys.argv[1],encoding='utf-8'))
assert p['target']=='branch' and p['enforcement']=='active'
assert p['conditions']['ref_name']['include']==['refs/heads/main']
assert p['bypass_actors']==[]
checks=next(x['parameters']['required_status_checks'] for x in p['rules'] if x['type']=='required_status_checks')
assert [c['context'] for c in checks]==['Root platform checks','Omniverse app checks','Release gate']
assert {'pull_request','deletion','non_fast_forward'}.issubset({x['type'] for x in p['rules']})
print('Valid main protection configuration.')
PY
gh auth status >/dev/null 2>&1 || { echo 'Run gh auth login -w as repository owner.' >&2; exit 1; }
[[ "$(gh api "repos/$repo" --jq '.permissions.admin')" == true ]] || { echo 'Active GitHub login must be repository admin.' >&2; exit 1; }
existing="$(gh api "repos/$repo/rulesets" --jq '.[] | select(.name == "TRYAMM Main — PR and CI Lock") | "\(.id) \(.enforcement)"')"
if [[ -n "$existing" ]]; then
  echo "Ruleset exists: $existing"
  [[ "$existing" == *' active'* ]] || { echo 'Existing ruleset disabled; review instead of creating duplicate.' >&2; exit 1; }
  echo "Protection ACTIVE: https://github.com/$repo/settings/rules"
  exit 0
fi
if [[ "$mode" == --check ]]; then
  echo 'Dry run only. Run bash protect-main.sh --apply to ACTIVATE.'
  exit 0
fi
id="$(gh api --method POST "repos/$repo/rulesets" -H 'Accept: application/vnd.github+json' --input "$payload" --jq '.id')"
[[ "$id" =~ ^[0-9]+$ ]] || { echo 'GitHub did not return valid ruleset ID.' >&2; exit 1; }
[[ "$(gh api "repos/$repo/rulesets/$id" --jq '.enforcement')" == active ]] || { echo 'Ruleset not confirmed active.' >&2; exit 1; }
echo "ACTIVE protection installed: https://github.com/$repo/rules/$id"
echo 'Direct-main-push workflows must now open pull requests.'
