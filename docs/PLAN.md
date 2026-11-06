# Plan and handoff

Updated: 2026-11-06. **Prototype; not ready for daily use.**

## Environment and ownership

Target: company-managed macOS 27.0.1 (26A434), arm64. Node 26.4.0 / npm 11.17.0,
Swift 6.4, Xcode 27.2 via DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer.
Installed official Chrome 157.0.8103.39 has the browser passkey entitlement; its
minimum OS is 13.0. Fourdock targets 13.5 for the documented iCloud passkey support.
Older OS versions remain untested. Existing regular Chrome and Ferdium profiles
have not been modified. GitHub personal User account dorianganessa verified.
Public MIT repository: https://github.com/dorianganessa/fourdock-macos.
Commits use the owner's verified GitHub noreply identity.

## Phase status and exit criteria

- [x] 0: Environment, toolchain, ownership, scoped repository and plan established.
- [ ] 1: Official capability investigation complete. QR linking failed in the signed
  Chrome probe before passkey. Owner subsequently reported phone-number linking
  "worked"; exact chat loading/passkey participation and restart persistence are
  awaiting clarification. Work Gmail unverified. No QR/passkey acceptance pass.
- [ ] 2: Four-service browser workspace, sidebar, Cmd+1–4, live-tab adoption,
  non-discardable tabs, title-only badges, preferences, diagnostics, scoped reload,
  browser attachments and optional Swift bridge implemented. Native execution on
  target blocked by signing policy; window-close behavior remains a functional gap.
- [ ] 3: Four logic tests and fourteen fixture checks pass on both macOS CI
  architectures. Real four-account logins, OS notifications, attachments,
  sleep/wake and target packaged-app behavior remain unverified.
- [ ] 4: Three fixture startups, 50 switches and 300.31 seconds idle measured.
  Real authenticated performance and prolonged usage remain unmeasured; no
  lightweight claim or Ferdium comparison.
- [ ] 5: Personal repository, MIT/license notices, English README, CI, inspected
  native ZIPs, checksums and prototype delivery prepared. Daily-use acceptance
  remains blocked by the real functional gates above.

## Architecture and known limits

Official Google Chrome runs the sites as top-level tabs in a dedicated profile.
The extension creates one normal window and adopts already-open service tabs
without reloading or copying authentication data. Chrome's toolbar/tab strip,
notifications identity and Dock icon remain. The optional Swift launcher supplies
a separate Dock/menu bridge and ordinary links to the default browser.

Hide minimizes and preserves loaded services. Chrome window close closes tabs and
can discard drafts. Chrome Cmd+Q closes the browser but does not itself terminate
the separate launcher. Those original lifecycle requirements are not waived.
Site themes are site preferences; Fourdock's theme preference controls its sidebar.

Native compilation/signing succeeded locally, but the first executable was killed
and subsequently absent. AMFI logged -423 (ad-hoc/unknown certificate chain); no
signing identities exist. The user confirmed device management. No further native
execution was attempted to bypass policy. Approved signing and/or IT authorization
is required. See SIGNING.md. CI ad-hoc execution does not authorize this Mac.

## Authentication evidence

See AUTHENTICATION.md. Original Ferdium: passkey confirmation fails before a phone
prompt. Signed Chrome probe: QR hangs; retry cannot link on phone before passkey.
Capacity excluded. Existing regular-browser session works and remains untouched.
The official phone-number method was reported successful by the owner.
The owner was asked whether chats opened and a passkey was required.

The ready extension's installation page has been opened in the same dedicated
probe profile. Owner is asked to Load unpacked from the repository's extension
folder and Open workspace. It should adopt the already-linked WhatsApp tab.
Do not inspect account pages/data while the owner authenticates. No messages sent.
Do not copy cookies, delete passkeys, reset profiles or log out working devices.

## Verified builds and artifacts

Artifact source commit: be47d4653061e754eb906b2b1b20e695b0bd6e84.
Green workflow (both architectures):
https://github.com/dorianganessa/fourdock-macos/actions/runs/42255453874.

CI performs clean checkout, npm ci, syntax/identity checks, four logic tests,
Swift build, ad-hoc signature verification, native framing self-check, fourteen
headful browser fixture checks, and artifact upload. arm64: macos-26; Intel:
macos-15-intel. An earlier Intel immediate keyboard assertion was corrected with
a bounded wait for observed selection. The macos-15 arm64 pool stalled in queue;
the official macos-26 pool completed successfully.

