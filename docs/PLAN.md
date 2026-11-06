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
- [ ] 4: Three startups and 50 switches collected; five-minute idle run underway.
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

1. Complete privacy audit, publish the personal MIT repository and run macOS CI.
2. Finish five-minute fixture measurement and record values/limits; verify CI artifacts.
3. Get the user's exact WhatsApp failure context and actual dedicated-profile login
   result. Native packaged-app acceptance requires a device-approved signature.
