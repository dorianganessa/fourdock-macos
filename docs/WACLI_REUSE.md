# Reuse existing WhatsApp clients and browser-assisted authentication

Reviewed 2026-11-10. This is a source-backed feasibility study, not a new deployed
client or an authentication pass. Owner explicitly reopened the previously
deferred wacli idea, then clarified: reuse the authentication method and existing
software instead of writing a chat client from scratch. The working Chrome
Fourdock remains available. No homeserver, account or session changes were made.

## Finding

We can reuse an existing client engine and UI, then integrate browser-assisted
pairing. It is not necessary to reimplement the WhatsApp protocol or chat UI.
This does not turn a wacli session into an official WhatsApp Web browser session,
nor demonstrate a ready-made passkey plugin for the current Fourdock web tabs.

| Layer | Reusable component | Remaining integration |
|---|---|---|
| Protocol, synchronization, sending | wacli, built on whatsmeow | Pin a version and verify the pairing/store/CLI contracts |
| Chats, composer, media and live events | wacli Mission Control (`greenido/wacli-ui`) | Connect the supported wacli instance and add the pairing entry point |
| Real owner passkey ceremony | Existing owner browser helper; alternatively WA Passkey Connector | Relay fresh challenge/assertion to the same client performing pairing |
| macOS app presentation | An installed PWA is a candidate | Add installability and Dock badging; test ordinary install, permission and actual OS behavior |

## Existing UI: wacli Mission Control

Reviewed version 0.2.6, commit `4d4ffaf0dbd9cd530f6d298e6da18c110e86e5a6`
(2026-11-01), MIT license. This is an active Node/React UI with conversations,
composer, attachments, search, incoming events, read-state handling and browser
notifications. It expects wacli to have been paired already, so it can reuse a
client authenticated by a separate helper. It does not supply our passkey flow.
[Repository](https://github.com/greenido/wacli-ui),
[version/license](https://github.com/greenido/wacli-ui/blob/4d4ffaf0dbd9cd530f6d298e6da18c110e86e5a6/package.json).

Source-level integration findings:

- `commands.ts` supports a configured WACLI_BIN/store/account and wraps the CLI
  JSON response contract. A matching session store is necessary, but alone does
  not prove compatibility with a different wacli version/build.
- `process-manager.ts` owns a continuous sync daemon and authenticated local
  webhooks; it can start sync automatically. Do not launch it against the current
  homeserver monitor's store or assume its read-only UI prevents all sync writes.
- `capabilities.ts` gates some features on wacli 0.22+. The previously reviewed
  owner pairing helper used a patched 0.20 client. Contract/version differences
  need checking; do not silently upgrade the production monitor.
- The API intentionally binds to 127.0.0.1 and enforces host/origin checks. It is
  not an authenticated remotely exposed service. A private SSH loopback tunnel
  is a possible deployment design to evaluate, not a tested deployment here.
- `notifications.ts` already builds sender/preview notifications and click
  routing. `useUnreadBadge.ts` currently updates the page title only: despite
  the filename, it does not call navigator.setAppBadge for the Dock. No install
  manifest/service-worker files were present in the reviewed repository tree.

[CLI adapter](https://github.com/greenido/wacli-ui/blob/4d4ffaf0dbd9cd530f6d298e6da18c110e86e5a6/apps/api/src/wacli/commands.ts),
[daemon](https://github.com/greenido/wacli-ui/blob/4d4ffaf0dbd9cd530f6d298e6da18c110e86e5a6/apps/api/src/wacli/process-manager.ts),
[notification code](https://github.com/greenido/wacli-ui/blob/4d4ffaf0dbd9cd530f6d298e6da18c110e86e5a6/apps/web/src/lib/notifications.ts),
[unread-title code](https://github.com/greenido/wacli-ui/blob/4d4ffaf0dbd9cd530f6d298e6da18c110e86e5a6/apps/web/src/hooks/useUnreadBadge.ts).

## Reuse only the authentication step

The existing owner helper already delegates a standard WebAuthn assertion to a
real browser on web.whatsapp.com. The client doing pairing remains responsible
for submitting that response, confirming the handoff and saving its own session.
Do not copy another running client's store or export the browser's cookies.

WA Passkey Connector is a public implementation of the same architecture, with
an Unlicense license and a documented challenge/assertion protocol. It offers an
alternative reusable browser component; it is not a turnkey WhatsApp UI/backend.
Its documentation explicitly requires the caller to implement the pairing-side
worker and backend. No security audit or target-account success is claimed here.
[Connector](https://github.com/takeflow-oficial/wa-passkey-connector),
[integration guide](https://github.com/takeflow-oficial/wa-passkey-connector/blob/main/docs/WHATSMEOW-IMPLEMENTATION.md).

Upstream wacli's current auth documentation still states that passkey-gated
pairing is unsupported. Consequently, Mission Control plus an ordinary unmodified
upstream install does not itself solve this account's passkey requirement. Our
helper integration remains necessary. Current upstream release v0.26.0 publishes
a manifest declaring Developer ID signing/notarization for macOS; that is publisher
metadata, not an independently inspected signature or an execution test. Patching
its native binary would require signing our modified build separately.
[Upstream auth](https://github.com/openclaw/wacli/blob/main/docs/auth.md),
[release](https://github.com/openclaw/wacli/releases/tag/v0.26.0).

Keeping the exact official WhatsApp Web UI inside an embedded engine is a
different integration: its own WebAuthn request would need to be delegated and
completed in that same web session. This review did not establish a ready-made
adapter for that path. The wacli/whatsmeow pairing method cannot simply be pasted
into an unrelated container as a login token.

## macOS identity without our own Swift binary: PWA candidate

Google documents native notification attribution for installed macOS PWAs from
Chrome 152: the app can have its own notification name/icon and settings. Dock
badging requires OS notification permission and the Badge app icon setting;
setAppBadge may resolve even when macOS suppresses the badge. This is distinct
from an extension notification, which remains attributed to Chrome.
[Current Chrome documentation](https://developer.chrome.com/blog/notification-attribution-macos).

An installable Mission Control adaptation could therefore be a smaller experiment
than a new Swift shell. Chrome would still be its rendering engine, not merely
an authentication-only dependency. Ordinary installation/launch on this managed
Mac remains untested; do not disable OS controls or claim this avoids MDM policy.

The existing UI uses foreground WebSocket notifications. A minimized live window
can receive events; closing its renderer does not guarantee background delivery.
Always-on notifications after window closure require a separate supported
background mechanism. This is WhatsApp-only; it does not embed the other three
providers or deliver a four-service workspace by itself. Global desktop hotkeys
also need integration beyond the existing UI's in-page keyboard shortcuts.

## Recommended scope and next checks

Start by evaluating the existing UI and CLI contracts in isolation, not building
a new WhatsApp client. Reuse the owner's browser-pairing architecture rather than
adding an unreviewed replacement merely because another connector exists.

1. Build/test a pinned public UI checkout with fake CLI/events and temporary
   state. Keep production sessions and real message contents out of it.
2. Check its command/event/schema requirements against a separate candidate
   wacli build; verify the browser helper's pairing completion contract separately.
3. If app identity is the chosen delivery, add a small PWA identity/badge probe
   before investing in a full shell, then test normal OS install/permissions.
4. Only after a concrete candidate is ready, owner-controlled pairing uses an
   isolated client/store. No send, monitor-policy change, production deployment,
   second sync against the same credentials or session migration follows from
   this exploration request alone.

No candidate dependencies were installed, no candidate process was started,
no client was paired and no new app was installed during this source review.
