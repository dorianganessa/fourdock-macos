# Fourdock

2026-11-12 OWNER ACCEPTED AUTOMATIC START/RECONNECTION: implementing only the
independent WhatsApp candidate's startup. Mac launch agent dev.fourdock.whatsapp-
tunnel is installed/running using system SSH, private0600 config outside Git and
the existing key (not copied). Only the verified old temporary tunnel was stopped.
Restarted the new job once: new SSH PID and local HTTP authenticated/connected/
sync running confirmed. No normal Chrome/profile/native security changes.
Source adds explicit FOURDOCK_AUTO_SYNC=1 saved-session-only startup with bounded
read-only auth status, no pairing/QR; default0 and sleep controls remain. This
supersedes historical no-auto-sync wording only for this owned opt-in candidate.
CI43191917441 passes at31abb3c: 562 API +491 web tests, three installer cases and
five synthetic browser flows. Initial emulated-offline fixture43191380731 timed
out; the passing recovery test stops/restarts its actual synthetic API instead.
Tested API/web deployed as autostart-31abb3c over preview-646eac5 with base layers,
artifact hashes and own volume verified; existing CLI and monitor untouched.
Candidate restart unless-stopped, FOURDOCK_AUTO_SYNC=1; automatic sync confirmed
after deployment AND one graceful candidate-only restart, without manual sync POST.
Local health authenticated/connected=true, pairing inactive, readOnly=true. Live
worker hash matches artifact. Mac agent remains running. Owner closes/reopens
PWA next; full Mac login/sleep-wake/server reboot and real preview remain untested.
See docs/AUTOSTART.md. No other service, messaging action or native retry authorized.

2026-11-11 NOTIFICATION TEST FIX DEPLOYED: CI43045169931 passes at646eac5:
558 API +491 web tests and four Chromium141 fixtures, OS delivery stubbed.
Tested frontend artifact is live as index-CA7Q0aG7.js, sha256806a7e88e8b5c1a4c421e12c607cd7412a73c68384a8dc8103f6a0d67493c703.
Layered ONLY static files on the existing API/CLI base; verified base layers and
candidate volume, preserved authentication and restored previously running sync.
Post-update local HTTP confirms the new asset, authenticated/connected=true and
sync running. No login or profile/permission reset. Owner has now explicitly
confirmed seeing a test banner. PASS MANUALE for synthetic OS banner delivery;
do not repeat permission/setup/test-button troubleshooting. Real incoming sender/
preview, notification click target and OS sender identity remain unconfirmed.
Next: owner minimizes PWA and observes a genuine incoming unmuted-chat message.
Local Node26 focused runs hit the first-render5s test deadline; clean Node24 CI
passes all cases. The original stalled-SW regression failed old code as intended.
Runtime image is fourdock-whatsapp-candidate:preview-646eac5; preserve the private
frontend-646eac5 compose override when recreating it, or the old source compose
would select the earlier base image. No durable startup service was installed.

2026-11-11 NOTIFICATION TEST REPAIR: owner enabled the IN-APP toggle
but test still gives no visible result. Chrome OS entries were previously OFF;
do not treat enabling them alone as a confirmed banner-delivery pass. Reproduced
the old test hanging before notification creation when serviceWorker.ready never
resolves. New test uses the page Notification constructor (same incoming-message
path), shows permission/opt-in/window metadata and bounded show/error/no-response
feedback, independent badge update/restoration. No OS/profile/feature flags changed.
Linux candidate currently authenticated/connected/sync running, no pairing active.
Deploy ONLY tested web assets atop its existing API/CLI image, retain own volume,
and restore the previously running sync without new pairing. Never touch monitor.
Do not claim the owner's actual worker failure or OS delivery is proven by this
synthetic regression; owner must reload and report the new inline test outcome.

2026-11-11 NOTIFICATION CAUSE FOUND: owner found two visible Google Chrome
entries in macOS Notifications and reports BOTH OFF. These match the previously
observed Chrome and AlertNotificationService registrations. OS notification
disablement explains absent banners despite granted browser permission. Owner
should enable both entries, Desktop and Show previews When Unlocked, then run
one synthetic test and observe sender/banner; no new permission-grant hypothesis,
profile reset, auth retry or feature-flag change is needed. Real incoming banners
also require Fourdock DESKTOP NOTIFICATIONS ON (state still unreported). Test
delivery/sender and genuine preview remain pending; Dock count/update pass stands.

