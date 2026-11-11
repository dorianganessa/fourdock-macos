# Testing ledger

Updated: 2026-11-11. Automated baseline: 2026-11-06. Target: managed macOS 27.0.1 arm64. Synthetic UI runtime:
Chrome for Testing 157.0.8103.38, Playwright 1.56.1, Node 26.4.0. Profiles are
temporary. External DNS is blocked only in the synthetic browser; attached page
navigations are fulfilled from fixtures. Automated checks use no real credentials
or messages. Manual checks below are based on owner reports; the agent has not
inspected account content.

Allowed states: PASS AUTOMATICO, PASS MANUALE CONFERMATO, FAIL, BLOCCATO, NON ESEGUITO.
Only the explicitly confirmed manual subtests are passed. Fixture subtests do not
pass real-account requirements.
Sanitized automated results: [evidence/ui-results.json](evidence/ui-results.json).

## Mission Control candidate implementation, 2026-11-11

- PASS AUTOMATICO: local Node26 production build, 558 API tests and 486 UI tests
  on the pinned reused client plus Fourdock pairing adapter. Web tests explicitly
  disable Node experimental webstorage for workers so jsdom supplies localStorage;
  normal browser behavior is unchanged.
- PASS AUTOMATICO: isolated Linux container --network none, no store mounts:
  existing patched CLI exposes auth pair; read-only doctor in a fresh tmpfs store
  does not create session.db. No live account was opened or connection attempted.
- PASS AUTOMATICO: separate live candidate image builds; container starts with
  its own named volume and 127.0.0.1:4702 bind. Read-only health check confirms
  CLI 0.20.0, authenticated=false and sync stopped. No production store is mounted.
- PASS AUTOMATICO: workflow 42960440631, source 83d4a37, clean Linux Node24 build,
  compose validation, 558+486 unit tests and four browser checks in Chromium141.
  The reused list/thread, PWA/icons/service worker, badge/notification API calls,
  pairing pipes and loaded extension's trusted activation/assertion return pass.
  Initial extension tab navigation is controlled by the fixture to avoid its
  DNS-confined first request preceding automation attachment. No real WebAuthn
  ceremony occurs; OS badge/banner delivery is stubbed. Screenshot inspected.
  [Sanitized browser evidence](evidence/mission-control-ui.json).
- Owner replied "fatto" to the PWA install/test steps. Separate icon, Dock badge3
  and banner outcomes remain requested; do not infer all passed from that reply.
- PASS AUTOMATICO: after announcing the transition, stopped only the owned idle
  demo and connected a private SSH loopback tunnel. Local HTTP health confirms
  live mode, no stored session, authenticated=false and sync stopped. No pairing
  was started. The live candidate now occupies 127.0.0.1:4702; demo is stopped.
- NON ESEGUITO: individual target PWA icon/OS badge/banner confirmation, helper
  installation in the PWA profile, live passkey/linking/persistence and incoming
  events. Await owner actions in the app; do not inspect account content.

Existing Chrome/native test results cannot be transferred to this candidate.

## Reopened wacli reuse research, 2026-11-10

Completed source/metadata review, not an execution test: Mission Control 0.2.6
at 4d4ffaf, its CLI adapter/daemon, notification/title badge implementations,
MIT license, WA Passkey Connector interface, upstream wacli auth documentation,
and current Chrome macOS PWA attribution/permission requirements.
NON ESEGUITO: candidate UI/CLI build or tests, live auth, new session compatibility,
PWA install/OS badge/banner, global shortcut or four-service integration.
No production service, existing session or private monitor source was changed.
See WACLI_REUSE.md. Existing Chrome test results below remain applicable only to
that implementation and cannot be transferred to these candidates.

## Chrome extension 0.2.0, 2026-11-10

- PASS MANUALE CONFERMATO: owner reports the requested global shortcut works
  (Control+Shift+1 to WhatsApp from another app). Other service shortcuts remain
  individually unverified; do not infer a pass for all four physical combinations.
- FAIL for requested Dock unread indication in the extension-only workspace:
  owner sees no Dock indication. Source confirms chrome.action.setBadgeText
  updates the toolbar extension icon; NSApp.dockTile.badgeLabel requires the
  unavailable native bridge. This is a known missing capability, not proof that
  banner delivery failed. Preferences now state the exact badge locations.
