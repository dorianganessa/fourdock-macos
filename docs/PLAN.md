# Plan and handoff

Updated: 2026-11-06. Status: tested browser-backed prototype; NOT ready for daily use.

## Environment

Target Mac: macOS 27.0.1 (26A434), arm64. Node 26.4.0 / npm 11.17.0.
Swift 6.4; Xcode 27.2 available using DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer.
Ferdium and Google Chrome 157.0.8103.39 installed; existing profiles are out of scope.
GitHub authenticated as personal account dorianganessa; suggested repository absent.

## Phases and exit criteria

- [x] 0: Inspect environment and identity; establish scoped repository and plan.
- [ ] 1: Browser capability inspection complete; isolated authentication probe ready;
  confirm actual WhatsApp QR + passkey and work Gmail, or record precise blocker
  plus concrete full-browser alternative. Real logins require user participation.
- [ ] 2: Four persistent tabs, sidebar, shortcuts, preferences, diagnostics and
  browser attachment behavior implemented. Native component compiles but local
  execution is blocked by company policy; close-to-hide is not implemented.
- [ ] 3: Four logic tests and eleven browser fixture assertions pass. Matrix updated;
  account logins, OS notifications and real attachments remain unverified.
- [ ] 4: Three fixture startups, 50 switches and 300.31 seconds idle collected.
  Distinguish synthetic,
  unauthenticated and authenticated measurements. No unmeasured performance claims.
- [ ] 5: Clean privacy audit, MIT repository, macOS CI/artifacts and delivery.

## Current evidence / blockers

macOS passkeys for arbitrary relying parties require an Apple browser entitlement,
or a website association that we cannot configure on WhatsApp/Google domains.
Installed Chrome has the browser entitlement (codesign inspection); Ferdium is
Developer ID signed and notarized but lacks that entitlement. Chrome for Testing
is ad-hoc signed with no browser entitlement and is used only for synthetic tests.
The exact cause of the WhatsApp incident is not yet established: user was asked
whether the prompt is on Mac/phone and its wording. No real login is passed.

Current implementation uses official Chrome plus a dedicated profile and extension.
One normal browser window is needed for four tabs; toolbar/tab strip and Chrome's
identity remain visible. This is a prototype compromise. Hide minimizes without
unloading; closing Chrome's window closes tabs and may lose unsaved drafts.

Native Swift compilation succeeded, then first execution was rejected (AMFI -423:
ad-hoc/unknown certificate chain) and the executable was subsequently absent.
The user confirmed company management. Zero signing identities are available.
Do not bypass policy or retry execution to evade it; approved signing/IT permission
is required. Native Dock/menu/external-browser bridge checks are blocked locally.

Browser fixtures now pass: 50 switches preserve four document identities/drafts,
sidebar and Cmd+3, minimize/show, preferences/zoom, offline/online, synthetic file
selection/download, popup/opener/close, external-tab fallback, isolated reload and
full browser restart storage. Evidence: docs/evidence/ui-results.json.

## Next three actions

1. Verify the running macOS CI and download/inspect native artifacts from the personal
   public MIT repository: https://github.com/dorianganessa/fourdock-macos.
2. Get the actual signed-Chrome QR/passkey and work Gmail result. The user's
   clarification: embedded Ferdium immediately reports inability to confirm the
   passkey; no prompt arrives on the phone. Official Chrome probe is now open in
   a separate profile, with no extension required for this first runtime gate.
3. If authentication succeeds, check the extension in that same profile, then
   controlled notifications/attachments. Native app acceptance separately requires
   a device-approved signature or IT authorization; close-to-hide remains a gap.

## Delivered local evidence

Logic checks: four passed. Browser fixtures: eleven passed (see TESTING.md).
Container benchmark: median selection request 12.54 ms; p95 16.34 ms; five-minute
mean CPU 1.40% of one core; mean RSS 754.71 MiB, final 520.67 MiB. This includes the
testing browser/children and automation, not authenticated apps or the blocked
native launcher. No Ferdium comparison or lightweight claim. See PERFORMANCE.md.

Privacy audit before initial publication passed for 34 tracked files and full
local history. Public key in extension manifest is intentionally public; no private
key/browser profile/account content is tracked. Personal GitHub noreply author used.

## Latest authentication and CI checkpoint

Real WhatsApp test FAILED: signed Chrome probe hangs at QR linking, then phone
reports inability to link before passkey. Capacity is available; existing regular
browser session is operational and untouched. One official phone-number linking
test has been requested to isolate QR handling. See AUTHENTICATION.md.

Personal public MIT repository: https://github.com/dorianganessa/fourdock-macos.
Initial source: f3f010e0202349d98cd15b20bb3a7484493ded31.
Initial workflow: https://github.com/dorianganessa/fourdock-macos/actions/runs/42244346285.
Arm64 CI passed all checks, native build/protocol self-test and UI fixtures; ZIP
downloaded and signature verified without execution on the managed target.
Intel compilation/protocol passed, but an immediate post-keypress UI assertion
failed. Added a bounded wait for observed asynchronous selection; next CI must pass.

Initial arm64 ZIP: 59,050 bytes, 192,331 bytes uncompressed, Chrome excluded.
SHA-256: 85572cf3b5ed7443cdc6e4bc895887c89a35e5adf35bf4ea77237d6a665fa764.
Artifact contains only executable, extension code, plist, signature and notices.
