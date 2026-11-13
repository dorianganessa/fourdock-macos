# Reuse existing WhatsApp clients and browser-assisted authentication

Reviewed 2026-11-10. This is a source-backed feasibility study, not a new deployed
client or an authentication pass. Owner explicitly reopened the previously
deferred wacli idea, then clarified: reuse the authentication method and existing
software instead of writing a chat client from scratch. The working Chrome
Fourdock remains available. No homeserver, account or session changes were made.

## More complete clients, reviewed 2026-11-13

### Matrix, Telegram history and client fit: follow-up research

Scope: compare existing bridges/clients for the owner's WhatsApp, Telegram,
Fastmail and company Gmail needs. This is primary-source research only; no new
service, dependency, application, login or session inspection was performed.
The working Fourdock candidate and Hermes's separate wacli remain untouched.

**Telegram history: yes, with explicit import limits.** The current Go
`mautrix/telegram` bridge supports initial message history when creating a room
and catching up on messages missed while offline. Use a personal-account login,
not a relay bot, for the owner's conversations. QR login and optional Telegram
2FA are documented. The current bridge is in `mautrix/telegram`; the temporary
`telegramgo` repository is archived. Latest stable checked: v0.2610.0, released
2026-10-16. This is not the legacy Python installation path.
[Released roadmap](https://github.com/mautrix/telegram/blob/v0.2610.0/ROADMAP.md),
[authentication](https://docs.mau.fi/bridges/go/telegram/authentication.html),
[release](https://github.com/mautrix/telegram/releases/tag/v0.2610.0).

In the v26.10 example configuration, backfill is OFF by default, with an initial
limit of 50 messages per empty room and catchup limit of 500 missed messages.
These are configuration defaults, not a promise that all lifetime history is
imported. Chat discovery/creation limits are separate from message limits. Large
imports may need Telegram takeout mode and time/storage planning. Settings must
be chosen before creating the live portal rooms.
[Current configuration](https://docs.mau.fi/configs/mautrix-telegram/v26.10.html).

Standard Matrix cannot insert arbitrary older events into an already populated
room in their historical positions. Initial import into empty rooms and forward
catchup are distinct from continuous backward import. The backward queue in the
example is Beeper-specific: its custom bridged-room backend differs from Synapse.
MSC2716 was abandoned and support removed; do not propose enabling it as a fix.
Thus Synapse + Element can retain a useful copy of bridged conversations but
must not be sold as automatic full Telegram archival/backfill at any later date.
[Backfill limitations](https://docs.mau.fi/bridges/general/backfill.html).

Bridged history is also not an immutable backup: Telegram edits and deletions
are forwarded. Secret chats and Telegram calls are unsupported; the released
roadmap also leaves Telegram-to-Matrix polls unimplemented. For an independent
offline snapshot, Telegram Desktop already offers HTML/JSON message/media
export. That export is a separate archive, not a verified Matrix import format.
[Feature coverage](https://github.com/mautrix/telegram/blob/v0.2610.0/ROADMAP.md),
[official export](https://telegram.org/blog/export-and-more).

| Bridge | Fit for this owner | Material limit |
|---|---|---|
| mautrix-whatsapp v0.2610.0 | Existing WhatsApp client backend with text, media, replies, reactions, avatars/names and a documented extra browser-assisted passkey ceremony | New independent linked session; owner authentication remains untested. Not a frontend for or migration of the working wacli session. Initial phone history sync is bounded, not an arbitrary full archive |
| mautrix-telegram v0.2610.0, current Go bridge | Personal chats/groups/channels, names/avatars, media, edits/reactions, initial history and missed-message catchup | Configure import before use; no secret chats/calls and incomplete polls/admin feature parity |
| Postmoogle | Existing email-to-Matrix project, useful for mail delivery into rooms | Its own SMTP/mailbox service, explicitly not a connector to arbitrary email providers; does not replace Fastmail/Gmail |
| Other IMAP/email projects | An IMAP puppeting bridge was announced in the Matrix ecosystem | No verified full Gmail/Fastmail mailbox, company OAuth/SSO, labels/folders and ordinary mail workflow parity in this review. Not selected for deployment |

[WhatsApp roadmap](https://github.com/mautrix/whatsapp/blob/v0.2610.0/ROADMAP.md),
[WhatsApp authentication](https://docs.mau.fi/bridges/go/whatsapp/authentication.html),
[WhatsApp history limits](https://docs.mau.fi/bridges/general/backfill.html),
[Postmoogle](https://github.com/etkecc/postmoogle),
[IMAP bridge announcement](https://matrix.org/blog/2024/05/31/this-week-in-matrix-2024-05-31/).

**Client shortlist.** A Matrix client is interchangeable against the same
homeserver, so comparing UIs need not mean relinking WhatsApp for each client.
Encryption keys/device verification still need normal setup for each client.
Official downloaded Mac applications are different from our rejected ad-hoc
builds; their acceptance on this managed Mac remains an ordinary owner test.
No application was downloaded, installed, re-signed or launched for this review.

| Client | Why consider it | Important boundary |
|---|---|---|
| Element Desktop | First choice for a searchable archive: official Mac download, existing chat/media UI, notification controls and an implemented macOS Dock counter. Official FAQ documents encrypted message search on Desktop | Enable Message search and retain recovery keys. Actual sender/preview, click routing, badge semantics, reopen and target execution are untested. It uses Electron, but WhatsApp login belongs to the bridge, so it does not depend on repairing embedded WhatsApp WebAuthn |
| Element Web inside Ferdium | Reuses the existing host and keeps webmail beside bridged chats | Official FAQ says encrypted-room search is Desktop-only. Ferdium remains the OS notification identity; its currently unresolved Dock setting is not automatically fixed by replacing the page |
| Cinny Web | Existing self-hostable Matrix UI focused on simple chat/Spaces; worth comparing visually with Element | Stable v4.12.8 message search uses the server search endpoint. No equivalent local encrypted-history index established here. Global hotkeys, exact albums and Ferdium badge integration are not verified |
| FluffyChat Web | Existing Flutter messenger with files, voice messages, emoji/stickers, Spaces and notifications; another chat-focused UI to compare on the same account | Search UI has message/image/file tabs, but whole-archive search completeness/performance was not established. Latest v2.11.5 release assets include Web/Linux/Windows/Android, not a Mac package; do not promise a supported ready Mac-native distribution |
| Beeper | Polished product and documented self-hosted bridge integration | Owner already failed standard QR/passkey login. Separate bridge login is untested; hosted account/backend remains part of the setup. Not selected as a working replacement |

[Element official download](https://element.io/en/download),
[Element search and notification FAQ](https://docs.element.io/latest/element-support/quick-start-guide/frequently-asked-questions/),
[current Desktop badge implementation](https://github.com/element-hq/element-web/blob/v1.12.35/apps/desktop/src/badge.ts),
[Cinny](https://github.com/cinnyapp/cinny),
[Cinny stable search](https://github.com/cinnyapp/cinny/blob/v4.12.8/src/app/features/message-search/useMessageSearch.ts),
[FluffyChat](https://github.com/krille-chan/fluffychat),
[FluffyChat search](https://github.com/krille-chan/fluffychat/blob/main/lib/pages/chat_search/chat_search_page.dart),
[FluffyChat release](https://github.com/krille-chan/fluffychat/releases/tag/v2.11.5),
[Beeper self-hosting](https://developers.beeper.com/bridges/self-hosting/).

Two requested UX features remain acceptance gates, not reasons to promise a
complete native WhatsApp equivalent:

- **Actual photo albums:** the released WhatsApp bridge's `convertAlbumMessage`
  creates a text notice describing the album. This does not establish a grouped
  photo grid in Element/Cinny/FluffyChat. A client's media-browser gallery and
  sender-bubble grouping are different from preserving an original album.
- **Global per-service hotkeys:** existing in-app room search/switching is useful,
  but is not evidence for OS-wide direct WhatsApp/Telegram shortcuts. A host or
  external hotkey integration would still need a focused design/test.

[Released album conversion](https://github.com/mautrix/whatsapp/blob/v0.2610.0/pkg/msgconv/wa-media.go).

Recommended candidate architecture: Synapse + PostgreSQL + two independent
mautrix bridges on the homeserver, Element Desktop from the publisher on the Mac;
keep Fastmail/company Gmail in their working official web interfaces/Ferdium.
This is four main server services plus a Mac client, with private access/TLS and
backup provisions also needed. Bridge databases/stores must be separate (they
can use separate databases in the same PostgreSQL instance); never share the
Synapse database or Hermes/wacli session. A Web client instead adds static hosting
and preserves the host's notification limitations.
[Bridge database requirements](https://docs.mau.fi/bridges/general/initial-config.html).

Encrypted rooms protect the Matrix leg; the bridge remains an endpoint able to
process messages. Durable access needs a backup plan for server databases/media
and recoverable client encryption keys. Server-side collection can continue with
the Mac offline, while desktop banners require an active client/background
delivery mechanism; quitting the desktop app is not equivalent to minimizing it.
[End-to-bridge encryption](https://docs.mau.fi/bridges/general/end-to-bridge-encryption.html).

Before replacing the current client, an explicitly authorized isolated pilot
would need to pass: owner WhatsApp passkey completion; declared Telegram import
range/count; encrypted-history search; real avatars/names; a genuine multi-photo
album; owner-controlled text/emoji/file sends; sender/preview/click/Dock behavior;
background/restart/recovery and direct service shortcuts. Telegram alone could
validate the Matrix UI/history first, but would not pass the WhatsApp auth gate.
No such pilot was performed or authorized by this research request.

The owner now wants a daily messenger closer to official WhatsApp, after finding
photo albums and chat avatars absent from Mission Control. The current client
remains working; this follow-up is research, not a migration or login request.
Mission Control is an operator console, so its successful authentication does not
establish consumer-client feature parity. No mature, verified drop-in replacement
for its existing wacli API/session was found in this review.

Owner follow-up: Beeper standard fails during QR/passkey linking on this account.
Its UI quality does not pass the authentication gate; do not recommend it as an
already working replacement. Exact error/root cause remains unreported. A separate
self-hosted mautrix bridge could allow a different, controllable login flow while
using Beeper's UI, but is untested, needs its own linking and is not our wacli
backend/session. No deployment or additional account test follows from this report.

| Candidate | Evidence and practical fit | Integration limit |
|---|---|---|
| Beeper | Existing macOS chat product, actively maintained desktop releases, WhatsApp support. Official docs also support running mautrix-whatsapp bridges on one's own Linux host through bbctl | Separate Beeper product/account, not a frontend for our wacli API. Self-hosting a bridge does not remove Beeper's infrastructure from the architecture. Exact owner passkey success and desktop photo-album parity untested |
| Element Web + mautrix-whatsapp | Established open-source Matrix web client; independently hosted UI is possible. Bridge authentication docs explicitly cover extra passkey verification through browser/devtools or mautrix-manager | Requires Matrix homeserver/bridge infrastructure and its own owner-assisted linked session. Web delivery is a candidate for the current Ferdium/browser host, not target-tested. It changes the backend rather than merely restyling wacli |
| Whats4Linux | Inspected its published UI image and React source: closer WhatsApp layout, cached avatars, emoji picker, media/reply/reaction components. Go/whatsmeow backend, Wails bindings, AGPL-3.0 | Linux-first, only nightly prerelease found; history sync remains TODO in README. Its message list still renders one message item per row; no album renderer found there. Frontend requires a Wails-to-HTTP adapter for browser/Ferdium use; not a direct wacli replacement |

The noteworthy authentication finding is present in actual released bridge code:
mautrix-whatsapp v0.2610.0 contains PairPasskeyRequest/Confirmation handling and
LoginProcessWebAuthn, independently of whether the release-note summary lists it.
This establishes an implemented/documented route, not success on this owner's
account. Its browser-origin/passkey ceremony and handoff still need acceptance.

Other candidates reviewed: Rust Meow explicitly calls itself private-testing,
and its current UI is migrating to Tauri; it is not a production-ready substitute.
Quapp advertises a richer Windows UI but this review did not establish a usable
license/release/authentication path. ZapTide has a GTK4/libadwaita Linux interface,
so it is not a browser frontend to drop into Ferdium. None was installed or run.

Assessment: standard Beeper has now failed the owner's linking check. A Beeper
self-hosted bridge remains a separate untested path; Element plus mautrix is
another self-hosted route. Whats4Linux is a source
reuse candidate if WhatsApp-like visual design matters more than release maturity.
Do not promise exact official albums, feature parity, existing-session import or
phone-passkey compatibility merely because a project uses whatsmeow. Any future
prototype should use synthetic data first and keep the working candidate/store.

Primary sources:

- [Beeper product/platforms](https://www.beeper.com/),
  [desktop changelog](https://www.beeper.com/changelog),
  [self-hosting bridges](https://developers.beeper.com/bridges/self-hosting/),
  [on-device/cloud distinction](https://help.beeper.com/en_US/troubleshooting/beeper-on-device-vs-beeper-cloud-what-goes-to-beeper-servers).
- [Element Web support/deployment](https://github.com/element-hq/element-web),
  [mautrix authentication](https://docs.mau.fi/bridges/go/whatsapp/authentication.html),
  [released passkey implementation](https://github.com/mautrix/whatsapp/blob/v0.2610.0/pkg/connector/login.go).
- [Whats4Linux](https://github.com/lugvitc/whats4linux),
  [avatar implementation](https://github.com/lugvitc/whats4linux/blob/b42db9dc86c642784e1f52e7e21803806820bf59/frontend/src/lib/useCachedAvatar.ts),
  [message-list implementation](https://github.com/lugvitc/whats4linux/blob/b42db9dc86c642784e1f52e7e21803806820bf59/frontend/src/components/chat/MessageList.tsx),
  [prereleases](https://github.com/lugvitc/whats4linux/releases).
- [Rust Meow](https://github.com/thinkter/rust-meow),
  [Quapp](https://github.com/govu/quapp), [ZapTide](https://github.com/luminusOS/zaptide).

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
