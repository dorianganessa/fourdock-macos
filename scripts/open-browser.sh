#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -x "$CHROME" ]; then echo 'Install official Google Chrome in /Applications.' >&2; exit 1; fi
PROFILE="$HOME/Library/Application Support/Fourdock-Browser-Probe"
mkdir -p "$PROFILE"
chmod 700 "$PROFILE"
echo 'In chrome://extensions: enable Developer mode, Load unpacked, select:'
echo "$PWD/extension"
if [ "${1:-}" = "--auth-probe" ]; then
  # Same signed runtime/profile as the extension-only workspace; no API overrides.
  exec "$CHROME" "--user-data-dir=$PROFILE" --no-first-run --no-default-browser-check --new-window https://web.whatsapp.com/ https://mail.google.com/ >/dev/null 2>&1
else
  exec "$CHROME" "--user-data-dir=$PROFILE" --no-first-run --no-default-browser-check chrome://extensions/ >/dev/null 2>&1
fi
