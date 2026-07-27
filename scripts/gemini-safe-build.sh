#!/usr/bin/env bash
set -euo pipefail

# Safe AI-assisted build helper for the AMM Omniverse repository.
# This script prepares a protected feature branch, gathers project context,
# and writes a prompt file for Gemini. It does not store API keys or auto-merge.

FEATURE_NAME="${1:-launch-feature}"
SAFE_NAME="$(printf '%s' "$FEATURE_NAME" | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9-_')"
BRANCH="ai/gemini-${SAFE_NAME}"
PROMPT_FILE=".ai/gemini-${SAFE_NAME}.md"

command -v git >/dev/null 2>&1 || { echo "git is required" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js 20+ is required" >&2; exit 1; }

if [[ ! -f package.json || ! -f server.js ]]; then
  echo "Run this from the AMM repository root." >&2
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash changes first." >&2
  exit 1
fi

if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "Starting from $CURRENT_BRANCH. Switching to main first."
fi

git switch main
git pull --ff-only origin main
git switch -c "$BRANCH"
mkdir -p .ai

cat > "$PROMPT_FILE" <<PROMPT
You are implementing one feature in the AMM Omniverse repository.

Feature: ${FEATURE_NAME}
Branch: ${BRANCH}

Rules:
1. Preserve the existing Express, Socket.IO, livestream, authentication, PWA, product-hub, and accessibility code.
2. Do not replace server.js or public/app.js wholesale. Prefer small modules and focused edits.
3. Never create or commit .env, credentials, tokens, private keys, OAuth secrets, or production URLs containing secrets.
4. Do not claim a test passed unless you actually ran it and report the command output.
5. Use accessible HTML, keyboard support, 48px touch targets, reduced-motion support, and safe text insertion.
6. Keep product status labels honest: prototype, MVP preview, beta, or planned.
7. Add tests for the feature and update documentation.
8. Before finishing, run: npm install, npm run check, and npm test.
9. Summarize changed files, unresolved risks, required environment variables, and manual acceptance steps.
10. Do not commit or push automatically. Leave changes for human review.

Repository context to inspect first:
- package.json
- server.js
- public/index.html
- public/app.js
- public/product-hub.js
- public/data/products.json
- docs/TWO_WEEK_LAUNCH_PLAN.md
- docs/TECHNOLOGY_BUILD_MAP.md

Build the smallest production-safe implementation that advances the two-week MVP.
PROMPT

cat <<OUTPUT
Prepared AI feature branch: $BRANCH
Gemini prompt: $PROMPT_FILE

Next steps:
1. Open this repository in Gemini Code Assist or your Gemini coding environment.
2. Give Gemini the contents of $PROMPT_FILE.
3. Review every generated diff.
4. Run: npm install && npm run check && npm test
5. Commit only reviewed files, then push the branch and open a draft PR.
OUTPUT