2026-11-11 PINNED CHROME SOURCE: official tag157.0.8103.39 chrome_features.cc
defines kAppShimNotificationAttribution disabled by default. Runtime field trials
can override this; no profile storage/runtime feature state was read or changed.
Thus installed version alone does not prove native PWA attribution is enabled.
Do not turn this source default into a confirmed diagnosis of this profile.

2026-11-11 OWNER PERMISSION CLARIFICATION: owner already pressed the notification
test button and granted permission. Do not repeat that as the missing setup step.
OS metadata still lists only Chrome entries. Owner now recalls the permission
dialog only, no actual banner. Asked the next concrete controls: System Settings
Notifications -> Google Chrome -> Allow notifications and Desktop; and Fourdock
DESKTOP NOTIFICATIONS ON/OFF. Both are still unreported. The deployed sw.js and
manifest return200 with correct MIME/content; this does not prove runtime worker
or OS delivery. Do not guess further causes or change flags/policies/profiles.
Authenticated WhatsApp session remains untouched.

2026-11-11 NOTIFICATION REGISTRATION CHECK: owner cannot find Fourdock WhatsApp
in macOS Notifications. Read-only app metadata confirms the installed PWA and
Chrome157.0.8103.39. Matching notification-preference metadata contains Chrome
and Chrome AlertNotificationService entries but no Fourdock PWA entry; no message
database/browser storage was opened. Do not repeat the nonexistent per-PWA settings
path as established. Owner test-button result is pending: press Prova notifica e
badge from the installed app and observe system permission prompt/banner/sender.
Chrome's primary docs describe a separate OS prompt on first post-install notice,
including migration from prior browser permission; this is a possible next step,
not a confirmed diagnosis. Preserve auth/profile and do not change OS preferences.

2026-11-11 OWNER NOTIFICATION CHECK: incoming updates and Dock unread number
are now explicitly confirmed by owner. Sender/message preview banners remain
missing/unverified. Source shows Desktop Notifications is a separate per-origin
localStorage opt-in, OFF by default; the test banner/OS permission do not enable
it. Settings gear -> DESKTOP NOTIFICATIONS -> ON; allow permission, then test a
genuine incoming event while PWA minimized. Existing notification content already
includes sender and preview (group sender in body); visible current chat, muted
chats, own messages and reactions are intentionally suppressed. If banners appear
but text is hidden, check macOS per-app Show previews. Do not inspect account
content/browser storage or change system preferences automatically.

2026-11-11 LIVE AUTH SUCCEEDED: owner retried and reports it appears successful.
Read-only HTTP status confirms live phase=paired, active=false, storedSession=true,
authenticated=true, connected=true, connectionState=connected and sync=running.
The owner-assisted QR/browser-passkey/confirmation flow has now completed in
the independent Mission Control/wacli candidate. Preserve this session; no reset,
new pairing, credential reads, message inspection or sends are needed. This is
not a pass for the original official-web/native implementations. Next acceptance
checks: PWA close/reopen persistence, genuine incoming notification/Dock badge,
then durable tunnel/startup behavior. Individual PWA OS outcomes remain unconfirmed;
the previous generic "fatto" does not independently pass all of them.

2026-11-11 FIRST LIVE ATTEMPT: owner completed the browser passkey and reported
waiting. Safe endpoint showed assertion_submitted, active=true: response reached
the CLI and was submitted; pairing/authentication was not complete. Owner then
confirmed pressing Annulla and explicitly requested reset/retry, after noting
an overlooked confirmation. Fresh CLI auth status (WACLI_READONLY=1) confirmed
authenticated=false, API pairing inactive/cancelled and sync stopped. Reset only
the owned candidate store by atomic rename within its private volume, preserving
the cancelled unauthenticated attempt; created empty0700 whatsapp directory.
HTTP now confirms active=false, storedSession=false. No agent retry was started.
Next: owner Avvia collegamento, QR/passkey, check BOTH phone and PWA confirmations,
then Carica conversazioni. Do not claim full auth passed or a confirmed client
freeze; no code/network/protocol change was required for this reset.

2026-11-11 LIVE HANDOFF: owner replied "fatto" to the PWA demo instructions.
Installation/test completion reported; individual icon/badge/banner outcomes
are still requested, so do not mark all three passed. After announcing the
transition, stopped only the owned idle demo and started a private SSH loopback
tunnel at 127.0.0.1:4702 to the independent live candidate. Sanitized local HTTP
check confirms mode=live, storedSession=false, authenticated=false, sync stopped.
No live pairing was started. Tunnel is a running process, not a login service.
Next owner action: load clients/mission-control/connector in the SAME Chrome
profile as the PWA, reload PWA, then explicitly start linking/passkey/confirmation.
Never read/log QR/assertions/messages; observe only safe status fields if needed.
Do not restart the demo on the live port or switch origins silently.

