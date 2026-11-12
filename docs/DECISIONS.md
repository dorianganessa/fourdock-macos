# Decisions and authentication evidence

## 2026-11-12 — Enable the candidate's existing send controls

Owner explicitly requested all client sending. Use the existing persisted mode
setting readOnly=false for this candidate only; text/replies, files, reactions
and scheduling share that switch. Verified through mode/health after a graceful
candidate restart. This is permission configuration, with no code change or
production-monitor policy change. The agent sends no real test content; actual
delivery is still owner-controlled and unverified.

## 2026-11-12 — Automate only the existing candidate's saved connection

Owner accepted automatic startup/reconnection. Use a user launch agent with the
system SSH binary and private connection config, preserving strict host checks,
the existing key, Chrome permissions and the authenticated candidate store.
Enable backend sync at boot only by explicit opt-in plus a bounded read-only
authenticated-session check; missing/failed sessions never trigger pairing.
Respect persisted sleep mode and manual container stops. This changes startup
behavior for the owned candidate, without changing the production monitor or
the native executable hold. Recover an offline PWA navigation without chat caching.

Delivered from tested source31abb3c (CI43191917441). Mac connection process
restart and graceful candidate restart both recovered the same authenticated
running session. Read-only mode remains enabled. Full owner PWA/login/sleep-wake
checks and real incoming previews remain open; see AUTOSTART.md.

## 2026-11-11 — Implement the existing Mission Control UI with a pairing adapter

Owner accepted this route and requested implementation. Reuse the upstream MIT
client UI rather than rewrite chat rendering, sending and media handling. The
candidate has its own data directory and explicit synthetic default. Real
pairing uses the existing patched CLI command contract with a fresh store;
QR/challenges/assertions stay transient and bounded. Browser helper enforces
genuine origin, required verification and a trusted click. No live pairing or
sync starts at application launch. Candidate live runtime is separate on Linux,
so no modified native executable is introduced on this managed Mac. PWA delivery
still requires actual normal installation and OS permission testing.

## 2026-11-10 — Reopen wacli research with reuse as the priority

Owner explicitly reopened the idea and confirmed it means the wacli browser
pairing architecture. The subsequent constraint is to reuse existing clients
and only adapt authentication where possible. This supersedes the deferral below
for research; it does not authorize replacing the working Chrome workspace or
changing the production monitor/session. See WACLI_REUSE.md: existing MIT Mission
Control UI, reusable browser assertion components, upstream pairing gap, version
contract checks and an installed-PWA delivery candidate. No client rewrite is
selected or necessary merely to investigate this option.

## 2026-11-10 — Keep browser-assisted wacli pairing research deferred

The owner reports a working homeserver wacli authentication method. Read-only
review of the existing helper source confirms the mechanism: a user gesture on
genuine web.whatsapp.com runs WebAuthn, and a private transport returns the signed
assertion to the client, which saves its own wacli/whatsmeow session. Private keys
remain with the authenticator. This is not extraction of the browser's existing
WhatsApp Web session, and the resulting client store cannot simply be imported
into the current Fourdock service tabs. No live server/session check was performed.

Potential future reuse: the same browser-assisted pairing architecture for a
custom WhatsApp client, either local or accessed through a backend. It would need
its own chat UI and client integration; it changes the original official-web-app
requirement and does not solve macOS executable signing. The current monitor API
is principally read-only and intentionally disables sending; do not change that
policy or start a second client using the same store as part of Fourdock work.

Owner explicitly deferred this option and chose to continue Chrome Fourdock 0.2.0.
Preserve the research, existing sessions and the independent homeserver setup.
No helper code, private configuration, session store or credentials were copied
into this public repository; no migration or new pairing is authorized/pending.

## 2026-11-10 — Return to Chrome, add global shortcuts and labelled previews

Owner chose the previously working Chrome workspace and requested clearer
notifications including sender/preview. Keep the same profile, extension ID and
top-level service tabs. Four global extension commands focus existing services;
no new native hotkey daemon is needed. A MAIN-world page Notification relay adds
Fourdock/service text and local artwork through chrome.notifications, retaining
original page click handlers. It does not touch WebAuthn or export sessions.
Only routing metadata enters browser-session storage, never notification payloads.
macOS sender identity remains Chrome; website service-worker pushes stay outside
this relay. These limits are explicit rather than claiming native app identity.
Per-service opt-out and synthetic test buttons make the change reviewable.
Real background delivery and physical global shortcuts require owner verification.

