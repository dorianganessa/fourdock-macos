# Fourdock alternatives: internal development and distributed products

Research date: 2026-11-09. The owner requested a thorough investigation and an
independent Astra opinion, then clarified that internal development is central
and excluded Ferdium. Do not request another Ferdium trial. This report records
architectural choices and evidence, not completed account compatibility tests.

Subsequent focused finding, 2026-11-09: [the Electron passkey audit](ELECTRON_PASSKEYS.md)
supersedes the general Electron recommendation below for the mandatory Android
phone-passkey requirement. Stock Electron 45.2.3 lacks hybrid discovery integration;
the relevant upstream PRs remain unmerged. A patched runtime is an R&D alternative,
not a ready stock-Electron solution. Do not repeat generic engine trials before
accounting for this specific missing capability.

## Proposed product

A standalone Fourdock window, recognizable Dock/menu-bar identity, persistent
service sidebar, native notifications, and direct global shortcuts. Each service
has isolated persistent login storage and retained web content. New services are
added through a catalog/URL configuration rather than a binary rebuild.

Example bindings: Control+Option+Command+1 opens WhatsApp; +2 Telegram; +3
Fastmail; +4 Gmail. The action restores/activates the window, selects the existing
service view and focuses it without reloading. Number shortcuts inside an app
are a different feature from these global shortcuts. These mappings are proposed,
not configured or tested on the owner's Mac.

Notifications belong to Fourdock in macOS, with the service identified in their
presentation. A click restores the correct service and, when the site supplies
a usable destination/click handler, the conversation. Four separately named
system notification apps would imply a different multi-app distribution model.
Closing the window keeps service activity; Command-Q stops the app. Always-live
notification requirements rule out unloading these four views to claim low RAM.

## Development options

| Architecture | What we build | Main benefit | Main limit | Assessment |
|---|---|---|---|---|
| Swift/AppKit + WKWebView | Native shell, retained service views, storage, notification bridge, global hotkeys | Direct macOS integration and no bundled Chromium engine | Real sign-in/passkey and page-notification limitations; accepted signing needed | Strong native candidate; existing probe covers part of the shell |
| Native fork based on Paguro | Our branded/bundled derivative with a service catalog and focused Fourdock UX | Reuses notification, session, download and lifecycle work | Same WebKit/auth limits; own signature and maintenance still required | Useful reuse option, not an inherited-trust shortcut |
| Electron + WebContentsView | Our own app window and web UI; independent Chromium content views | Desktop/window/session/notification/hotkey APIs and convenient web UI iteration | Larger runtime, regular Chromium updates; authentication still unproven; accepted signing needed | Strong independent-engine candidate, conditional on real logins |
| Swift + CEF | Native shell around bundled Chromium/framework/helpers | Native app controls with Chromium content | More packaging/helper/signing/update work; no proven auth advantage over Electron | Not the first choice for four services |
| Tauri/Wry | Rust/web shell with system web views | Smaller distributed engine footprint than bundling Chromium | Uses WKWebView on macOS; does not change that engine's auth/notification limits | No decisive benefit over our existing Swift code for this Mac-only goal |
| Our orchestration of Safari web apps/native clients | Named apps plus our Shortcuts mappings, service setup and launch workflow | Can use OS-supported app creation/automation without shipping our custom executable | Separate service windows/identities, no single embedded Fourdock sidebar | Practical fallback if a custom signed executable is unavailable |
| Extend our Chrome extension | Catalog, global commands and better workspace discovery | Existing four logins/restart persistence already confirmed | Chrome UI/Dock/notification identity remain; current multi-tab topology needs a normal window | Useful compatibility fallback; does not satisfy the preferred presentation |

Changing the application framework does not fix our observed ad-hoc executable
rejection. Nor does packaging Chromium make an embedded product equivalent to
official Chrome for authentication. The three gates are separate: normal app
execution, real account login, and genuine incoming notifications/click routing.

## Native Swift and code reuse

Our existing Swift/AppKit probe already compiles and has synthetic macOS CI
coverage for separate stores, 50 document/draft-preserving switches, hide/reopen,
popup/opener behavior and full-process persistence. It has no implemented native
service-notification bridge and has not passed real WhatsApp/Gmail login. The
owner's normal opening failed with AMFI -423; the executable was subsequently
absent. See [probe](WEBKIT_PROBE.md) and [target evidence](evidence/webkit-target-launch.json).

