# Testing ledger

Updated: 2026-11-08. Automated baseline: 2026-11-06. Target: managed macOS 27.0.1 arm64. Synthetic UI runtime:
Chrome for Testing 157.0.8103.38, Playwright 1.56.1, Node 26.4.0. Profiles are
temporary. External DNS is blocked only in the synthetic browser; attached page
navigations are fulfilled from fixtures. Automated checks use no real credentials
or messages. Manual checks below are based on owner reports; the agent has not
inspected account content.

Allowed states: PASS AUTOMATICO, PASS MANUALE CONFERMATO, FAIL, BLOCCATO, NON ESEGUITO.
Only the explicitly confirmed manual subtests are passed. Fixture subtests do not
pass real-account requirements.
Sanitized automated results: [evidence/ui-results.json](evidence/ui-results.json).

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
| W01 | Compile/package native WebKit probe, verify signature | PASS AUTOMATICO | Installed Command Line Tools, arm64 macOS 14 target; no execution. Fixture Swift source also type-checks |
| W02 | Synthetic WKWebView isolation, 50 switches/drafts, close/reopen, popup/opener/close, persistent storage/cookies after process restart | NON ESEGUITO | CI workflow prepared; actual CI outcome must be recorded |
| W03 | WhatsApp phone-number linking → chats → full app restart persists | BLOCCATO | Native execution not approved on target; owner has no IT authorization/signing route. No pairing attempted |
| W04 | Work Gmail actual login/SSO/MFA/popup → inbox → restart persists | BLOCCATO | Same execution restriction. No Google auth flow attempted in WKWebView |

No WKWebView account contents were inspected. Real app code contains no injected
scripts, account-cookie inspection or credential override. A separate CI executable
uses loopback synthetic pages, random store IDs, fixture-only script assertions and
synthetic HttpOnly cookies. No UI screenshot or WebKit system navigation log is
published. This probe does not implement notifications or full attachment handling.