## 2026-11-08 — Evaluate native WebKit before choosing Electron

The owner prefers a standalone app and authorized a Swift/WKWebView compatibility
probe. Earlier Electron-first advice reflected implementation convenience, not
observed authentication superiority. The successful phone-number method in Chrome
does not establish support in either embedded engine. Do not claim it does.

The minimal app uses AppKit, two retained WKWebViews, separate identifier-based
persistent website stores (macOS 14+), same-configuration login popups, native edit
shortcuts, close-to-hide and Dock reopen. It starts at official WhatsApp/Gmail
pages without a custom user agent, WebAuthn interception, certificate exceptions,
account data import, or scripts in real pages. HTTPS redirects stay in their
originating service context. Unsupported custom schemes are a documented probe
limitation rather than a reason to alter authentication.

The owner cannot obtain IT authorization/signing. Therefore the prototype may be
compiled/inspected here and run with synthetic content on CI, but real target
authentication remains blocked. No interpreter/debugger route, signature reuse or
security change is an authorized solution. Keep the existing Chrome sessions intact.

Official WebKit profile/popup references checked 2026-11-08:
- https://webkit.org/blog/14423/building-profiles-with-new-webkit-api/
- https://developer.apple.com/documentation/webkit/wkwebsitedatastore
- https://developer.apple.com/documentation/webkit/wkuidelegate/webview(_:createwebviewwith:for:windowfeatures:)

## 2026-11-06 — Authenticate before choosing an embedded web engine

The user needs WhatsApp's post-QR passkey confirmation, not just four web pages.
WKWebView is not automatically entitled to use third-party passkeys. The Apple
browser entitlement requires an organization Apple Developer account holder and
Apple approval. Associated domains additionally require cooperation from each
website owner. Neither is an available project capability.

Current Electron docs expose app.configureWebAuthn (added >=45.0.0), but enabling
platformPasskeys does not grant entitlement or third-party domain association.
Touch ID credentials local to an app are not the user's existing synced passkeys.
We must not polyfill credentials or claim that an API's presence proves login works.

Installed Google Chrome's signature includes
com.apple.developer.web-browser.public-key-credential. A full signed browser can
therefore be a concrete route around the wrapper's missing capability while
retaining system authentication and origin/TLS protections. Runtime under review.

Official evidence consulted 2026-11-06:

- https://developer.apple.com/documentation/authenticationservices/supporting-passkeys
- https://developer.apple.com/documentation/authenticationservices/passkey-use-in-web-browsers
- https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.web-browser.public-key-credential
- https://www.electronjs.org/docs/latest/api/app#appconfigurewebauthnoptions-macos
- https://developers.google.com/identity/protocols/oauth2/resources/best-practices
- https://developer.chrome.com/blog/passkeys-on-icloud-keychain
- https://groups.google.com/a/chromium.org/g/chromium-extensions/c/1-g8EFx2BBY

Google requires full browsers for web OAuth. Work account policy can still refuse
any runtime; only a real login inside this profile can validate SSO/MFA.
Chrome 137+ branded builds ignore --load-extension. Chrome for Testing supports it;
do not silently fall back to modifying the user's existing Chrome profile.

## 2026-11-06 — Runtime inspection and supported browser prototype

Installed Ferdium 7.2.3 is signed with Developer ID, has a stapled notarization
ticket and passes spctl assessment. Its declared entitlements do not include the
browser passkey entitlement. Installed Chrome 157.0.8103.39 does include it.
Downloaded Chrome for Testing 157.0.8103.38 is ad-hoc signed and has no such
entitlement: it is useful for synthetic checks, not evidence of iCloud passkeys.