2026-11-11 CANDIDATE CHECKPOINT: workflow 42960440631 passes at 83d4a37:
build, compose validation, 558 API + 486 UI tests and four synthetic browser
checks (Chromium 141). The fixture controls initial tab navigation to keep DNS
confinement; origin checks, script execution, trusted keyboard activation and
assertion return exercise the loaded extension. OS delivery and actual passkey
remain untested. Evidence: docs/evidence/mission-control-ui.json.
Owned local demo runs at 127.0.0.1:4702. Owner PWA install/Dock badge/banner question
is pending; do not switch that origin to live unexpectedly. Separate Linux
candidate is built/running from 9739e57, own volume, loopback-only, CLI 0.20.0,
authenticated=false and sync stopped. No private session/store was opened/copied.
Next: owner demo PWA check, private tunnel/helper setup, owner live auth/restart
and incoming-event checks. Current four-service workspace stays separate.

2026-11-11 IMPLEMENTATION AUTHORIZED: owner accepted Mission Control reuse and
said "vai". New candidate is clients/mission-control, MIT upstream 0.2.6 pinned
4d4ffaf, with independent data ownership, browser assertion adapter and PWA/Dock
badge calls. Default startup is synthetic demo only; never silently use an
installed wacli or its existing store. Real backend uses a separate Linux
candidate and explicit patched CLI image, not a new unsigned Mac executable.
Current Fourdock Chrome and private homeserver monitor remain separate. Preserve
the private monitor's dirty working tree. New auth is owner-controlled; no agent
sends real messages or copies sessions. This authorizes the wacli candidate,
superseding historical research-only/official-web-only wording for this branch
of work, without relaxing origin/TLS/OS protections or the native execution hold.

2026-11-10 LATEST OWNER DIRECTION: explicitly reopened wacli research, confirmed
that idea, then asked to reuse only authentication and existing client/UI rather
than rewrite a client. Earlier deferral below is historical. Read WACLI_REUSE.md:
Mission Control (greenido/wacli-ui 0.2.6, MIT) is a candidate reusable UI atop wacli;
the owner helper or public WA Passkey Connector can delegate the assertion.
Unmodified upstream wacli still documents passkey pairing unsupported. No ready
adapter for the current official web tabs is established. Chrome152+ installed
macOS PWAs have native notification attribution; Dock badging needs OS permission.
PWA delivery is a candidate, not target-tested or Chrome-free. Research only:
preserve current Fourdock and dirty private monitor working tree; no deployment,
store/credential copying, new pairing, monitor-policy changes or own-binary retry.

2026-11-10 OWNER CHECK: requested Control+Shift+1 global WhatsApp shortcut works.
Other combinations and actual banners are not yet confirmed. Owner sees no Dock
badge: this is expected missing capability in extension-only mode, whose badge
API updates the Chrome toolbar icon/sidebar. Native NSApp.dockTile badge requires
the unavailable bridge. Do not suggest a Chrome badge toggle as a fix or treat
the synthetic Test WhatsApp banner as an unread event. UI/docs now clarify this.

2026-11-10 OWNER DECISION: retain the wacli/browser-passkey research for later;
do NOT use it now. Continue the existing Chrome Fourdock 0.2.0 and owner setup
checks. A previously built browser helper signs a client challenge on genuine
web.whatsapp.com and returns the assertion to a wacli/whatsmeow client, which owns
its own session. It does not export/import a WhatsApp Web browser session. A
future reuse would require a custom unofficial WhatsApp client/UI or a backend,
not direct session import into the current web tabs. Owner reports prior auth
success; no live check, session access/copy, monitor change or migration made.
See deferred research in docs/DECISIONS.md; do not restart this work unprompted.

2026-11-10 CURRENT OWNER DIRECTION: return to the working Chrome extension,
improve notification identity and direct global service shortcuts. Owner wants
sender AND preview. Extension 0.2.0 relays page Notifications (not WebAuthn) via
chrome.notifications, retains page click callbacks, uses local service icons,
and declares Control+Shift+1–4 global commands. Same extension ID/profile. Chrome
still owns OS sender identity; service-worker push notifications are not relayed.
Read docs/CHROME_NOTIFICATIONS.md. Do not claim all real incoming notifications or
physical global hotkeys tested. Local eleven-test synthetic suite passes; CI
42807740191 at 7ad9702 passes both architectures, sixteen browser fixtures and
native packaging/resource/IPC checks. Actual OS notification delivery was stubbed
in fixtures; owner checks pending. See notification-relay-ci.json. No native
execution/profile reset/auth retry needed on this target.

