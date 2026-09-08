#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -z "${CLOUDBASE_ENV_ID:-}" ]]; then echo "Set CLOUDBASE_ENV_ID first" >&2; exit 2; fi
cd "$ROOT"
node deployment/release-check.mjs
command -v tcb >/dev/null || { echo "Install CloudBase CLI: npm i -g @cloudbase/cli"; exit 3; }
cd web
tcb hosting deploy . -e "$CLOUDBASE_ENV_ID" --safe --verify