- NON ESEGUITO: actual target banner delivery still has no owner confirmation.
  The synthetic notification test does not increment service unread counts.
- PASS AUTOMATICO: local syntax/permission/identity/icon checks and eleven Node
  tests. They cover the actual background command handler selecting all four
  retained tabs and restoring a minimized workspace, refusal of foreign origins,
  frames/unmanaged tabs, per-service notification opt-out, page/isolated transport
  in either startup order, sender/preview retention, site click callback, tag
  replacement/close, permission/disconnection fallback, payload-free session
  routing and click routing after constructing a new worker relay.
- PASS AUTOMATICO: workflow 42807740191 at source 7ad9702, both macos-26 arm64 and
  macos-15-intel. All sixteen Chromium fixture checks pass, including real
  MAIN/isolated worlds, synthetic notification preview/click transport and four
  registered global commands. OS banner delivery is deliberately stubbed.
  Packaged native startup, recursive icon installation, scoped host registration
  and IPC pass on CI. The earlier run failed because the old flat resource copier
  treated the new icon directory as a file; the copier and its check were fixed.
  Downloaded arm64 ZIP checksum and all five packaged icons verified read-only;
  no native execution on this managed target. See notification-relay-ci.json.
- NON ESEGUITO: target physical global key delivery from another app; actual
  service banners, artwork, preview and click destination with the workspace
  minimized; whether each service emits page notifications or worker pushes.
  Preferences provide four synthetic notification tests. Real incoming messages
  remain owner-only and are not replaced by synthetic passes.

No page/account content is recorded. See CHROME_NOTIFICATIONS.md for coverage
limits. Existing T01–T13 statuses below remain unchanged by these additions.

| ID | Procedure / expected result | State | Observed evidence / next action |
|---|---|---|---|
| T01 | Fresh WhatsApp → QR → actual passkey → chats → restart persists | FAIL | QR probe failed before passkey. Alternate phone-number login and persistence after full restart are confirmed separately. The original QR/passkey path remains unresolved |
| T01-alt | Official phone-number login → existing WhatsApp session accessible in extension workspace | PASS MANUALE CONFERMATO | 2026-11-07, target Mac, owner confirms Fourdock recovers WhatsApp already linked. The owner subsequently confirmed successful full dedicated-browser restart with all four sessions intact. Passkey participation is not covered |
| T02 | Telegram login → restart persists | PASS MANUALE CONFERMATO | 2026-11-07, target Mac: owner confirms login completed and authenticated session returned after complete dedicated-browser exit/reopen. Next: drafts/notifications/attachments checks |
| T03 | Fastmail login + MFA → restart persists | PASS MANUALE CONFERMATO | 2026-11-07, target Mac: owner confirms actual account login and session present after complete dedicated-browser exit/reopen. MFA details unreported; no forced alternate-factor test. Next: notifications/attachments |
| T04 | Work Gmail + SSO/MFA, redirect/popup → restart persists | PASS MANUALE CONFERMATO | 2026-11-07, target Mac: owner confirms corporate account login and authenticated return after complete dedicated-browser exit/reopen. Individual SSO/MFA/popup paths unreported. Next: incoming-mail notifications and attachments |
| T05 | 50 switches; no reload; drafts and shortcuts preserved | PASS AUTOMATICO | Four fixture document identities/drafts retained after 50 selections; sidebar and actual Cmd+3 checked. Repeat real draft checks after login |
| T06 | Unselected/hidden/background notifications, badges, click destination | NON ESEGUITO | Title-count parser tests pass. Actual Chrome/macOS delivery, native Dock bridge and click destination require verification |
| T07 | Synthetic file select/drag, preview/cancel/download | NON ESEGUITO | File selection and browser download subtests PASS AUTOMATICO. Drag/drop, real preview/cancel and destination opening pending |
| T08 | External links, login popup/opener/close, internal navigation | NON ESEGUITO | Fixture popup/opener/close and bridge-free external-tab fallback PASS AUTOMATICO. Actual account login works; provider-specific popup behavior and native default-browser bridge remain unverified |
| T09 | Close-to-hide, Dock reopen, Cmd+Q, restart, scoped logout | FAIL | Minimize/show retains documents (automatic). Chrome window close closes tabs: known gap. Native menu/Dock checks blocked by execution policy |
| T10 | Offline/online, sleep/wake, isolated failure recovery | NON ESEGUITO | Fixture offline/online preserves draft; scoped reload preserves other services; origin storage survives. Physical sleep/wake and actual service recovery pending |
| T11 | Clipboard, zoom, focus, resize, themes, keyboard | NON ESEGUITO | Fixture zoom, saved dark preference and keyboard selection pass; synthetic screenshot inspected. Clipboard, real layouts, small windows and accessibility pending |
| T12 | Install/open packaged build on target Mac; timely permissions | BLOCCATO | Swift compiled and signed; first native execution rejected by AMFI -423; executable subsequently absent. Managed Mac confirmed; no signing identity. Need approved signing/IT authorization |
| T13 | Clean clone build/test; GitHub macOS workflows/artifacts | PASS AUTOMATICO | Both jobs of workflow 42255453874 passed clean checkout/install/build/protocol, actual native window/IPC checks and fourteen browser fixture checks. Inspected ZIPs and verified signatures without target execution. Evidence: ci-arm64-ui-results.json and ci-x86_64-ui-results.json |

