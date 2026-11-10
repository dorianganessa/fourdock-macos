# Fourdock for macOS

A small, local workspace for WhatsApp, Telegram, Fastmail and work Gmail.
An independent **WhatsApp client candidate** now reuses the MIT Mission Control
UI and adds the browser-assisted pairing method. Start with synthetic data:
`npm run mission:setup`, `npm run mission:build`, `npm run mission:demo`, then
http://127.0.0.1:4702. See [candidate instructions](clients/mission-control/FOURDOCK.md).
This does not replace the four-service Chrome workspace or use existing sessions.
**Current direction (2026-11-10): return to the working Chrome workspace.**
Version 0.2.0 adds global service shortcuts and a notification relay that retains
sender/preview while adding Fourdock and the service name. macOS attribution
remains Chrome; service-worker push notifications are outside the page relay.
See [setup and limits](docs/CHROME_NOTIFICATIONS.md). Existing browser sessions
are reused; no new native app or authentication method is needed for these features.
An independent [Swift + WKWebView compatibility probe](docs/WEBKIT_PROBE.md) was
prepared during the earlier architecture investigation. It has not passed real
logins on the target Mac; current work uses the Chrome workspace described above.
**Prototype — not yet ready for daily use.** On 2026-11-07 the owner confirmed
all four account logins and session persistence after a full dedicated-browser
restart. Notifications, attachments, recovery and native target approval remain
acceptance gates.
The first owner test in full Chrome failed at QR linking, before the passkey.
The owner subsequently reported success with official **Link with phone number**.
On 2026-11-07 the owner confirmed that the extension workspace recovers WhatsApp
already linked and opens the other three services. Login and restart persistence
were then confirmed for all four. The original WhatsApp QR/passkey flow remains
unverified. See
[investigation](docs/AUTHENTICATION.md).

Fourdock uses **official Google Chrome**, a dedicated browser profile, an extension
and a small Swift launcher. Sites run as top-level browser tabs. Chrome keeps its
original signature, passkey entitlement, security protections and update mechanism.
No backend, Fourdock account, cookie import or private service API is involved.

## Requirements

- macOS 13.5 or newer, subject to the installed Chrome version's requirements.
  Initial development target: Apple Silicon, macOS 27.0.1. Older macOS versions
  have not been tested. CI also builds Intel binaries.
- Official Google Chrome installed at `/Applications/Google Chrome.app`.
- Building: Xcode command line tools and a macOS SDK; Node.js 22+ for checks/tests.
- Developer ID signing/notarization is **not** included. Managed Macs may reject
  ad-hoc builds. On the development Mac, AMFI rejected the first native build;
  see [the current plan](docs/PLAN.md). Do not disable system protections.

## Install and authenticate

For the current Chrome-only 0.2.0 workspace, follow
[the extension setup](docs/CHROME_NOTIFICATIONS.md). Use the existing dedicated
profile and working sessions; the native packages below are optional and are not
needed for the global shortcuts or notification relay on this managed Mac.