Paguro is relevant as an MIT-licensed implementation reference or fork base. It
already provides a Swift/WebKit workspace and a page-to-native notification
bridge. Its official DMG was inspected read-only: checksum, Developer ID signature,
stapled notarization, Gatekeeper assessment and stapler validation all passed on
this Mac. It was neither installed nor launched. A modified Fourdock derivative
would need its own identity/signature, upstream attribution and maintenance; the
vendor signature cannot be carried over to modified executable code.
[Repository/license](https://github.com/anguria-studio/Paguro),
[release](https://github.com/anguria-studio/Paguro/releases/tag/v1.1.3),
[inspection evidence](evidence/paguro-inspection.json).

WebKit notification integration is real engineering work. A page notification can
be forwarded to UserNotifications, but a service-worker-only event may not reach
a page bridge. A changing unread count is not proof that a new-message alert was
delivered, nor does it identify a conversation. Paguro documents these limitations
and explicitly lacks passkeys, including in its published 1.1.3 source. Reusing
its code does not solve those limitations.
[Published notification design](https://github.com/anguria-studio/Paguro/blob/v1.1.3/docs/features/NOTIFICATIONS.md),
[published capabilities](https://github.com/anguria-studio/Paguro/blob/v1.1.3/Paguro/App/AppCapabilities.swift).

## Electron and CEF

An Electron Fourdock would be our app, with our Dock identity and window, without
an ordinary Chrome window. Chromium would be bundled internally. Use separate
WebContentsViews, not iframe embedding or the discouraged webview tag; the host
can retain each document while switching the displayed view. Keep Node integration
off in remote content and isolate the privileged host from service pages.
[Electron web embeds](https://www.electronjs.org/docs/latest/tutorial/web-embeds),
[remote-content security model](https://www.electronjs.org/docs/latest/tutorial/security/).

Electron documents OS notifications and shortcuts that work without window focus.
This makes the intended product straightforward to express, but displaying a test
alert is not the same as receiving the four providers' events reliably. macOS
notification APIs also depend on code signing. Test foreground/background clicks
and hidden-window delivery in the actual packaged build, not only a development
runner. No memory/startup advantage over Ferdium or Chrome has been demonstrated.
[Notifications](https://www.electronjs.org/docs/latest/tutorial/notifications),
[Notification API](https://www.electronjs.org/docs/latest/api/notification),
[globalShortcut](https://www.electronjs.org/docs/latest/api/global-shortcut).

CEF offers a similar embedded Chromium route with more native integration work.
Its framework, helpers, entitlements, signing order and updates remain our
responsibility. The official distribution guide explicitly requires our own
signing identity. That effort is not justified by a demonstrated login benefit
for this project. Tauri also offers no new engine on macOS: it uses system
WebKit, so a Swift-to-Tauri rewrite would not resolve a WebKit incompatibility.
[CEF signing](https://github.com/chromiumembedded/cef/blob/master/docs/code_signing.md),
[Tauri webview versions](https://v2.tauri.app/reference/webview-versions/).

## Authentication and signing are independent

The successful Chrome phone-number flow does not establish that the same account
will link in either embedded engine. The original QR/passkey requirement remains
open. Google also restricts OAuth in embedded browsing environments; corporate
policy can add requirements. External native-client OAuth does not automatically
transfer a Gmail website session into a wrapper.
[Google OAuth best practices](https://developers.google.com/identity/protocols/oauth2/resources/best-practices).

Electron's platform-passkey API does not grant access to arbitrary providers. Its
documented associated-domain/provisioning requirements matter. Apple's browser
passkey entitlement has separate eligibility/review requirements; an ordinary
Developer ID does not grant it. Do not promise that a signature, framework switch
or new API alone will fix the user's Android cross-device flow.
[Electron WebAuthn configuration](https://www.electronjs.org/docs/latest/api/app#appconfigurewebauthnoptions-macos),
[Apple browser entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.web-browser.public-key-credential).

A regular release route for our own macOS app is our Developer ID signature plus
Apple notarization. Apple's Developer Program lists USD99 annual membership, with
local pricing/taxes potentially different. This is distinct from asking company
IT to sign our app. Whether our identity/build would be accepted on this managed
Mac still requires a real test: the precise enterprise policy has not been
identified. An Apple Development certificate/test profile is another development
identity to evaluate if available, not a notarized distribution substitute or a
proven fix for this device. No Apple account enrollment, purchase, key import or
notarization submission was performed.
[Apple distribution](https://developer.apple.com/developer-id/),
[membership](https://developer.apple.com/programs/).

## Extensibility and the service contract

Keep the service configuration independent of window code. A proposed manifest
contains a stable ID, display name, icon, official start URL, isolated profile ID,
shortcut, notification/keep-alive policy and rules for ordinary external links.
Adding a normal website should require a new entry, not a compiled plugin.
Provider-specific notification/unread adapters are separate optional modules;
their support must be stated per site. Avoid private messaging APIs, account
scraping and authentication overrides. Initial unread support can use explicit
numeric document-title counts without claiming universal badge coverage.

The host owns lifecycle, activation, native notification identity and shortcut
registration. The page owns its official UI/authentication. Only a small validated
event interface bridges the two. A notification click and a global hotkey both
select the same stable service ID. Login popups/redirects retain the originating
store. A failed service must not force reloads of other services or their drafts.

## Hybrid and existing-product alternatives

Safari Add to Dock offers independent named apps and notifications attributed to
each web app. Our contribution could be service setup and four global Apple
Shortcuts that open the corresponding apps. Raycast per-app hotkeys are another
documented option. This deliberately changes the single-window requirement;
we cannot embed another application's windows into our own shell using the same
public WKWebView APIs. A custom HTML dashboard also cannot freely iframe the
official sites when their embedding policies prohibit it.
[Safari web apps](https://support.apple.com/en-us/104996),
[Apple global Shortcuts](https://support.apple.com/en-gb/guide/shortcuts-mac/-apd163eb9f95/mac),
[Raycast](https://manual.raycast.com/applications).

Our Chrome extension can itself register global commands, so hotkeys do not force
a new native executable. That would improve navigation but retain the interface
and identity the owner dislikes. Chrome app/popup windows were already tested
and did not hold this four-tab topology. Do not promise that app mode alone fixes
the original prototype's lifecycle and notification identity.
[Chrome commands](https://developer.chrome.com/docs/extensions/reference/api/commands).

As secondary comparisons, Rambox Basic includes catalog apps/notifications and two
custom URLs; Pro is USD7/month or USD70/year. Wavebox Basic allows two groups of
two apps; the observed Pro listing was EUR8.33 + VAT/month billed annually. Its
shortcuts can have Global scope, but a direct action for each service was not
verified. Unite Pro offers one app free and a USD39.99 one-Mac license; Coherence
starts at USD39.99 and uses an installed Chromium browser. Their generated app
trust/authentication was not tested. None replaces an internal-development plan.
[Rambox](https://rambox.app/pricing/), [Rambox shortcuts](https://support.rambox.app/faqs/shortcuts.html),
[Wavebox](https://wavebox.io/pricing), [Wavebox shortcuts](https://hub.wavebox.io/keyboard-shortcuts/),
[Unite](https://www.bzgapps.com/unite/buyunite), [Coherence](https://www.bzgapps.com/coherence).

Native API clients were considered: Telegram TDLib, Fastmail JMAP/IMAP and Gmail
OAuth APIs are documented, but implementing their UIs/sync changes the scope
substantially. WhatsApp's official business platform is not a replacement for a
personal linked-device inbox. This is not the shortest route to the requested app.
[Telegram](https://core.telegram.org/tdlib/getting-started), [Fastmail](https://www.fastmail.com/dev/),
[Gmail](https://developers.google.com/workspace/gmail/api/guides),
[WhatsApp](https://whatsappbusiness.com/developers/developer-hub/).

## Astra's advice and the next decision

Astra favors Electron/WebContentsView for a custom app's general web integration
and desktop APIs, while explicitly withholding any claim that the four logins or
passkeys will work. It sees native Swift/code reuse as viable if WebKit passes
the real services, and OS/browser orchestration as the fallback when an accepted
custom executable cannot be deployed. It agrees that Tauri/CEF do not eliminate
the independent signing/authentication gates. Ferdium is excluded by owner choice.

Our proposed process is to establish an accepted signing/execution route for a
minimal Fourdock bundle before growing another implementation. Then test real
WhatsApp/corporate Gmail in the existing Swift probe, including valid incoming
notifications; compare a minimal Electron probe only if the WebKit result leaves
a concrete compatibility problem. Select the engine using those results. The
native UI preference alone cannot establish login compatibility, and general
Chromium compatibility alone cannot establish a successful login either.

All four services, full quit/reopen persistence, unsent drafts, hidden-window alerts,
notification click destination and global shortcut focus are acceptance gates.
Measure resources under the same four-service workload after those pass. No new
runtime was implemented or selected during this research; no app/profile/hotkey
was changed and no real messages were sent.
