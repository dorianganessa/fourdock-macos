# Plan and handoff

Updated: 2026-11-09. **Prototype; not ready for daily use.**

## Actual owner launch, 2026-11-09 16:31 CET

The owner subsequently attempted a normal app launch and reported an executable-
missing alert. Fresh read-only investigation now confirms this build's rejection:
amfid logged AppleMobileFileIntegrityError -423 at 16:31:11.155 for the probe's
executable, followed by LaunchServices exit status 9. The executable directory is
now empty and its modification time matches 16:31:11. The original ZIP still
contains the expected executable; its name agrees with CFBundleExecutable.
This is a new observed failure, superseding the untested status in the earlier
review below. Which component removed the file remains unidentified; a universal
company policy has not been established. No rebuild/restore/retry was performed.
Real WhatsApp/Gmail checks remain blocked; next dependency is an execution/signing
route accepted by this Mac. The owner has no IT route, and no repeat approval
question is pending. See docs/evidence/webkit-target-launch.json.

## Execution evidence correction, 2026-11-09

The owner challenged the certainty of the new probe's reported block. The new
WebKit app has never been launched locally, so rejection of this build has NOT
been verified. Read-only checks: codesign --verify --deep --strict passes and
spctl --assess --type execute returns rejected. The latter is a Gatekeeper policy
assessment, not an execution attempt or proof of an enterprise-wide ad-hoc ban.
The first build's AMFI failure is historical evidence for that build only; the
precise cause remains unconfirmed. Earlier BLOCCATO wording below describes our
execution hold, not a newly observed failure. No security settings changed and
no local launch was attempted during this review.

## Current direction — Swift/WebKit compatibility probe

The owner questioned the normal-browser UX and authorized a minimal Swift +
WKWebView probe before committing to Electron. See [WEBKIT_PROBE.md](WEBKIT_PROBE.md).
The two-service app is independently packaged; no change to the existing working
Chrome workspace or profiles. Local compilation, ad-hoc signature verification
and fixture source type-checking passed using the installed Command Line Tools.
Explicit Xcode DEVELOPER_DIR encountered an unaccepted license; no license was
accepted and no global toolchain/security setting changed.

Native execution and real WhatsApp/Gmail tests remain BLOCCATO. The owner said
IT authorization/signing is not available. Do not retry execution or ask the same
approval question again. CI synthetic WebKit checks are the available independent
validation; they cannot establish real authentication, device approval or resource
use. The existing Chrome draft/notification checks were deferred by the owner;
"credo funzioni" is not a confirmed pass.

Retain both runtime options without declaring a migration. Actual WebKit login
testing requires an approved execution environment and owner-only authentication.

Synthetic CI subsequently passed on macos-26 arm64:
https://github.com/dorianganessa/fourdock-macos/actions/runs/42532731659,
source c486831ff2aca33e86a3a43b6b18c9b079bf9d39. W02 passes isolation,
50 switches/drafts, close/reopen, popup/opener/close and full-process storage/cookie
persistence. Downloaded production ZIP checksum/contents and extracted signature
verified without execution here. Evidence: docs/evidence/webkit-probe-ci.json.
Next dependency is an approved execution environment for owner-only W03/W04;
the owner cannot obtain that approval for this Mac. No login retry is pending.
Existing Chrome/native regression workflow 42532731468 also passed both
architectures for this source commit; the new probe did not replace that product.

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
  Chrome probe before passkey. Alternate phone-number authentication and recovery
  of the already-linked WhatsApp session inside the extension workspace are now
  owner-confirmed (2026-11-07). All four account logins and full dedicated-browser
  restart persistence are now confirmed. Original passkey participation is
  unreported, and QR/passkey acceptance remains open.
- [ ] 2: Four-service browser workspace, sidebar, Cmd+1–4, live-tab adoption,
  non-discardable tabs, title-only badges, preferences, diagnostics, scoped reload,
  browser attachments and optional Swift bridge implemented. Native execution on
  target blocked by signing policy; window-close behavior remains a functional gap.
- [ ] 3: Four logic tests and fourteen fixture checks pass on both macOS CI
  architectures. All four account logins and full-restart persistence are manually
  confirmed. Real drafts, OS notifications, attachments, sleep/wake and target
  native packaged-app behavior remain unverified.
- [ ] 4: Three fixture startups, 50 switches and 300.31 seconds idle measured.
  Real authenticated performance and prolonged usage remain unmeasured; no
  lightweight claim or Ferdium comparison.
- [ ] 5: Personal repository, MIT/license notices, English README, CI, inspected
  native ZIPs, checksums and prototype delivery published. Daily-use acceptance
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
The official phone-number method was reported successful by the owner. On
2026-11-07 the owner confirmed that the extension workspace recovers WhatsApp
already linked and opens Telegram, Fastmail and Gmail. This verifies alternate
WhatsApp authentication and workspace session access. The owner subsequently
confirmed all four account logins and a complete dedicated-browser restart with
all sessions intact. Original QR/passkey participation remains unreported.
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

1. Obtain owner results for the requested unsent-draft/Cmd+1–4 check and a valid
   incoming notification while minimized, including its click destination. No
   pairing or login retries are needed for the already-working accounts.
2. Prepare owner-only synthetic attachment preview/cancel/download checks, then
   controlled offline/online and physical sleep/wake, preserving unsent drafts.
   Do not send to contacts or manipulate security/network policy.
3. After active checks finish and the owner leaves the four services idle, collect
   300 seconds using the read-only real-workspace resource observer. Earlier
   fixture startup/switch numbers remain separate. Native signing approval and
   close-to-hide/Chrome identity constraints remain independent blockers.

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

Owner confirmed WhatsApp workspace recovery and all four service pages opening
on 2026-11-07. All logins and full-restart persistence were then owner-confirmed. If an earlier
unpacked extension was
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
Next dependency: owner draft/background-notification results. All four account
logins and full-restart persistence are confirmed; original QR/passkey acceptance
remains open.

## Owner verification, 2026-11-07

PASS MANUALE CONFERMATO: Fourdock's extension workspace recovers WhatsApp already
linked and opens the other three services, reported directly by the owner. No
account content, identifiers or screenshots were requested or inspected. Scope:
session access and service opening only. The owner has been asked to complete
Telegram/Fastmail/work Gmail logins through official UI and report outcomes.
This first observation did not cover QR/passkey, restart, drafts, notifications
or real attachments. Restart was subsequently confirmed in the checkpoint below.

## Owner verification, 2026-11-07 — all services and restart

PASS MANUALE CONFERMATO: owner reported login completed for every service and
successful authenticated return for all four after the requested full exit/reopen
of the dedicated browser. Individual SSO/MFA/popup details were not reported.
The original QR/passkey requirement remains open, and native target execution is
still blocked. No account contents were inspected and no messages were sent.
Next requested checks: unsent draft across service switching and a genuine
incoming notification while minimized, with correct destination after clicking.
An initial self-message notification suggestion was corrected; it is not a valid
standalone negative test. Real-process measurement tooling is prepared; its short
validation run was uncontrolled, not an idle benchmark, and remains private.
