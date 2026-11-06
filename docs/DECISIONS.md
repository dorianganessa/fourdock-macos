# Decisions and authentication evidence

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
