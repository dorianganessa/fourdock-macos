# Fourdock

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
