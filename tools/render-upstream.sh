#!/usr/bin/env bash
# Render the Ink Studio native scene to PNG.
# Usage: INK_STUDIO=/path/to/ink-studio bash tools/render-upstream.sh [t]
set -euo pipefail
INK="${INK_STUDIO:-/tmp/ink-studio}"
T="${1:-0}"
cd "$(dirname "$0")/.."
if [ ! -d "$INK" ]; then
  git clone --depth 1 https://github.com/siliconjungle/shapeshift-labs-ink-studio.git "$INK"
fi
node "$INK/cli/ink-studio.js" render scenes/qingming-night.js --t "$T" --out out/qingming.png
node "$INK/cli/ink-studio.js" stats scenes/qingming-night.js
echo "wrote out/qingming.png"
