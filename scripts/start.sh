#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -x dist/Fourdock.app/Contents/MacOS/Fourdock ]; then bash scripts/build.sh; fi
open dist/Fourdock.app