Both ZIPs downloaded, allowlists inspected, bundled source/licenses compared
byte-for-byte and signatures verified without execution on the target.

| Archive | ZIP bytes | Uncompressed bytes | SHA-256 |
|---|---:|---:|---|
| Fourdock-macOS-arm64.zip | 61889 | 212351 | a2a73619dee57a574414c1555a5132e2993facbcbdbcb20271e8ba6878f097fa |
| Fourdock-macOS-x86_64.zip | 61005 | 173647 | ddd78a5e70ea6fd907410c4646555c3ae7175cadcc184fd42e36a4e964b8bea9 |

These packages contain the launcher/extension/notices; official Chrome is required
separately. Prototype delivery tag: v0.1.1-prototype. SHA256SUMS and build
provenance accompany delivery. No Developer ID signature/notarization is claimed.
No browser profile, credential, account content or private screenshot is packaged.

## Performance evidence

Local fixture benchmark: window API-ready proxies 2.027 / 1.357 / 1.006 s;
four-fixture readiness 3.953 / 1.745 / 1.340 s. Median selection request 12.54 ms,
p95 16.34 ms. Five-minute mean CPU 1.40% of one core; mean aggregate RSS
754.71 MiB, final 520.67 MiB. Includes testing browser/children and Node, excludes
blocked native launcher. See PERFORMANCE.md and raw anonymous evidence.
Do not interpret API acknowledgements as measured first paint or these numbers as
authenticated app costs. No performance optimization has been claimed.

## Next three concrete actions

1. Obtain the owner's two integration observations: whether successful phone-number
   linking opened chats/used a passkey; whether loading the extension adopted that
   live tab without a new login. Preserve this dedicated-profile session.
2. After integration, have owner complete Gmail/Telegram/Fastmail login and a
   restart-persistence check; then controlled incoming notifications, synthetic
   attachments and real network/sleep-wake checks. Never send to contacts without
   explicit authorization. Keep QR/passkey acceptance separately failed/unverified.
3. Obtain approved native signing/IT authorization, verify packaged-app opening and
   native bridge on target, then resolve close-to-hide/Chrome identity constraints
   through a supported architecture. Update TESTING.md and measure authenticated
   service costs before declaring daily-use readiness.

## Final 0.1.1 verification checkpoint

Both CI hosts also opened the actual packaged AppKit window, observed it through
WindowServer metadata, checked the user-private socket and scoped host manifest,
and delivered a framed native-host message into that running process. Evidence:
docs/evidence/native-ci.json. This is a native CI execution check, not target-Mac
approval or an account login test.

Compilation-only packaging also succeeded on the managed Mac with
FOURDOCK_BUILD_ONLY=1 npm run build. This does not execute the blocked binary.
The default CI path still executes the native self-check and GUI/IPC test.

0.1.1 corrects WhatsApp's absolute-root overlap with the rail, confirmed using only
public unauthenticated geometry: at 1280px width, service left=68, rail right=68,
service right=1280. It uses a closed rail shadow root, exercises buttons through
accessibility, and initializes title counts/selected identity on live-tab adoption.
No authenticated page contents or QR images were captured. The historical fixture
performance baseline predates live-tab adoption and these layout changes.

Owner integration feedback remains pending. If an earlier unpacked extension was
already loaded, Reload it in chrome://extensions, then refresh service tabs only
after the owner preserves any unsent drafts. Never automatically reload their
pages or clear authentication data. Final delivery:
https://github.com/dorianganessa/fourdock-macos/releases/tag/v0.1.1-prototype.

## Publication receipt

0.1.1 prerelease published and verified (not a draft), with both architecture ZIPs,
SHA256SUMS.txt and BUILD-PROVENANCE.json. Tag target / release source:
1da09bdb8ea349172607971ce2e6b10593c6b72d; compiled artifact source is be47d46.
Public anonymous ARM download succeeded and its SHA-256 matched the recorded hash.
0.1.0 remains in history, marked superseded. Source tree is clean apart from this
final receipt update. No real account acceptance gate has been silently passed.
Owner integration and exact chat/passkey feedback remain the next dependency.
