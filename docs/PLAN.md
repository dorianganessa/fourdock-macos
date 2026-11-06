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
- [ ] 3: Four logic tests and twelve fixture checks pass on both macOS CI
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

Artifact source commit: 409647319f51f18312b10cfc8deacd5b948b068e.
Green workflow (both architectures):
https://github.com/dorianganessa/fourdock-macos/actions/runs/42247664905.

CI performs clean checkout, npm ci, syntax/identity checks, four logic tests,
Swift build, ad-hoc signature verification, native framing self-check, twelve
headful browser fixture checks, and artifact upload. arm64: macos-26; Intel:
macos-15-intel. An earlier Intel immediate keyboard assertion was corrected with
a bounded wait for observed selection. The macos-15 arm64 pool stalled in queue;
the official macos-26 pool completed successfully.

Both ZIPs downloaded, allowlists inspected, bundled source/licenses compared
byte-for-byte and signatures verified without execution on the target.

| Archive | ZIP bytes | Uncompressed bytes | SHA-256 |
|---|---:|---:|---|
| Fourdock-macOS-arm64.zip | 61543 | 211601 | c2b79286d91f48373219a94b278d068cafabad7cf093a1b021a14e0fb9c9c952 |
| Fourdock-macOS-x86_64.zip | 60670 | 172897 | 5b7285e2254555d1c0986dd6edc9e8f64958ef70108d2b214541f4d455a3e0c4 |

These packages contain the launcher/extension/notices; official Chrome is required
separately. Prototype delivery tag: v0.1.0-prototype. SHA256SUMS and build
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
