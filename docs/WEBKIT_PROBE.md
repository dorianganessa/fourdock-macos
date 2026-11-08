# Swift + WKWebView compatibility probe

2026-11-08. Experimental two-service app, separate from the Chrome workspace.
The owner authorized testing Swift/WebKit before choosing Electron. This is an
authentication probe, not the completed four-service product.

## Scope

Native AppKit window/sidebar; retained WhatsApp and Gmail WKWebViews; Cmd+1/2;
native Edit menu; selected-service reload/back; close-to-hide and Dock reopen;
Cmd+Q exits. Two identifier-based persistent WebKit stores isolate the services.
Login popups use WebKit's supplied configuration, retaining profile and opener.
The native header/popup title shows the current origin, without retaining URL
paths or page titles. Navigation remains in WebKit for this probe; there is no
external-link routing feature yet. Only HTTPS and about:blank are supported in
real mode. Custom-scheme enterprise handoff, downloads, notifications and full
attachment handling remain outside this first compatibility check.

No browser extension, separate Chrome process, user-agent spoofing, injected
account-page scripts, credential interception, TLS exception or cookie migration.
No browser passkey entitlement is claimed. A normal app signature alone would
not grant that capability. Successful phone-number pairing is an alternative
acceptance path, not evidence that the original QR/passkey flow was fixed.

Requires macOS 14+ for public persistent-profile APIs. Real bundle identifier:
`com.fourdock.webkit-probe`. WebKit manages its website storage outside the repo;
the fixed store UUIDs are EA9FBE66-5D63-4E1E-A88E-F4BB575FAE01 (WhatsApp) and
EA9FBE66-5D63-4E1E-A88E-F4BB575FAE02 (Gmail). These are new stores; the existing
Chrome/Ferdium profiles are not read, copied, reset or changed.

## Build and current blocker

```sh
npm run build:webkit
```

Produces `dist/Fourdock-WebKit-Probe.app`, an arm64 ZIP and SHA-256 file. The build
compiles, ad-hoc signs and verifies without executing anything. Local compilation
and signature verification passed with the installed Command Line Tools. No
license/security/global developer-directory setting was changed. A normal Xcode
override encountered an unaccepted license; it was not accepted by the agent.

**Do not launch this ad-hoc build on the managed target.** AMFI rejected the earlier
native build; no signing identities exist. The owner reports no IT authorization
or approved signing route. This probe is not an approved workaround. No further
permission request is pending. See [SIGNING.md](SIGNING.md) and [AGENTS.md](../AGENTS.md).

## Synthetic checks

The dedicated `webkit-probe.yml` CI workflow builds the production app and a
separate fixture executable using the same controller. A loopback server serves
only synthetic documents, with CSP blocking page scripts/external resources.
The fixture executable accepts loopback URLs only and has a CI guard. Random
profile UUIDs and its distinct bundle identifier keep fixtures separate from the
production probe. Tests cover isolated localStorage/HttpOnly cookies, 50 switches
retaining documents and drafts, window close/reopen, popup/opener/close, then a
second full process that checks storage/cookie persistence without reseeding.
Only explicit fixture summaries are published; WebKit system stderr is discarded.
CI artifacts contain the production probe ZIP/checksum and synthetic result JSON.

Current synthetic execution status is recorded in [TESTING.md](TESTING.md). CI
execution establishes neither managed-Mac approval nor real login compatibility.

## Real authentication, only on an approved execution environment

This section is a future procedure, not an instruction to bypass this Mac's block.
The owner enters all numbers/codes/passwords/MFA only in official service UI.

1. WhatsApp: one phone-number linking attempt, since this was the successful method
   in Chrome. Report chats, failure wording or a passkey request; do not assume a
   request will work. Keep existing linked devices and Chrome sessions intact.
2. Gmail: navigate from the official Gmail page through the normal enterprise
   redirects/popups. If Google refuses the embedded browser, record the error;
   do not spoof a browser identity or transfer external-browser cookies.
3. If both succeed, quit the probe using Cmd+Q, reopen it, and verify both sessions.
   An unsent draft should survive service switching and hide/reopen; full quit
   does not promise draft restoration by the app.

Share only outcome/error wording, never account screenshots or authentication
codes. No real messages or mail are sent by the agent. W03/W04 remain BLOCCATO
until this procedure actually runs. The original four-service Chrome results
remain valid for that runtime only; no architecture migration is declared.
