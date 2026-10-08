#!/usr/bin/env bash
set -Eeuo pipefail

# StreetVerse Forge Tooling V2
# Safe defaults:
# - refuses main/master
# - refuses dirty worktree
# - never merges or deploys
# - never uses --dangerously-skip-permissions
# - audits assets read-only by default
#
# Official 2026 integrations:
# - Epic Unreal MCP (UE 5.8): http://127.0.0.1:8000/mcp
# - Blender Lab MCP: install/start from Blender Lab MCP Server instructions
# - Unity 6+ Claude plugin: optional; not part of the primary StreetVerse runtime
#
# Usage:
#   bash scripts/streetverse-forge-setup.sh
#   bash scripts/streetverse-forge-setup.sh --write-mcp
#   bash scripts/streetverse-forge-setup.sh --run-claude
#   WITH_UNITY=1 bash scripts/streetverse-forge-setup.sh --install-unity-plugin
#
# Blender MCP configuration:
#   The official Blender Lab project requires its add-on + MCP server to be installed/run.
#   Because the command differs by installation method, set either:
#     BLENDER_MCP_CMD="/absolute/path/to/your/blender-mcp-server ..."
#   or create the Blender config from the official MCP bundle/client instructions.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GIT_ROOT="$(git -C "$ROOT" rev-parse --show-toplevel)"
REPORT="$ROOT/release-evidence/forge-report.md"
WRITE_MCP=0
RUN_CLAUDE=0
INSTALL_UNITY=0

for arg in "$@"; do
  case "$arg" in
    --write-mcp) WRITE_MCP=1 ;;
    --run-claude) RUN_CLAUDE=1; WRITE_MCP=1 ;;
    --install-unity-plugin) INSTALL_UNITY=1 ;;
    -h|--help) sed -n '1,58p' "${BASH_SOURCE[0]}"; exit 0 ;;
    *) echo "unknown argument: $arg" >&2; exit 2 ;;
  esac
done

say(){ printf '\n\033[1m== %s\033[0m\n' "$*"; }
ok(){ printf '   \033[32mok\033[0m   %s\n' "$*"; }
warn(){ printf '   \033[33mwarn\033[0m %s\n' "$*"; }
bad(){ printf '   \033[31mFAIL\033[0m %s\n' "$*"; }

say "Guards"
if [[ "${CLAUDE_ARGS:-}" == *dangerously-skip-permissions* || "$*" == *dangerously-skip-permissions* ]]; then
  bad "dangerous Claude permission bypass detected"
  exit 1
fi
ok "no permission bypass"

branch="$(git -C "$GIT_ROOT" rev-parse --abbrev-ref HEAD)"
if [[ "$branch" == "main" || "$branch" == "master" ]]; then
  bad "refusing to run on $branch; use a working branch"
  exit 1
fi
ok "branch: $branch"

if [[ -n "$(git -C "$GIT_ROOT" status --porcelain)" ]]; then
  bad "working tree is dirty; commit or stash first"
  exit 1
fi
ok "working tree clean"

say "Preflight"
printf '   %-16s %s\n' "node" "$(node --version 2>/dev/null || echo MISSING)"
printf '   %-16s %s\n' "npm" "$(npm --version 2>/dev/null || echo MISSING)"
for tool in claude blender UnrealEditor unity uv uvx; do
  if command -v "$tool" >/dev/null 2>&1; then
    printf '   %-16s %s\n' "$tool" "$(command -v "$tool")"
  else
    printf '   %-16s %s\n' "$tool" "not on PATH"
  fi
done

if [[ "$INSTALL_UNITY" -eq 1 ]]; then
  say "Unity Claude plugin"
  if [[ "${WITH_UNITY:-0}" != "1" ]]; then
    warn "set WITH_UNITY=1 to confirm you intentionally want Unity tooling"
  elif ! command -v claude >/dev/null 2>&1; then
    bad "Claude Code not installed"
  else
    claude plugin marketplace add Unity-Technologies/unity-agent-plugin || warn "marketplace add needs interactive Claude/plugin support"
    claude plugin install unity@unity-agent-plugin --scope local || warn "Unity plugin install needs interactive Claude/plugin support"
  fi
fi