2026-11-10 screenshot clarification: phone linked-device QR scanner shows
"Usa WhatsApp Web ufficiale per continuare" and asks for the official web client
in a browser. No passkey error/prompt is visible. This identifies a pairing/client
classification warning, not its underlying cause. The installed official Mac
26.45.13 bundle passes signature verification (WhatsApp Inc. Developer ID,
stapled notarization). Phone WhatsApp version/beta status requested, pending.
Do not publish the private screenshot, call the official app counterfeit, or
assume our Electron hybrid patch would fix this warning. See AUTHENTICATION.md.

2026-11-10 clarification: owner reports failure in OFFICIAL WhatsApp for macOS,
not only our Swift probe. Exact error/stage requested, pending. Installed bundle
metadata: 26.45.13/build1108933973; no app/profile/account inspection. Keep its
diagnosis separate from Fourdock AMFI and Electron hybrid limitations. Public
similar reports found; see docs/AUTHENTICATION.md. Chrome's confirmed login used
phone-number linking, not a confirmed passkey success. Do not claim only Web
works universally, an official-app global outage, or a shared root cause.

Latest 2026-11-09 finding: read docs/ELECTRON_PASSKEYS.md before proposing Electron.
The required phone-passkey path is NOT implemented by stock Electron45.2.3:
source audit confirms no hybrid ConfigureDiscoveries override/QR key setup;
pinned Chromium156.0.8078.80 needs that setup. PR55427 + dependency55426 are still
open/unmerged; reported hardware test is Linux+Android+GitHub, not Mac+WhatsApp.
Apple platformPasskeys/AASA support is a separate route. Do not promise a plain
Electron JS prototype will solve the gate. A patched-runtime experiment would
be new scoped work and still needs accepted signing and actual phone testing.

Current owner direction, 2026-11-09: alternatives research must include INTERNAL
DEVELOPMENT (standalone native/Electron architectures, extensible services,
native notification identity and direct global service hotkeys). Owner explicitly
excluded Ferdium; do not request another trial or present it as the next action.
Astra consultation was explicitly requested and completed. See ALTERNATIVES.md
under docs for the source-backed comparison. No runtime migration, account
enrollment/purchase, signing key import, installation or hotkey change is approved
by a research request alone. Regular own-identity signing remains an option to
evaluate; do not infer that IT approval is universally required from the observed
ad-hoc rejection. Preserve the no-bypass rule.

Build a local macOS workspace for WhatsApp, Telegram, Fastmail and work Gmail.
WhatsApp QR followed by the user's actual passkey is the primary acceptance gate.
Never describe this as ready before real authentication and background notifications
have been confirmed on the target Mac. No cookie export, origin/TLS bypasses, private
service APIs, credential collection, or messages sent to real contacts.

Read README.md, docs/PLAN.md, docs/DECISIONS.md and docs/TESTING.md before resuming.
Keep source, dependencies, test profiles and real profiles separate. Publish only
synthetic evidence; never commit screenshots of accounts, browser data or logs of URLs.
Update the plan and test matrix after each meaningful phase and before stopping.

Target: macOS, arm64 initially. GitHub owner verified: dorianganessa (personal User).
MIT for our code. Preserve upstream browser signatures and licenses.

Use GitLab API (never web fetch) for GitLab CI. Use existing GSC API for GSC.
No destructive or unrelated changes. Diagnose one hypothesis at a time; after two
failed hypotheses ask the user for context. Verify actual writes after schema edits.
Check Notion MCP connectivity before Notion work. No delegated agents requested.

Commands: npm ci; npm run check; npm test; npm run build; npm start.
On this managed target use FOURDOCK_BUILD_ONLY=1 npm run build to compile/package
without executing the blocked binary. Do not run npm start or native tests here
until an accepted signature/IT authorization is available. Native GUI/IPC checks
run only on CI (scripts/test-native.mjs is guarded accordingly).
Browser fixtures: npx playwright install chromium; npm run test:ui; npm run benchmark.
Set FOURDOCK_TEST_BROWSER to a compatible testing browser if already installed.
Before publication: stage intended files; npm run audit; inspect staged diff and
artifacts. Git uses the verified account's GitHub noreply email.