Prototype ZIPs are available on the
[prerelease page](https://github.com/dorianganessa/fourdock-macos/releases/tag/v0.1.1-prototype).
Download a `Fourdock-macOS-arm64.zip` or `Fourdock-macOS-x86_64.zip` from there or the
[macOS workflow artifacts](https://github.com/dorianganessa/fourdock-macos/actions/workflows/macos.yml).
Extract it, move `Fourdock.app` to `~/Applications`, and open it. These are ad-hoc
signed test builds, not Developer ID signed or notarized releases. macOS may offer
a per-app Open Anyway action in Privacy & Security; follow your device's policy.
If the device refuses the app, use the extension-only procedure below.
The managed development Mac requires a device-approved signature/IT authorization;
the current native bundle is not approved there. Prepared signing steps are in
[SIGNING.md](docs/SIGNING.md).

The one-time setup screen opens Chrome with a **new Fourdock profile** and shows
an extension folder in Finder. In `chrome://extensions`, enable Developer mode,
choose **Load unpacked**, and select that folder. Its usual location is:

```text
~/Library/Application Support/Fourdock/extension
```

Preferences open after installation; click **Open workspace**. Use the official pages to sign in. Never enter
passwords, passkeys, QR codes or MFA codes in an issue or chat. Start with WhatsApp:
scan its QR, complete the passkey actually requested by your account, verify chats,
then restart and confirm the session persists. Next check work Gmail including SSO.
If either fails, stop that flow and report only the error wording and stage.

## Run, build and test

```sh
git clone https://github.com/dorianganessa/fourdock-macos.git
cd fourdock-macos
npm ci
npm run check
npm test
npm run build
npm start
```

`npm run build` compiles Swift, verifies ad-hoc signing, runs a native protocol
self-check and creates the `.app`, ZIP and SHA-256 file under `dist/`. It stops on
errors, including local execution restrictions. Choose another build architecture
with `FOURDOCK_ARCH=x86_64 npm run build` on an Intel host. Xcode users with an
inactive developer directory can prefix with
`DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer`.

On a host that permits compilation but rejects native execution, use
`FOURDOCK_BUILD_ONLY=1 npm run build`. It compiles, verifies the ad-hoc signature
and packages the app without running its executable. Such a build is not an
execution test. Native window/IPC checks run on the approved macOS CI hosts;
the managed target still needs its accepted signing/IT authorization.

Synthetic browser tests use Chrome for Testing **only**, in disposable profiles:

```sh
npx playwright install chromium
npm run test:ui
npm run benchmark
```

Alternatively set `FOURDOCK_TEST_BROWSER` to a compatible Chromium/Chrome for
Testing executable. Do not point it at the regular Google Chrome executable:
branded Chrome ignores command-line extension loading. Tests route service URLs
to local synthetic documents and never access real accounts. UI tests require
a macOS desktop session. `npm run benchmark` measures three fixture startups,
50 switches, then five minutes of idle browser resources; see [method](docs/PERFORMANCE.md).

## Extension-only fallback

For the smallest real authentication check, before installing the extension:

```sh
bash scripts/open-browser.sh --auth-probe
```

This opens WhatsApp and Gmail in official Chrome's dedicated probe profile. Test
QR + the actual passkey and company SSO/MFA yourself. Runtime success is only the
first gate; subsequently verify the installed extension in the same profile.
If the reported QR failure recurs, the official phone-number method has a reported
successful result in this profile. Keep numbers and codes in official UI only.
The extension adopts existing service tabs without reloading them when it creates
the workspace. No export or import of browser authentication data occurs.

If you already loaded an earlier development version, use **Reload** on Fourdock
in chrome://extensions. Save any unsent drafts before refreshing existing service
tabs to apply updated content scripts and CSS. Fourdock does not automatically
reload your service pages during an extension update. Verify login persistence
after refreshing; do not clear browser data or remove the working linked device.

This path works independently of the blocked native launcher and still lets you
test the actual authentication in the full, signed browser:

```sh
bash scripts/open-browser.sh
```

Load the repository's `extension` folder using **Load unpacked**. The four-service
window opens after clicking **Open workspace** in preferences. On subsequent launches, click the Fourdock extension
button. This profile is separate from the app's final profile, so extension-only
testing does not rewrite the managed extension directory or existing browser data.

Without the native bridge: sidebar switching, browser sessions, preferences,
downloads and Chrome notifications work; the Fourdock Dock badge and native menu
are unavailable, and external links fall back to a tab in this dedicated browser.

## Using the workspace

- Sidebar buttons or **Cmd+1–4** select existing service tabs. Tabs are marked
  non-discardable to avoid normal memory-saver eviction. No reload on selection.
- **Control+Shift+1–4** on macOS are declared global service shortcuts. Inspect
  actual assignments under preferences; conflicts can leave a shortcut unassigned.
- Enable notifications in each site's settings, allow Chrome's site prompt, then
  allow Chrome in macOS Notifications. Page notifications gain a Fourdock/service
  label and icon while retaining sender/preview and the site's click callback.
  macOS attribution remains Chrome. Test each service from preferences;
  service-worker push notifications retain their original appearance.
- Badges use explicit numeric counts from tab titles. Some services/locales do not
  expose a reliable count; no badge is then shown. No message scraping or polling.
- File upload, drag/drop, download, copy/paste, page zoom and edit shortcuts use
  the browser's own implementations. Real attachment workflows still need testing.
- The sidebar reload button reloads only that service. Chrome handles network and
  wake recovery; reload manually only when needed to preserve drafts.
- Preferences (gear): sidebar light/dark/system appearance, page zoom, title badges,
  external links and content-free diagnostics. Site themes remain site preferences.
- **Hide with the sidebar down arrow or Fourdock → Hide Workspace.** The services
  remain loaded in the minimized window. **Closing Chrome's window closes tabs and
  may discard drafts.** Close-to-hide interception is not implemented.
- With the native bridge connected, ordinary external anchors open in the default
  browser. Forms, redirects, scripted popups and recognized login links stay in the
  same profile. Unknown enterprise login links may need external routing disabled.
- Quit Fourdock to terminate its owned dedicated browser. Chrome's own Cmd+Q also
  closes that browser; it does not terminate the separate launcher.

## Current limitations and acceptance status

This is a browser-backed prototype. Chrome's toolbar/tab strip and Dock identity
remain visible; Fourdock does not embed or rebrand Chrome. There is one workspace
window plus any login/settings windows. Fourdock and Chrome can both have Dock icons.
All four services share one dedicated browser profile with normal origin isolation;
additional accounts on the same service need a future profile model.

The native build was blocked by this Mac's execution policy. Alternate WhatsApp
authentication and session access in the extension workspace are owner-confirmed.
All four logins and full dedicated-browser restart persistence are owner-confirmed.
Background notification delivery, real attachment workflows, sleep/wake and
prolonged usage remain unverified.
Audio/video calls are out of scope.
Follow [the test matrix](docs/TESTING.md), [decisions](docs/DECISIONS.md), and
[the handoff plan](docs/PLAN.md) for actual evidence and the next actions.

## Privacy and licensing

Real app data lives in `~/Library/Application Support/Fourdock`, outside the source
tree. The native IPC socket lives in the private `~/.fourdock` directory. Browser
tests use temporary profiles; extension-only user testing uses
`~/Library/Application Support/Fourdock-Browser-Probe`. Never publish those folders.
Diagnostics contain identifiers/counts/preferences, not titles, URLs or account
content. The launcher discards browser stdout/stderr. No telemetry is implemented.

Original code is MIT. Chrome is installed independently and retains its own license.
See [third-party notices](docs/THIRD_PARTY_NOTICES.md). Development dependencies are
not bundled. Fourdock is not affiliated with the four service providers.