write_mcp(){
  say "Writing project .mcp.json"
  local target="$GIT_ROOT/.mcp.json"
  local backup=""
  if [[ -f "$target" ]]; then
    backup="$target.bak.$(date +%s)"
    cp "$target" "$backup"
    warn "backed up existing .mcp.json to $backup"
  fi

  MCP_TARGET="$target" BLENDER_MCP_CMD_VALUE="${BLENDER_MCP_CMD:-}" node <<'NODE'
const fs=require('fs')
const target=process.env.MCP_TARGET
let cfg={mcpServers:{}}
if(fs.existsSync(target)){
  try{cfg=JSON.parse(fs.readFileSync(target,'utf8'))}catch{throw new Error('existing .mcp.json is invalid JSON')}
}
cfg.mcpServers=cfg.mcpServers||{}

// Epic's official UE 5.8 Unreal MCP default local endpoint.
cfg.mcpServers['unreal-mcp']={type:'http',url:'http://127.0.0.1:8000/mcp'}

const blender=String(process.env.BLENDER_MCP_CMD_VALUE||'').trim()
if(blender){
  const parts=blender.match(/(?:[^\s"]+|"[^"]*")+/g)||[]
  const clean=parts.map(x=>x.replace(/^"|"$/g,''))
  if(clean.length)cfg.mcpServers.blender={type:'stdio',command:clean[0],args:clean.slice(1)}
}else{
  delete cfg.mcpServers.blender
}

fs.writeFileSync(target,JSON.stringify(cfg,null,2)+'\n')
console.log('wrote',target)
console.log('unreal-mcp -> http://127.0.0.1:8000/mcp')
console.log(blender?'blender -> explicit BLENDER_MCP_CMD':'blender entry omitted; configure from official Blender Lab MCP installation')
NODE
  node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" "$target"
  ok ".mcp.json valid"
}

if [[ "$WRITE_MCP" -eq 1 ]]; then write_mcp; fi

say "Official MCP reachability"
python3 - <<'PY'
import socket
for name,host,port in [
    ("Unreal MCP","127.0.0.1",8000),
]:
    try:
        with socket.create_connection((host,port),timeout=1):
            print(f"   ok   {name}: {host}:{port} reachable")
    except Exception:
        print(f"   warn {name}: {host}:{port} not reachable; open UE 5.8, enable Unreal MCP + All Toolsets, and start the server")
PY

say "Current no-regression baseline"
cd "$ROOT"
GATES=(
  tests/streetverse-mobile-v7-convergence-contract.mjs
  tests/streetverse-v8-no-regression-contract.mjs
  tests/stubbs-ai-holographic-business-os-contract.mjs
  tests/streetverse-chicago-bj-v9-v13-contract.mjs
  tests/streetverse-camera-v10-safety-contract.mjs
  tests/streetverse-mobile-v11-clear-view-contract.mjs
  tests/streetverse-xr-reach-v1-contract.mjs
  tests/unreal-mcp-readiness-contract.mjs
)
fail=0
for gate in "${GATES[@]}"; do
  if [[ ! -f "$gate" ]]; then warn "missing gate: $gate"; fail=$((fail+1)); continue; fi
  if node "$gate"; then ok "$(basename "$gate")"; else bad "$(basename "$gate")"; fail=$((fail+1)); fi
done
if npm run typecheck; then ok "typecheck"; else bad "typecheck"; fail=$((fail+1)); fi

say "Read-only asset audit"
mkdir -p "$ROOT/release-evidence"
if npm run asset:audit; then ok "asset audit complete"; else bad "asset audit failed"; fail=$((fail+1)); fi

mkdir -p "$(dirname "$REPORT")"
{
  echo "# StreetVerse Forge Tooling Report"
  echo
  echo "- generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "- branch: `$branch`"
  echo "- sha: `$(git -C "$GIT_ROOT" rev-parse --short HEAD)`"
  echo "- baseline failures: $fail"
  echo "- Blender Lab MCP command configured: $([[ -n "${BLENDER_MCP_CMD:-}" ]] && echo yes || echo no)"
  echo "- Unreal MCP endpoint reachable: see console preflight"
  echo
  echo "## Truth boundaries"
  echo "- The glTF audit is read-only; it does not repair topology, UV overlap, weights, or likeness."
  echo "- Blender changes require the official Blender Lab add-on/server to be running locally."
  echo "- Unreal changes require UE 5.8 Unreal MCP + All Toolsets to be running locally."
  echo "- Unity is optional and should not replace the current Three.js/WebXR + Unreal production path."
  echo "- Physical headset behavior still requires a real headset test."
} > "$REPORT"
ok "wrote $REPORT"

if [[ "$fail" -gt 0 ]]; then
  bad "$fail baseline/audit failure(s); refusing agent run"
  exit 1
fi

if [[ "$RUN_CLAUDE" -eq 1 ]]; then
  say "Claude Super Forge"
  command -v claude >/dev/null 2>&1 || { bad "Claude Code not installed"; exit 1; }
  [[ "$WRITE_MCP" -eq 1 ]] || write_mcp
  claude "$(cat <<'PROMPT'
You are the TRYAMM StreetVerse 3D/XR forge engineer.

Work only on the current non-main branch. Do not merge or deploy.

Use the available Blender MCP and Unreal MCP tools when they are actually connected. If one is unavailable, do not fake success.

Priorities:
1. Read asset-audit.json and rank the worst mobile/XR asset problems.
2. In Blender, non-destructively repair real source assets: transforms, normals, topology, UVs, PBR material setup, excessive triangles, LODs, simple collision and XR grab pivots.
3. Preserve character armatures/weights/morphs. Never rename a procedural BJ mesh and call it a realistic new version.
4. Harden StreetVerse XR Reach: stable grab offsets, explicit grabbable tags, safe physics only where justified, hand/controller telemetry, AR tabletop transparency, VR full scale.
5. In Unreal 5.8 MCP, use the current StreetVerseUnreal project as a development workstation for PCG streetscape/trees/furniture, collision, LOD/HLOD and imports. Unreal Editor must not become a live runtime dependency.
6. Preserve all V7/V8/Business OS/V9/V13/Camera V10/Mobile V11/XR Reach V1 contracts.
7. Run npm run typecheck, npm run build, npm run unreal:manifest and npm run unreal:check after changes.
8. Write release-evidence/blender-forge/summary.md with measured before/after counts and honest limitations.
9. Commit validated changes to the current branch only.
PROMPT
)"
fi

say "Done"
echo "Nothing was merged or deployed."
echo "Official Blender Lab MCP setup: https://www.blender.org/lab/mcp-server/"
echo "Epic UE 5.8 Unreal MCP setup: enable Unreal MCP + All Toolsets, then ModelContextProtocol.StartServer 8000"