Current architecture: official Chrome in a separate profile, Manifest V3 extension,
optional Swift launcher/native messaging host. Normal Chrome window needed for
four live tabs. Chrome toolbar/identity remain visible. Close-to-hide is NOT done.
App data: ~/Library/Application Support/Fourdock; IPC: ~/.fourdock (0700/0600).
Standalone probe: scripts/open-browser.sh, separate Fourdock-Browser-Probe profile.

The target Mac is company-managed (user confirmed). AMFI rejected the local ad-hoc
native executable, which then disappeared. No signing identities are available.
Do not retry native execution to bypass the policy or change global security.
Use CI for native build/self-checks; that does not prove acceptance on this Mac.
Extension-only work may continue subject to device extension policy.

Current authentication state (owner reports, 2026-11-07): all four services are
logged in, and all return authenticated after complete exit/reopen of the dedicated
Chrome instance. T01-alt (official phone-number path), T02, T03 and T04 are
PASS MANUALE CONFERMATO within that scope. SSO/MFA/popup details were not reported.
Original WhatsApp QR/passkey acceptance is still open; do not repeat pairing,
logout or profile reset. Do not touch existing regular Chrome/Ferdium profiles.
No credentials or account contents were inspected. Draft preservation and valid
incoming background notifications are now requested from the owner. A self-message
is not sufficient negative evidence for notification failure; use a genuine
incoming event with settings enabled. The agent sends no real messages/mail.

Final code checkpoint: 0.1.1, be47d46; workflow 42255453874 passes both architectures,
including actual packaged AppKit window observation, private native host IPC and
fourteen browser fixtures. WhatsApp absolute root is offset beside the rail;
closed rail is tested through accessibility. Initial badges/selected identity are
seeded when existing tabs are adopted. Release 0.1.1 is the delivery target.
Owner confirmed all four logins and full-restart persistence. Original passkey
participation, real drafts/notifications/attachments, physical sleep/wake and
native target execution remain unverified.
Do not infer a QR/passkey pass from successful official phone-number linking.

2026-11-08: owner authorized a Swift/WKWebView compatibility probe before Electron.
Separate code: native/webkit-probe; build: npm run build:webkit (never executes).
Read docs/WEBKIT_PROBE.md. It uses two new persistent WebKit stores and a distinct
bundle ID, not any existing Chrome/Ferdium data. Native execution remains blocked.
Owner says IT authorization/signing is not available; do not ask again or run the
probe through Swift/interpreter/debugger to circumvent the restriction. CI fixture
execution is separate from target approval and real account authentication.
Owner deferred draft/notification checks for the existing Chrome workspace; their
tentative "credo funzioni" is not an explicit test pass.
WebKit synthetic CI 42532731659 passed on macos-26 arm64, source c486831. It covers
isolated stores/cookies, 50 retained-document/draft switches, hide/reopen, popup/
opener/close and full-process persistence. Artifact checksum/signature inspected.
W03/W04 real logins stay BLOCCATO; do not turn synthetic passes into auth claims.

2026-11-09 evidence correction: the NEW WebKit probe has never been launched on
the target. Its execution rejection is NOT verified. codesign --verify --deep
--strict passes; spctl --assess --type execute returns rejected. An ad-hoc app's
spctl rejection alone does not establish an organization-wide execution ban or
prove what a normal local launch would do. The exact cause of the original AMFI
failure remains unidentified. Earlier "blocked" wording for this new probe meant
an operational execution hold based on the earlier failure, not a new observed
failure. Preserve the no-bypass/no-security-change rule and the existing hold;
do not describe a universal IT/signing requirement as a proven fact.

2026-11-09 16:31 CET: owner attempted the normal open command and reported
"The application cannot be opened because its executable is missing." Fresh
target evidence now CONFIRMS rejection of this WebKit probe: amfid recorded
AppleMobileFileIntegrityError -423 for its executable at 16:31:11.155 (ad-hoc or
unknown certificate chain); LaunchServices recorded process exit status 9. The
MacOS directory is now empty (mtime 16:31:11), while the original ZIP still
contains the correctly named executable. The responsible file-removal component
is not identified. This supersedes the earlier untested status for this build,
but does not establish a universal enterprise policy. No rebuild, restore or
retry is pending; real authentication remains blocked. Sanitized evidence:
docs/evidence/webkit-target-launch.json. Do not publish raw system logs/paths.
