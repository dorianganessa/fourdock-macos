# Fourdock

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

Current authentication state (owner report, 2026-11-07): official phone-number
linking succeeded, and the extension workspace recovers WhatsApp already linked
and opens Telegram, Fastmail and Gmail. T01-alt is PASS MANUALE CONFERMATO for
alternate login/workspace session access. This does not prove the other logins,
full-restart persistence, notifications, drafts or QR/passkey acceptance.
Original Ferdium passkey confirmation and the separate Chrome QR failure remain
unresolved. Capacity was excluded. Do not repeat pairing or touch the existing
regular Chrome/Ferdium profiles. Do not inspect account contents while the owner
authenticates. Next input requested: Telegram/Fastmail/work Gmail login outcomes,
including SSO/MFA, entered only in official UI.

Final code checkpoint: 0.1.1, be47d46; workflow 42255453874 passes both architectures,
including actual packaged AppKit window observation, private native host IPC and
fourteen browser fixtures. WhatsApp absolute root is offset beside the rail;
closed rail is tested through accessibility. Initial badges/selected identity are
seeded when existing tabs are adopted. Release 0.1.1 is the delivery target.
Owner confirmed extension recovery of the linked WhatsApp session and opening
of all four services. Other account logins, passkey participation and restart
persistence remain unverified.
Do not infer a QR/passkey pass from successful official phone-number linking.
