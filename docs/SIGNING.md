# Signing and managed-device handoff

Current builds are ad-hoc signed. The managed target rejected the first locally
built executable (AMFI -423); no trusted signing identity is available. Native
execution has not been retried to bypass policy. The CI build can be inspected
without running it, but CI success does not grant device approval.

For a native installation, obtain IT approval and a signing identity accepted by
the device. An ordinary Developer ID and notarization may still be insufficient
under company policy. Extension installation in the dedicated Chrome profile may
also require the company's extension approval. Preserve Chrome's own signature.

The native launcher uses AppKit/Foundation and a user-only local socket; it does
not implement WebAuthn or require Apple's browser passkey entitlement. The full
official Chrome process handles service authentication with its own capabilities.
An approved launcher signature therefore addresses execution trust only; the
WhatsApp authentication failure remains independent.

## Prepared distribution procedure (not executed)

Run on an approved signing Mac, using its own Keychain identity and an existing
notarytool Keychain profile. Do not put credentials, certificates or app-specific
passwords in this repository or chat. Start from an inspected CI artifact or an
approved-host local build. Replace the example signing identity with the real
accepted identity; the environment variables below contain identity/profile names,
not private key material.

```sh
export FOURDOCK_SIGN_IDENTITY='Developer ID Application: YOUR NAME (TEAMID)'
export FOURDOCK_NOTARY_PROFILE='FourdockNotary'
codesign --force --options runtime --timestamp \
  --sign "$FOURDOCK_SIGN_IDENTITY" dist/Fourdock.app
codesign --verify --deep --strict --verbose=2 dist/Fourdock.app
ditto -c -k --keepParent dist/Fourdock.app dist/Fourdock-for-notary.zip
xcrun notarytool submit dist/Fourdock-for-notary.zip \
  --keychain-profile "$FOURDOCK_NOTARY_PROFILE" --wait
```

Proceed **only if the submission status is Accepted**. If rejected, inspect the
notary log privately and fix the reported issue, then submit again.

```sh
xcrun stapler staple dist/Fourdock.app
xcrun stapler validate dist/Fourdock.app
spctl --assess --type execute --verbose=2 dist/Fourdock.app
ditto -c -k --sequesterRsrc --keepParent \
  dist/Fourdock.app dist/Fourdock-signed-notarized.zip
shasum -a 256 dist/Fourdock-signed-notarized.zip
```

Only label the resulting archive signed/notarized after these checks pass. Test its
actual installation/opening on the target under the company's policy. Never change
global Gatekeeper, AMFI, MDM, VPN or TLS settings for this project. No Apple account,
certificate purchase, key import or submission has been attempted here.

Apple documentation checked 2026-11-06:
- https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution
- https://developer.apple.com/documentation/security/customizing-the-notarization-workflow