These facts identify capability differences, **not the confirmed root cause of
the user's WhatsApp failure**. The user clarified that after QR the embedded
browser requests passkey confirmation, then displays "impossibile confermare la
passkey" immediately; no phone prompt ever arrives. This points to the browser
side of cross-device authentication, but the identical signed-Chrome flow still
needs verification. Do not claim the iCloud/browser entitlement alone proves
phone/hybrid transport works or necessarily resolves the incident.

`bash scripts/open-browser.sh --auth-probe` opens official Chrome with WhatsApp
and Gmail in the same dedicated probe profile, before extension installation.
This tests the runtime's real account flow without WebAuthn overrides. It does not
pass final Fourdock interaction/lifecycle checks. Extension integration must be
checked afterwards in that same profile.

The provisional runnable route uses the already installed signed Chrome, with a
separate user-data directory and a Manifest V3 extension for switching, preferences
and title-only badges. The optional Swift component handles Dock/menu integration
and ordinary external links through standard native messaging and a per-user Unix
socket. Its host registration is inside the dedicated browser data directory;
Chromium source confirms DIR_USER_NATIVE_MESSAGING is based on DIR_USER_DATA.

Chrome popup/app windows support one tab. Direct API experiments confirmed that
multiple requested URLs are ignored there and additional tabs go to another
window. We therefore use one normal browser window with four top-level tabs.
The native toolbar/tab strip remain visible. This is an explicit prototype
compromise, not a completed standalone browser shell. Services are marked
autoDiscardable=false, and switching selects a tab without navigating/recreating.

The extension sees only the four service origins and tab metadata. Counts are
parsed from explicit numeric title indicators. Login redirects, form submissions,
scripted popups and recognized identity links remain in the dedicated profile.
The default-browser bridge only accepts http/https/mailto/tel. Service adaptations
are small and kept separate from native window/process management.

## 2026-11-06 — Managed Mac signing block

The user confirmed this is a company-managed Mac. The local Swift executable was
killed at first execution and subsequently absent. AMFI logged error -423:
"The file is adhoc signed or signed by an unknown certificate chain". There are
zero available code-signing identities. The precise policy/quarantine agent has
not been established; AMFI rejection is observed, and agent attribution is not.

Do not retry native execution to evade this policy, turn off Gatekeeper/AMFI,
change device management, or reuse another application's identity. A build signed
with an identity accepted by the device and/or IT approval is needed. GitHub CI
can build/test ad-hoc binaries on its own machines; that does not authorize them
on this Mac. Extension-only testing in official Chrome remains a separate route,
subject to the company's extension policy.

References:
- https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging
- https://chromium.googlesource.com/chromium/src/+/HEAD/chrome/common/chrome_paths.cc
- https://docs.github.com/en/actions/reference/runners/github-hosted-runners

## 2026-11-06 — Live-tab initialization and actual service geometry

The official phone-number login was reported successful. Workspace creation now
adopts existing service tabs in the dedicated profile without reloading, copying
cookies or resetting unsent drafts. It initializes title counts from existing tab
metadata and broadcasts each tab's service identity so the selected rail item is
correct even when the content script loaded before the tab became managed.

Public unauthenticated WhatsApp geometry exposed a real layout defect: its #app
is an absolute viewport root, so HTML padding alone left it at x=0 with full 1280px
width under the 68px rail. A small WhatsApp-specific CSS adapter now positions it
at x=68, right edge 1280, verified on the public page without reading account data
or recording QR images. Fixtures reproduce the absolute-root layout and assert no
overlap. Fastmail's public roots already fit; Telegram's full-width overlay is a
separate overlay rather than an application root, so no speculative adapter was
applied there. Authenticated layouts remain owner-verification gates.

The rail uses a closed shadow root to keep other services' badge text out of the
site's ordinary DOM queries. Browser UI tests operate its buttons through Chrome's
accessibility tree instead of opening that DOM solely for test convenience.

FOURDOCK_BUILD_ONLY=1 explicitly omits execution checks while retaining compilation,
signature verification and ZIP creation. This path succeeded on the managed Mac;
it grants no execution trust. Default CI builds still execute the native self-check,
and a separate test observes the real packaged AppKit window through WindowServer
metadata and delivers a framed message through the native host into that process.
No Screen Recording or Accessibility permission is requested for that observation.