## Automated procedures and observations

`npm run check && npm test`: syntax, narrow permissions, extension identity, exact
HTTPS origins, deceptive URLs, safe schemes, explicit title counts and bounded
preferences. Four logic tests passed locally.

`npm run test:ui`: creates the four-tab topology, loads synthetic service documents,
checks 50 switches/drafts, sidebar, Cmd+3, minimize/show, preferences and zoom,
offline/online, file select/download, popup/opener/closure, external fallback and
isolated reload. Full browser restart preserves preferences and origin localStorage.
Screenshots contain synthetic text only. No passkey success is emulated.

`npm run build`: compiles Swift, ad-hoc signs, verifies signature and runs the
framed-message self-check before packaging. Local execution is blocked; successful
compilation does not pass native behavior.

First-navigation fixture race: browser-created tabs can navigate before automation
attaches. Tests now block external DNS and explicitly navigate attached targets to
fixtures. No DNS changes are applied to real profiles. Chrome's minimize callback
can precede the animation; tests wait for observed window state.

## Real account checks (owner only)

Use the dedicated official Chrome profile, never Chrome for Testing. Follow README
to load the extension. For each service sign in through official UI, inspect inbox
or chat loading, quit the dedicated browser, reopen and inspect session persistence.
For WhatsApp complete the actual post-QR request; a disappearing QR is insufficient.
For Gmail include company SSO/MFA and popups. Share only stage/error wording.

Then use a synthetic attachment and unsent draft. The owner must trigger/authorize
a controlled incoming event for notification checks; do not send messages or email
to contacts. Check nonselected service, minimized window and another foreground
app, then the destination opened by the notification. Check network recovery and
a real sleep/wake without sending the drafts. Keep account screenshots private.

## Required follow-up for failures

- Native signing: device-accepted signing or IT authorization; configure credentials
  through official tooling, never chat. CI ad-hoc artifacts do not solve policy.
- Close loses tabs: use explicit Hide for the prototype. Meeting close-to-hide needs
  supported browser-host integration or a native architecture with available passkey
  capability. The original requirement remains failed, not waived.

## Additional 0.1.1 native and layout evidence

- PASS AUTOMATICO, 2026-11-06, macos-26 arm64 and macos-15-intel: launch actual
  packaged app, observe its setup window on screen using basic WindowServer
  metadata, verify 0600 IPC socket, verify host manifest scope/path, deliver framed
  hello through the separate native host and observe the real app's marker write.
  See native-ci.json and workflow 42255453874. No Screen Recording/Accessibility
  permission, account content or screenshots are needed for this observation.
- PASS AUTOMATICO: preserve a live tab/draft while adopting it; initialize its
  explicit title count immediately, without waiting for another title event.
