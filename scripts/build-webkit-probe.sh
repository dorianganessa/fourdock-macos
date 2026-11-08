#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
ARCH="${FOURDOCK_ARCH:-$(uname -m)}"
case "$ARCH" in arm64|x86_64) ;; *) echo 'Unsupported architecture' >&2; exit 1;; esac
NAME=Fourdock-WebKit-Probe
ENTRY=native/webkit-probe/main.swift
IDENTIFIER=com.fourdock.webkit-probe
if [ "${1:-}" = "--fixtures" ]; then
  if [ "${CI:-}" != true ]; then echo 'Fixture execution/build is CI-only on approved hosts.' >&2; exit 1; fi
  NAME=Fourdock-WebKit-Fixtures
  ENTRY=tests/webkit-probe/main.swift
  IDENTIFIER=com.fourdock.webkit-fixtures
elif [ "$#" != 0 ]; then echo 'Unknown argument' >&2; exit 1; fi
APP="$PWD/dist/$NAME.app"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
SDK="$(xcrun --sdk macosx --show-sdk-path)"
xcrun swiftc -swift-version 5 -O -sdk "$SDK" -target "$ARCH-apple-macos14.0" \
  -framework AppKit -framework WebKit native/webkit-probe/Probe.swift "$ENTRY" \
  -o "$APP/Contents/MacOS/$NAME"
cat > "$APP/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>$NAME</string>
<key>CFBundleIdentifier</key><string>$IDENTIFIER</string>
<key>CFBundleName</key><string>$NAME</string>
<key>CFBundleVersion</key><string>1</string>
<key>CFBundleShortVersionString</key><string>0.1.0</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>LSMinimumSystemVersion</key><string>14.0</string>
<key>NSHighResolutionCapable</key><true/>
<key>NSPrincipalClass</key><string>NSApplication</string>
</dict></plist>
PLIST
cp LICENSE "$APP/Contents/Resources/LICENSE"
codesign --force --sign - "$APP"
codesign --verify --deep --strict "$APP"
ditto -c -k --sequesterRsrc --keepParent "$APP" "dist/$NAME-$ARCH.zip"
shasum -a 256 "dist/$NAME-$ARCH.zip" > "dist/$NAME-$ARCH.zip.sha256"
echo "Compiled and packaged $NAME ($ARCH). Not executed; ad-hoc signed, not notarized."
