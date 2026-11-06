#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
ARCH="${FOURDOCK_ARCH:-$(uname -m)}"
case "$ARCH" in arm64|x86_64) ;; *) echo "Unsupported architecture: $ARCH" >&2; exit 1;; esac
APP="$PWD/dist/Fourdock.app"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources/extension"
SDK="$(xcrun --sdk macosx --show-sdk-path)"
xcrun swiftc -swift-version 5 -O -sdk "$SDK" -target "$ARCH-apple-macos13.5" -framework AppKit native/main.swift -o "$APP/Contents/MacOS/Fourdock"
cp extension/* "$APP/Contents/Resources/extension/"
cp LICENSE "$APP/Contents/Resources/LICENSE"
cp docs/THIRD_PARTY_NOTICES.md "$APP/Contents/Resources/THIRD_PARTY_NOTICES.md"
cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>Fourdock</string>
<key>CFBundleIdentifier</key><string>com.fourdock.macos</string>
<key>CFBundleName</key><string>Fourdock</string>
<key>CFBundleDisplayName</key><string>Fourdock</string>
<key>CFBundleVersion</key><string>2</string>
<key>CFBundleShortVersionString</key><string>0.1.1</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>LSMinimumSystemVersion</key><string>13.5</string>
<key>NSHighResolutionCapable</key><true/>
<key>NSPrincipalClass</key><string>NSApplication</string>
</dict></plist>
PLIST
codesign --force --sign - "$APP"
codesign --verify --deep --strict "$APP"
if [ "${FOURDOCK_BUILD_ONLY:-0}" = "1" ]; then
  echo "Build only: native execution not checked on this host."
else
  "$APP/Contents/MacOS/Fourdock" --self-test
fi
ditto -c -k --sequesterRsrc --keepParent "$APP" "dist/Fourdock-macOS-$ARCH.zip"
shasum -a 256 "dist/Fourdock-macOS-$ARCH.zip" > "dist/Fourdock-macOS-$ARCH.zip.sha256"
echo "Built $APP (ad-hoc signed; not notarized)"
