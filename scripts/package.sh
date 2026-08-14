#!/usr/bin/env bash
# Package the Chrome extension for Chrome Web Store upload.
# Creates dist/ai-export-assistant-vX.Y.Z.zip containing ONLY files
# required at runtime (no docs, no scripts, no .git).

set -euo pipefail

cd "$(dirname "$0")/.."

VERSION=$(grep '"version"' manifest.json | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')
OUT_DIR="dist"
OUT_ZIP="${OUT_DIR}/ai-export-assistant-v${VERSION}.zip"

mkdir -p "$OUT_DIR"
rm -f "$OUT_ZIP"

# Runtime-required paths (keep this list in sync with manifest.json)
FILES=(
  manifest.json
  _locales
  background
  content
  icons
  lib
  popup
  options
  welcome
)

python3 - "$OUT_ZIP" "${FILES[@]}" <<'PY'
import sys, zipfile, os

out_zip = sys.argv[1]
paths = sys.argv[2:]
with zipfile.ZipFile(out_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in paths:
        if os.path.isfile(p):
            zf.write(p)
        elif os.path.isdir(p):
            for root, dirs, files in os.walk(p):
                for f in files:
                    full = os.path.join(root, f)
                    zf.write(full)
print("done")
PY

echo "✅ Packaged: $OUT_ZIP"
python3 - "$OUT_ZIP" <<'PY'
import sys, zipfile, os
zp = sys.argv[1]
with zipfile.ZipFile(zp) as zf:
    names = zf.namelist()
    print(f"   {len(names)} files")
    for n in names[:15]:
        print("   " + n)
    if len(names) > 15:
        print(f"   ... and {len(names)-15} more")
print("   Size: %.1f KB" % (os.path.getsize(zp)/1024))
PY