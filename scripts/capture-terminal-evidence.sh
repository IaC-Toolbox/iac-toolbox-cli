#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$PROJECT_ROOT/docs/evidence"
OUT_TXT="$OUT_DIR/terminal-run.txt"
OUT_PNG="$OUT_DIR/terminal-run.png"
VENV_DIR="$PROJECT_ROOT/.venv-evidence"

mkdir -p "$OUT_DIR"
cd "$PROJECT_ROOT"

npm run build >/dev/null
script -q -c "timeout 3 npm start" "$OUT_TXT" >/dev/null 2>&1 || true
python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
pip install -q pillow
python scripts/render-terminal-evidence.py

echo "Created: $OUT_TXT"
echo "Created: $OUT_PNG"
