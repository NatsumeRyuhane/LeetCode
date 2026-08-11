#!/usr/bin/env bash
# dashboard.sh — launch the coach dashboard against THIS practice repo.
#
# Run from anywhere in the repo:
#     ./tools/dashboard.sh              # read the real record
#     ./tools/dashboard.sh --demo       # bundled synthetic fixture
#     ./tools/dashboard.sh -- --port 8080   # extra args go to vite
#
# The dashboard itself lives in the skill (it is a viewer, not part of the
# record, so it is not copied into the repo). This script finds it, installs
# its dependencies on first run, and points it at this repo.
set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

MODE="dev"
if [[ "${1:-}" == "--demo" ]]; then
  MODE="demo"
  shift
fi
[[ "${1:-}" == "--" ]] && shift

# Where the skill lives. COACH_SKILL_DIR wins; otherwise check the repo-local
# copies first, then a global install.
CANDIDATES=(
  "${COACH_SKILL_DIR:-}"
  "$REPO_ROOT/.claude/skills/leetcode-coach"
  "$REPO_ROOT/.agents/skills/leetcode-coach"
  "$HOME/.claude/skills/leetcode-coach"
)

DASH=""
for dir in "${CANDIDATES[@]}"; do
  [[ -n "$dir" && -f "$dir/assets/dashboard/package.json" ]] || continue
  DASH="$dir/assets/dashboard"
  break
done

if [[ -z "$DASH" ]]; then
  cat >&2 <<EOF
error: could not find the leetcode-coach dashboard.

Looked in:
$(printf '  %s\n' "${CANDIDATES[@]:1}")

Set COACH_SKILL_DIR to the skill directory (the one containing SKILL.md) and
retry. The training record is unaffected — every number the dashboard shows is
also reachable with: python3 tools/coachdb.py stats|query|trend
EOF
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  cat >&2 <<'EOF'
error: npm is not installed, so the dashboard cannot run.

It is a convenience, not the record. Everything it displays is available from
the CLI, which needs nothing beyond Python 3:
  python3 tools/coachdb.py stats  --session <key>
  python3 tools/coachdb.py query   sessions --tag "#weakness:off-by-one"
  python3 tools/coachdb.py trend   --dimension complexity-analysis
EOF
  exit 1
fi

if [[ ! -d "$DASH/node_modules" ]]; then
  echo "coach: first run — installing dashboard dependencies (this takes a minute)…" >&2
  (cd "$DASH" && npm install --no-audit --no-fund) >&2
fi

echo "coach: serving $REPO_ROOT" >&2
cd "$DASH"
COACH_REPO_ROOT="$REPO_ROOT" exec npm run "$MODE" --silent -- "$@"