- PASS AUTOMATICO: WhatsApp absolute-root fixture does not overlap the 68px rail.
  Public unauthenticated WhatsApp was also checked: x=68 and right=1280 at width
  1280 after the CSS fix. No QR image was retained. Authenticated layout remains
  NON ESEGUITO pending owner feedback.
- PASS AUTOMATICO: sidebar button is identified/clicked through the browser
  accessibility tree while the rail's shadow root remains closed.
- Target native opening remains BLOCCATO; compile/sign/ZIP only succeeded with
  FOURDOCK_BUILD_ONLY=1. Do not substitute this result for execution or login.

## Owner verification, 2026-11-07 — complete login and restart

The owner explicitly reported access completed for all four services, then
confirmed the requested complete exit/reopen of only the dedicated Chrome
instance returned all four services authenticated. These reports pass the real
account-login/persistence checks for this extension workspace. They do not pass
WhatsApp's original QR/passkey method, the blocked native launcher, draft retention,
notification delivery, attachment behavior, physical sleep/wake or full lifecycle.
No credentials, inbox/chat content or screenshots were collected.

Requested next: an unsent draft survives Cmd+1–4; a genuine incoming message/email
notifies with the service unselected and workspace minimized, and clicking opens
the correct destination. The initial self-message suggestion was corrected:
self-sent events alone are not reliable negative evidence for incoming-message
notifications. Do not mark failure without a valid incoming event and enabled
notification settings. The owner performs any sending; the agent sends nothing.
Official setting references:
- https://faq.whatsapp.com/655426345948308/
- https://support.google.com/mail/answer/1075549

## Separate Swift/WKWebView probe, 2026-11-08

These results do not change the Chrome test matrix above. The owner deferred the
real draft/notification checks; a tentative report is not a confirmed test pass.

| ID | Procedure | State | Evidence |
|---|---|---|---|
| W00 | Owner opens the packaged WebKit app normally on the target | FAIL | 2026-11-09 16:31 CET: owner reports missing-executable alert. amfid records -423 for this executable; process exit status 9. MacOS directory is empty; original ZIP contains correctly named executable. File-removal component unknown. See webkit-target-launch.json |
| W01 | Compile/package native WebKit probe, verify signature | PASS AUTOMATICO | Installed Command Line Tools, arm64 macOS 14 target; no execution. Fixture Swift source also type-checks |
| W02 | Synthetic WKWebView isolation, 50 switches/drafts, close/reopen, popup/opener/close, persistent storage/cookies after process restart | PASS AUTOMATICO | macos-26 arm64, workflow 42532731659, source c486831. Both write/read processes passed; synthetic evidence in webkit-probe-ci.json. Not a real-login test |
| W03 | WhatsApp phone-number linking → chats → full app restart persists | BLOCCATO | Owner's normal launch now failed with AMFI -423 (W00). No pairing attempted |
| W04 | Work Gmail actual login/SSO/MFA/popup → inbox → restart persists | BLOCCATO | Owner's normal launch now failed with AMFI -423 (W00). No Google auth flow attempted in WKWebView |

No WKWebView account contents were inspected. Real app code contains no injected
scripts, account-cookie inspection or credential override. A separate CI executable
uses loopback synthetic pages, random store IDs, fixture-only script assertions and
synthetic HttpOnly cookies. No UI screenshot or WebKit system navigation log is
published. This probe does not implement notifications or full attachment handling.

WebKit run: https://github.com/dorianganessa/fourdock-macos/actions/runs/42532731659.
The downloaded production ZIP passed checksum verification and allowlist inspection;
the extracted app passed codesign --verify --deep --strict without target execution.

2026-11-09 correction: this new probe has never been launched on the target.
Its execution outcome is NON ESEGUITO, not an observed rejection. W03/W04 remain
on an operational hold based on the earlier app's AMFI incident. Fresh read-only
checks pass codesign verification and return rejected from spctl assessment;
that alone establishes neither a specific company policy nor the outcome of an
actual launch. No execution/security changes were attempted in this review.

Subsequent owner launch, 16:31 CET: W00 now FAIL with direct AMFI evidence. This
supersedes NON ESEGUITO for target opening, while real login tests remain blocked.
Only a sanitized event summary is published; raw system logs remain uncommitted.
