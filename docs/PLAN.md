# Plan and handoff

Updated: 2026-11-13. **Prototype; daily-use recovery checks in progress.**

## Element photos, GIFs and sidebar, 2026-11-13

Owner requests GIF receive/send/search-and-select. Source confirms nested webhook
media is discarded by the current flat Fourdock normalizer. Private homeserver
PR147 adds API hydration, MIME/name inference, bounded MP4-to-GIF previews and
Matrix edits of known legacy placeholder notices. An opt-in canonical deploy hook
updates only the candidate's CLI for native GifPlayback sends, preserving its
existing named volume/project/auto-sync and the exact existing monitor patch.
Hermes services remain excluded. A private owner-OpenID GIPHY widget provides
search and selection through Element's existing sticker-picker integration.
GIPHY key setup is pending the owner; credentials never enter this repository.

Local unit/race/vet, synthetic picker protocol and isolated GIF CLI Docker tests
pass. PR147/148 are merged; both full5-job CIs pass and deploy43490118558 succeeds.
Target has one CONNECTED login, healthy adapter and same candidate account/volume;
Hermes container identities/start times are preserved. Startup listener/AS failures
caused2 auto-restarts, now stable with no new errors. Real Element acceptance and
legacy notice repair are unconfirmed. Live owner OpenID and private route guards
pass. PR149 fixes the missing GIF key path in legacy configs; its red/green and
late-key-loading regression passes. CI43492750130 passes all5 jobs and final
deploy43494567469 at32a66c3 succeeds. Final adapter is healthy with0 restarts,
one CONNECTED login and no recent error/fatal logs. Candidate image/account/volume
and Hermes are unchanged by the followups. Account-level RoomList.showSections=false is written and verified with
other settings preserved/private backup; visual sidebar check remains open.
Incoming GIF preview limit480px/12fps/30s with MP4 fallback; sends limit16MiB.
No supported official Element toggle found to hide only the known identity shield;
shared-bot warning remains. No vendor binary patch or weaker encryption proposed.

Next owner steps: create a personal GIPHY API key, then run
`bash ~/personal/fourdock-macos/scripts/setup-matrix-giphy.sh` in a real Terminal.
It asks for hidden input on the server and enables Element's existing sticker
picker. Helper syntax and canonical repo/state discovery pass; real catalogue,
actual Element picker, provider sends and legacy photo repair await owner checks.
Do not put credentials in chat or this repository. See
[sanitized evidence](evidence/matrix-media-gif.json).

## Element identity warning, 2026-11-13

Owner reports the sender/device mismatch warning on each message. Upstream FAQ
identifies this as shared bridge-bot encryption under ghost sender identities;
source and target flags match that mechanism. self_sign is already enabled and
is explicitly not a fix for these warnings. MSC4350 and mautrix/go PR605 remain
open; no full fix for the installed Element/server/SDK combination is established.
Readable history does not establish a warning-free native-like experience. No
runtime changes, key resets or new authentication attempts. Do not weaken
cryptographic checks or patch a signed Mac client to hide the warning.

## Existing Fourdock to Element, 2026-11-13

Owner authorized an API adapter so Element can reuse the working server-side
Fourdock connection. Deployment must use the homeserver repo and existing CI.
Private PR146 merged at32aa06b; CI43471352213 at9c707a8 passes all5 jobs, including
synthetic signed-device encrypted receive/send, adapter restart and snapshot
backup. Deploy43472196309 succeeds at32aa06b; live service/API metadata, Mac
HTTPS private-route checks and consistent SQLite snapshots pass. The candidate
remains connected and all three existing WhatsApp containers retain IDs/start
times. Owner now reports login existing completed; backend shows1 CONNECTED
adapter login,15 created rooms and counts rising837 ->1961 ->6635. All15 rooms
contain messages at the third observation. Owner explicitly confirms readable
chat/messages in Element. Import completion and genuine new incoming/outgoing/
notification acceptance remain open.
No account relinking, WA session import, candidate/Hermes source or runtime
changes, or agent real sends. Owner has confirmed Element's readability; no new login, QR or phone step is
requested.

Implemented API mappings: text/emoji, replies, files, reactions, incoming
edits/deletions/receipts and bounded initial/catchup history, with a persisted
outbound claim to refuse automatic resend after uncertain delivery. Status and
newsletter messages do not create live portals. No avatar API or album metadata
is added. Calls, outgoing edits/deletions and read/typing writes remain unsupported.
A real Element incoming message, deliberate send, notifications/badge/click,
large-media behavior and normal user lifecycle remain owner acceptance checks.

## Authorized Matrix backend implementation, 2026-11-13

Current acceptance: QR rendering/scan owner-confirmed, but both QR and phone-code
WhatsApp linking fail. Four sanitized attempts (three QR, one phone-code) show
PairSuccess -> stream516/EOF while the bridge waits for515; no passkey event.
Owner reports WhatsApp2.26.44.75, two linked wacli devices and continued Fourdock
Mission Control access. Cached Web protocol version matches a fresh public-page
fetch. Upstream PR1010 fixes a different premature completion caused by ADV secret
rotation; it is not a verified516 repair and was not deployed. No runtime/config
change, authenticated-provider pass or reason for516 is established. Stop repeated
pairing requests and preserve working sessions. A confirmed upstream repair or
new evidence is needed before another controlled authentication trial.

Owner reached the WhatsApp bot in Element1.12.35, but its QR image failed:
Traefik established a Desktop origin-root media404 while prefixed APIs worked.
Homeserver PR145 is now merged/deployed, adding the narrow root media route with
existing private/authentication controls. CI43453427842 at05c32fd passes all4 jobs
and9 config cases; deployment43453909823 at63e5a08 passes. The live synthetic
image matches through both HTTPS paths; anonymous401, CF-origin403 and unrelated
proxy-container403 checks pass. Only the gateway was recreated, preserving all
bridge/database and original WhatsApp containers. A mutable-tag manifest failure
was reproduced independently and fixed by retaining the same Nginx digest alone.
No owner QR/content retrieved. Next owner action: send login qr once for a fresh
QR, then report the bot's extra passkey instructions if requested.

Owner now confirms access inside Element after the Mac/custom-server login
instructions. This passes target Element login only; recovery-key setup was not
individually reported. Next: owner starts WhatsApp bot pairing and completes the
phone/browser passkey ceremony. Provider authentication remains unverified.

Owner chose implementation on the homeserver and clarified that it must join
its canonical Compose/CI. Private homeserver PR143 contains Synapse/PostgreSQL,
two current mautrix bridges, private HTTPS gateway, bootstrap and CI/backup
integration. No backend code/credentials are shipped in this public client repo.
Owner chose Tailscale-only access and 1,000 initial Telegram messages per chat;
Telegram stays disabled until its API credentials are entered privately.
Delivered through homeserver PR143/144 and the existing CI deploy. Local8 and
existing15 cases pass; CI43423705680 at6ce8a3e passes all4 jobs, including isolated
startup/login/provisioning/restart/backup. Deployment43424119726 at e0842b1 is
successful and all five services are healthy. Owner supplied Telegram API keys
privately, enabling its profile for subsequent CI deploys. Neither provider is
linked yet. The Mac's strict HTTPS and both authenticated bridge APIs pass.
CF-origin and unrelated proxy-container probes are rejected. The initial source
translation403 was verified in Traefik logs and fixed with only the exact Docker
gateway address plus independent public-tunnel rejection, preserving encryption
and read-only roots. The backup helper produces three validated private dumps.
Existing Hermes/wacli/Fourdock container IDs and start times stayed unchanged.
Next: owner opens the official Element client, keeps its recovery key and links
WhatsApp/Telegram through the bots; actual WhatsApp passkey is still the primary
acceptance gate. No real message was sent/read and no history imported.

## Matrix/Telegram history and client fit, researched 2026-11-13

Exact Mac + Element + WhatsApp passkey acceptance remains unproven: targeted
primary-source search found no end-to-end success report identifying that setup.
Upstream merged bridge support and Manager v0.2.1 arm64 DMG/native caBLE adapter
are implementation evidence, not target success. External browser authentication
avoids depending on Element's embedded WebAuthn. Do not install Manager or relink
accounts merely to answer this evidence question; see WACLI_REUSE.md.

See WACLI_REUSE.md for the source-backed bridge/client comparison. Current Go
mautrix-telegram supports initial history and missed-message catchup, but default
backfill is OFF and standard Matrix cannot insert older messages into existing
chronology. Configure import before creating rooms; do not promise full archival
or immunity to synced deletions. Element Desktop is the first candidate for
encrypted-history search and a distinct app/Dock identity; Element Web lacks the
documented Desktop encrypted-search capability. Cinny/FluffyChat Web are UI
alternatives with unresolved archive-search/album/host integration details.
WhatsApp's released passkey support remains untested on the owner's account;
exact native-style albums and global per-service hotkeys are not established.
Keep official Gmail/Fastmail interfaces and Hermes/wacli unchanged. Research only:
no pilot, install, pairing, backend/account access or migration performed.

## More complete UI alternatives, researched 2026-11-13

Owner now reports standard Beeper fails at QR/passkey linking. No confirmed
replacement exists for this account yet. A separate mautrix bridge with Beeper
or Element would need its own isolated authentication check; neither is a proven
reuse of the current wacli session. Preserve working Fourdock; no migration made.

Owner asks for a more polished client. Primary-source comparison is saved in
WACLI_REUSE.md: Beeper for a ready product; Element Web + mautrix for an established
self-hosted route; Whats4Linux as a younger UI reuse candidate. The released
mautrix bridge implements the extra passkey flow, but no target login has been
tested. All require integration/new account-session evaluation rather than a
verified direct swap of Mission Control. No migration, install or live trial made.

## Reported presentation gaps, 2026-11-13

Owner asks about photo albums and chat avatars. Source review confirms individual
MessageRow rendering with no album identifier in the adapter types, and no avatar
field/rendering/profile-photo retrieval in the current chat list. These remain
unimplemented client features. Local grouping of consecutive photos is distinct
from exact WhatsApp album membership; do not promise fidelity without its metadata.
This was an explanation/review only, with no runtime or account changes.

## Client usability and Ferdium

Owner now confirms the embedded client works, the sidebar service badge updates,
and a notification arrived after enabling Fourdock Desktop Notifications inside
Ferdium (it had been OFF). Only the app icon's Dock counter remains unresolved.
Check macOS Ferdium Badge application icon first; the recipe transport already
works. No code/runtime change was deployed during this diagnostic follow-up.

Owner requested direct sending, address-book notification names and emoji; prefers
repairing Ferdium's original WhatsApp Web, with our integration as fallback.
Implemented first-Enter immediate dispatch, optional confirmation preference and
bounded cached contact lookup; focused83 tests and recipe badge fixture pass.
CI43209200704 atfb84e2d passes 562 API +499 web tests, three installer cases,
one recipe case and six browser flows. Tested static web is live, asset hash/base
layers/volume verified, authenticated/connected sync and sending preserved.
Owner reloads with Cmd+R. The original Mac passkey path still has no
verified recipe-only fix; Linux-only Ferdium support and open Electron hybrid
patches are not a target pass. The optional recipe is installed to load the current
authenticated client without rebuilding Ferdium: owner restarts the official app
and adds Fourdock WhatsApp. Existing services unchanged; its native behavior and
actual sender/preview naming are owner checks. See FERDIUM.md.

## Sending enabled by owner

Owner requested enabling all sends from the independent client. Its existing
read-only setting is now false, exposing the supported text/reply/file/reaction
and scheduling controls. A graceful candidate restart confirmed the choice is
persisted and authenticated/connected sync resumes. No real outbound action was
performed by the agent; end-to-end delivery remains an owner check. The production
monitor's policy is unchanged. Owner reports the App Store official app still
fails linking, so that trial does not replace the working candidate.

## Automatic startup and reconnection

Owner accepted this next step. System SSH now runs under a private per-user Mac
launch agent; a controlled job restart recreated its connection with the same
authenticated/running backend. No browser/profile/key was replaced. Backend
saved-session-only startup, restart policy and network-only offline-page recovery
are deployed. CI43191917441 at31abb3c passes 562 API +491 web tests, three
installer safety cases and five synthetic browser flows. Tested API/web retain
the CLI/base layers and own volume. Deployment and one graceful candidate-only
restart both resumed authenticated/connected sync automatically; no manual POST,
new pairing or messaging action. Next: owner closes/reopens the PWA from the Dock,
then observes a genuine incoming preview with the window minimized. Full Mac
login/sleep-wake/server reboot are still manual checks. See AUTOSTART.md.

Owner subsequently reports seeing notifications for now. Visible delivery is
confirmed manually; exact preview/click behavior and full PWA reopen remain
unreported. Continue normal use without repeating notification setup.

## Current implementation: reused Mission Control WhatsApp candidate

Owner accepted the reuse proposal and authorized implementation. The public MIT
source is vendored under clients/mission-control at upstream 4d4ffaf (0.2.6),
retaining its license and documentation. Fourdock adds separate demo/live stores,
single-attempt pairing pipes, browser helper, explicit handoff confirmation,
PWA install metadata/icons and app badge updates. Existing Fourdock remains.

Default startup uses only a bundled synthetic CLI and owned demo data. Build,
558 API and 486 web tests pass locally. Tests use temporary stores, not accounts.
The real patched homeserver CLI command was checked in a --network none container
with no mounted store: auth pair exists and read-only doctor does not create a
session in an empty store. This is not real authentication verification.

Workflow 42960440631 passes at 83d4a37: clean build, compose validation, all 1,044
unit tests and four synthetic Chromium141 browser checks. The reused list/thread,
PWA/SW/notification-badge API calls, pairing pipes and loaded connector's trusted
activation/assertion return pass. Initial tab navigation is controlled by the
fixture because extension-created requests can precede automation attachment;
DNS remains blocked and no real WebAuthn ceremony occurs. Screenshot inspected.
See docs/evidence/mission-control-ui.json. OS notification display is stubbed.

The independent server candidate has been built from the public source and the
existing patched CLI image. Its separate named volume is mounted only there;
the listener is 127.0.0.1:4702. Read-only health verification reports installed
CLI 0.20.0, authenticated=false and process stopped. No pairing or sync was run.
The production monitor, its store and its dirty source tree are untouched.

Next three actions:

Current notification repair: owner enabled the actual in-app toggle but the test
still does nothing. The old SW-ready test can wait forever (reproduced), unlike
the page Notification path used by incoming messages. Replacement uses that path,
shows browser feedback with an eight-second bound and keeps badge restoration
independent. CI43045169931 passes at646eac5: 558 API +491 web tests and four
browser checks. Deployed that exact web artifact on the existing API/CLI base,
verified base layers and the candidate volume, then restored prior running sync.
Post-update HTTP confirms the new asset and authenticated/connected/running state.
Owner has now explicitly confirmed seeing the test banner: physical delivery of
the sample is passed manually. Real incoming sender/preview/click remains open.
Do not reset/re-pair or repeat the already completed permission/test setup.

1. Owner minimizes PWA and observes a genuine incoming unmuted-chat message:
   verify sender/preview banner and click destination. Incoming updates, Dock
   count and the new synthetic test banner are manually confirmed. The app's
   DESKTOP NOTIFICATIONS toggle has been enabled; preserve that setting/session.
2. Owner closes/reopens the PWA and confirms the existing session returns;
   preserve the now authenticated store, without pairing or resetting again.
3. Confirm full Mac login/sleep-wake behavior during normal use; the connection
   and backend restart recovery are now installed/tested as described above.

The tunnel is now a user login service. No production monitor service/session or
regular Chrome profile changed.

First live attempt: owner completed passkey; safe status reached
assertion_submitted while awaiting the next WhatsApp confirmation. Owner
cancelled and requested reset/retry after reporting an overlooked confirmation.
Fresh read-only CLI auth status was false. Only the owned candidate's store was
atomically renamed within its private volume and replaced with an empty0700
directory; no credentials copied/deleted, no monitor change, no automatic retry.
Endpoint confirms inactive/no session. Next owner attempt must complete phone
AND PWA confirmations after passkey. That attempt did not complete linking.

Second owner-controlled attempt SUCCEEDED: safe read-only HTTP status now shows
phase=paired, active=false, storedSession=true, authenticated=true, connected=true,
connectionState=connected and sync=running. The owner reports it appears successful.
This confirms live QR/browser-passkey/confirmation and synchronization startup
for this candidate. PWA restart persistence, real incoming events, OS badge/banner
and durable connection startup remain separate checks. No messages were inspected
or sent by the agent; preserve the successful session.

See clients/mission-control/FOURDOCK.md for exact commands and scope.

## Previous research checkpoint: reuse a wacli client and authentication helper

Owner reopened the deferred idea and explicitly prefers adapting authentication
and reusing existing software over writing a client. Source review identified
wacli Mission Control 0.2.6 (MIT), plus an existing public passkey-assertion
connector implementing the same general architecture as the owner's helper.
See [WACLI_REUSE.md](WACLI_REUSE.md) for pinned sources and concrete boundaries.
The PWA path now has a current primary reference: Chrome152+ macOS installed PWAs
have their own native notification attribution and permission-bound Dock badges.
This does not imply existing Fourdock extension alerts gain PWA identity.

At that research checkpoint, no runtime, account, profile, homeserver service or
candidate dependency was changed. Existing Chrome Fourdock remains the working baseline. Next research
checks: isolated UI/CLI contract build; separate pairing integration; normal PWA
identity/badge feasibility if selected. None is a live auth or OS delivery pass.

## Current direction: improve the working Chrome workspace

Owner reaffirmed this direction after reviewing their existing wacli browser
pairing helper: preserve that research for later, do not use it now. The deferred
architecture and its limits are recorded in DECISIONS.md. Current next actions
remain extension setup and notification/global-shortcut verification below.

Owner explicitly returned to the existing Chrome version and requested direct
service shortcuts and clearer notifications, including sender and preview.
Extension 0.2.0 declares four global commands (macOS Control+Shift+1–4), retains
in-page Cmd+1–4, and relays page Notifications with Fourdock/service identity,
local service artwork, original previews and click callbacks. Per-service opt-out,
actual assignment display and synthetic test buttons are in preferences.
See [CHROME_NOTIFICATIONS.md](CHROME_NOTIFICATIONS.md). This supersedes further
engine/authentication experiments as the current implementation direction.

Chrome still owns the OS notification identity. Service-worker push notifications
are not intercepted. No real-account notification pass is claimed. Existing login
evidence is retained, profiles untouched and native execution hold preserved.
Local syntax and eleven synthetic Node tests pass. Workflow 42807740191 passes
both architectures at 7ad9702, including actual packaged native startup/resource
installation and sixteen Chromium fixture checks. Preview/click transport across
real MAIN/isolated worlds and command registration pass; OS banner delivery was
stubbed in the fixture. The first run exposed the old flat resource installer;
it now copies the new icon directory recursively, without touching browser data.
Owner OS/global-hotkey/incoming-event verification remains pending. No native
execution was attempted on the managed target. See notification-relay-ci.json.

Next three actions:
1. Owner reloads/reloads-unpacked extension 0.2.0 in the existing dedicated
   Chrome profile and tests a synthetic notification and global service shortcut.
2. After saving drafts, owner reloads service pages once and observes a genuine
   incoming event with the service hidden, including preview/click destination.
3. Record per-service page-relay versus service-worker push behavior and address
   only observed gaps. Do not restart engine/authentication experiments.

Owner feedback, 2026-11-10: global Control+Shift+1 works; Dock unread indication
is absent. The current extension only sets toolbar/sidebar badges. Dock badge
code is in the unavailable native bridge, so the requested Dock capability is
an explicit unresolved gap. Banner delivery and the other global assignments
remain unconfirmed. Preferences now distinguish badges from test banners and
state that the extension-only workspace does not add a macOS Dock badge.


## Current diagnostic dependency: official WhatsApp Mac app

The owner clarified that official WhatsApp for macOS also fails. A subsequent
phone screenshot shows "Usa WhatsApp Web ufficiale per continuare" inside the
linked-device scanner, with instructions to use the official web client in a
browser. It is not a visible passkey error and does not establish its internal
cause. Phone WhatsApp version/beta status is requested/pending. This is separate from our
native executable's AMFI rejection and Electron's missing hybrid implementation.
The installed official bundle is 26.45.13/build1108933973. Read-only signature
verification passes, with WhatsApp Inc. Developer ID and stapled notarization.
An original WABetaInfo report identifies this warning UI, but does not establish
the cause for this official Mac app/account. The screenshot is not published.
Public first-hand reports include Mac relinking failure with Web/passkey success
and an Android/Mac case of forced logout after successful sync. Those reports do
not establish a shared cause or current global outage. Google/WhatsApp's primary
passkey case study also documents cross-platform/credential-provider difficulties.
Sources and limits: [AUTHENTICATION.md](AUTHENTICATION.md). No account/profile,
linking, key, network/security or installation changes were made. Preserve the
working browser sessions and wait for the requested phone-version context before
assigning a cause. Do not assume a patched Electron runtime resolves this warning.

## Latest decision: focused Electron passkey audit

The owner requires passkeys and asked whether Electron would actually work.
Read [ELECTRON_PASSKEYS.md](ELECTRON_PASSKEYS.md). Source audit of stable 45.2.3 /
Chromium 156.0.8078.80 confirms that Electron does not configure hybrid/caBLE
discovery; Chromium's required QR generator key is therefore absent on that
path. PR55427 proposes the missing integration and depends on PR55426; both are
open/unmerged as checked 2026-11-09. Reported hardware verification is Linux +
Android + GitHub, not macOS + WhatsApp. The Apple platform-passkey API is a
separate associated-domain route, not an automatic fix for third-party sites.

Do not build a full stock-Electron shell on the earlier generic recommendation.
The viable development question is whether to pursue a patched-runtime feasibility
experiment with legitimate signing and real macOS/Android account checks. No
runtime was installed, executed or patched during research. No new owner pairing
attempt is pending. Existing Chrome results do not pass the original QR/passkey
gate. Signature acceptance remains an independent unresolved dependency.

## Current direction: internal-development alternatives and Astra review

The owner asked for a thorough alternatives study and an explicit Astra opinion,
then clarified that internal development is central and excluded Ferdium. No
further Ferdium trial is a next action. See [ALTERNATIVES.md](ALTERNATIVES.md).

Research covers our Swift/WebKit shell, native code reuse/fork of MIT Paguro,
Electron/WebContentsView, Swift/CEF, Tauri/Wry, our own OS/PWA orchestration and
the existing Chrome extension. The intended product is a recognizable app with
notification identity, service catalog and stable per-service global shortcuts.
No engine has passed real account authentication in our own executable.

Astra favors Electron for the complete custom product, conditioned on actual
login/notification results; native Swift remains a candidate using existing code.
The proposed sequence is accepted execution/signing, real-service compatibility,
then full shell/features. A regular own Developer ID/notarization route is distinct
from company IT signing and remains untested; the observed ad-hoc refusal does not
establish rejection of all personally signed software. No enrollment/purchase or
signing operation was performed. Current code remains unchanged.

For comparison only, official Paguro 1.1.3 DMG checksum, signature, stapled ticket,
Gatekeeper assessment and stapler validation passed here; the image was inspected
read-only and unmounted, without installation/launch. Its lack of passkeys and
notification bridge limits are documented, so a fork would still require our own
signature and real compatibility tests. Evidence: paguro-inspection.json.

## Actual owner launch, 2026-11-09 16:31 CET

The owner subsequently attempted a normal app launch and reported an executable-
missing alert. Fresh read-only investigation now confirms this build's rejection:
amfid logged AppleMobileFileIntegrityError -423 at 16:31:11.155 for the probe's
executable, followed by LaunchServices exit status 9. The executable directory is
now empty and its modification time matches 16:31:11. The original ZIP still
contains the expected executable; its name agrees with CFBundleExecutable.
This is a new observed failure, superseding the untested status in the earlier
review below. Which component removed the file remains unidentified; a universal
company policy has not been established. No rebuild/restore/retry was performed.
Real WhatsApp/Gmail checks remain blocked; next dependency is an execution/signing
route accepted by this Mac. The owner has no IT route, and no repeat approval
question is pending. See docs/evidence/webkit-target-launch.json.

## Execution evidence correction, 2026-11-09

The owner challenged the certainty of the new probe's reported block. The new
WebKit app has never been launched locally, so rejection of this build has NOT
been verified. Read-only checks: codesign --verify --deep --strict passes and
spctl --assess --type execute returns rejected. The latter is a Gatekeeper policy
assessment, not an execution attempt or proof of an enterprise-wide ad-hoc ban.
The first build's AMFI failure is historical evidence for that build only; the
precise cause remains unconfirmed. Earlier BLOCCATO wording below describes our
execution hold, not a newly observed failure. No security settings changed and
no local launch was attempted during this review.

## Current direction — Swift/WebKit compatibility probe

The owner questioned the normal-browser UX and authorized a minimal Swift +
WKWebView probe before committing to Electron. See [WEBKIT_PROBE.md](WEBKIT_PROBE.md).
The two-service app is independently packaged; no change to the existing working
Chrome workspace or profiles. Local compilation, ad-hoc signature verification
and fixture source type-checking passed using the installed Command Line Tools.
Explicit Xcode DEVELOPER_DIR encountered an unaccepted license; no license was
accepted and no global toolchain/security setting changed.

Native execution and real WhatsApp/Gmail tests remain BLOCCATO. The owner said
IT authorization/signing is not available. Do not retry execution or ask the same
approval question again. CI synthetic WebKit checks are the available independent
validation; they cannot establish real authentication, device approval or resource
use. The existing Chrome draft/notification checks were deferred by the owner;
"credo funzioni" is not a confirmed pass.

Retain both runtime options without declaring a migration. Actual WebKit login
testing requires an approved execution environment and owner-only authentication.

Synthetic CI subsequently passed on macos-26 arm64:
https://github.com/dorianganessa/fourdock-macos/actions/runs/42532731659,
source c486831ff2aca33e86a3a43b6b18c9b079bf9d39. W02 passes isolation,
50 switches/drafts, close/reopen, popup/opener/close and full-process storage/cookie
persistence. Downloaded production ZIP checksum/contents and extracted signature
verified without execution here. Evidence: docs/evidence/webkit-probe-ci.json.
Next dependency is an approved execution environment for owner-only W03/W04;
the owner cannot obtain that approval for this Mac. No login retry is pending.
Existing Chrome/native regression workflow 42532731468 also passed both
architectures for this source commit; the new probe did not replace that product.

## Environment and ownership

Target: company-managed macOS 27.0.1 (26A434), arm64. Node 26.4.0 / npm 11.17.0,
Swift 6.4, Xcode 27.2 via DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer.
Installed official Chrome 157.0.8103.39 has the browser passkey entitlement; its
minimum OS is 13.0. Fourdock targets 13.5 for the documented iCloud passkey support.
Older OS versions remain untested. Existing regular Chrome and Ferdium profiles
have not been modified. GitHub personal User account dorianganessa verified.
Public MIT repository: https://github.com/dorianganessa/fourdock-macos.
Commits use the owner's verified GitHub noreply identity.

## Phase status and exit criteria

- [x] 0: Environment, toolchain, ownership, scoped repository and plan established.
- [ ] 1: Official capability investigation complete. QR linking failed in the signed
  Chrome probe before passkey. Alternate phone-number authentication and recovery
  of the already-linked WhatsApp session inside the extension workspace are now
  owner-confirmed (2026-11-07). All four account logins and full dedicated-browser
  restart persistence are now confirmed. Original passkey participation is
  unreported, and QR/passkey acceptance remains open.
- [ ] 2: Four-service browser workspace, sidebar, Cmd+1–4, live-tab adoption,
  non-discardable tabs, title-only badges, preferences, diagnostics, scoped reload,
  browser attachments and optional Swift bridge implemented. Native execution on
  target blocked by signing policy; window-close behavior remains a functional gap.
- [ ] 3: Four logic tests and fourteen fixture checks pass on both macOS CI
  architectures. All four account logins and full-restart persistence are manually
  confirmed. Real drafts, OS notifications, attachments, sleep/wake and target
  native packaged-app behavior remain unverified.
- [ ] 4: Three fixture startups, 50 switches and 300.31 seconds idle measured.
  Real authenticated performance and prolonged usage remain unmeasured; no
  lightweight claim or Ferdium comparison.
- [ ] 5: Personal repository, MIT/license notices, English README, CI, inspected
  native ZIPs, checksums and prototype delivery published. Daily-use acceptance
  remains blocked by the real functional gates above.

## Architecture and known limits

Official Google Chrome runs the sites as top-level tabs in a dedicated profile.
The extension creates one normal window and adopts already-open service tabs
without reloading or copying authentication data. Chrome's toolbar/tab strip,
notifications identity and Dock icon remain. The optional Swift launcher supplies
a separate Dock/menu bridge and ordinary links to the default browser.

Hide minimizes and preserves loaded services. Chrome window close closes tabs and
can discard drafts. Chrome Cmd+Q closes the browser but does not itself terminate
the separate launcher. Those original lifecycle requirements are not waived.
Site themes are site preferences; Fourdock's theme preference controls its sidebar.

Native compilation/signing succeeded locally, but the first executable was killed
and subsequently absent. AMFI logged -423 (ad-hoc/unknown certificate chain); no
signing identities exist. The user confirmed device management. No further native
execution was attempted to bypass policy. Approved signing and/or IT authorization
is required. See SIGNING.md. CI ad-hoc execution does not authorize this Mac.

## Authentication evidence

See AUTHENTICATION.md. Original Ferdium: passkey confirmation fails before a phone
prompt. Signed Chrome probe: QR hangs; retry cannot link on phone before passkey.
Capacity excluded. Existing regular-browser session works and remains untouched.
The official phone-number method was reported successful by the owner. On
2026-11-07 the owner confirmed that the extension workspace recovers WhatsApp
already linked and opens Telegram, Fastmail and Gmail. This verifies alternate
WhatsApp authentication and workspace session access. The owner subsequently
confirmed all four account logins and a complete dedicated-browser restart with
all sessions intact. Original QR/passkey participation remains unreported.
Do not inspect account pages/data while the owner authenticates. No messages sent.
Do not copy cookies, delete passkeys, reset profiles or log out working devices.

## Verified builds and artifacts

Artifact source commit: be47d4653061e754eb906b2b1b20e695b0bd6e84.
Green workflow (both architectures):
https://github.com/dorianganessa/fourdock-macos/actions/runs/42255453874.

CI performs clean checkout, npm ci, syntax/identity checks, four logic tests,
Swift build, ad-hoc signature verification, native framing self-check, fourteen
headful browser fixture checks, and artifact upload. arm64: macos-26; Intel:
macos-15-intel. An earlier Intel immediate keyboard assertion was corrected with
a bounded wait for observed selection. The macos-15 arm64 pool stalled in queue;
the official macos-26 pool completed successfully.

Both ZIPs downloaded, allowlists inspected, bundled source/licenses compared
byte-for-byte and signatures verified without execution on the target.

| Archive | ZIP bytes | Uncompressed bytes | SHA-256 |
|---|---:|---:|---|
| Fourdock-macOS-arm64.zip | 61889 | 212351 | a2a73619dee57a574414c1555a5132e2993facbcbdbcb20271e8ba6878f097fa |
| Fourdock-macOS-x86_64.zip | 61005 | 173647 | ddd78a5e70ea6fd907410c4646555c3ae7175cadcc184fd42e36a4e964b8bea9 |

These packages contain the launcher/extension/notices; official Chrome is required
separately. Prototype delivery tag: v0.1.1-prototype. SHA256SUMS and build
provenance accompany delivery. No Developer ID signature/notarization is claimed.
No browser profile, credential, account content or private screenshot is packaged.

## Performance evidence

Local fixture benchmark: window API-ready proxies 2.027 / 1.357 / 1.006 s;
four-fixture readiness 3.953 / 1.745 / 1.340 s. Median selection request 12.54 ms,
p95 16.34 ms. Five-minute mean CPU 1.40% of one core; mean aggregate RSS
754.71 MiB, final 520.67 MiB. Includes testing browser/children and Node, excludes
blocked native launcher. See PERFORMANCE.md and raw anonymous evidence.
Do not interpret API acknowledgements as measured first paint or these numbers as
authenticated app costs. No performance optimization has been claimed.

## Next three concrete actions

1. Obtain owner results for the requested unsent-draft/Cmd+1–4 check and a valid
   incoming notification while minimized, including its click destination. No
   pairing or login retries are needed for the already-working accounts.
2. Prepare owner-only synthetic attachment preview/cancel/download checks, then
   controlled offline/online and physical sleep/wake, preserving unsent drafts.
   Do not send to contacts or manipulate security/network policy.
3. After active checks finish and the owner leaves the four services idle, collect
   300 seconds using the read-only real-workspace resource observer. Earlier
   fixture startup/switch numbers remain separate. Native signing approval and
   close-to-hide/Chrome identity constraints remain independent blockers.

## Final 0.1.1 verification checkpoint

Both CI hosts also opened the actual packaged AppKit window, observed it through
WindowServer metadata, checked the user-private socket and scoped host manifest,
and delivered a framed native-host message into that running process. Evidence:
docs/evidence/native-ci.json. This is a native CI execution check, not target-Mac
approval or an account login test.

Compilation-only packaging also succeeded on the managed Mac with
FOURDOCK_BUILD_ONLY=1 npm run build. This does not execute the blocked binary.
The default CI path still executes the native self-check and GUI/IPC test.

0.1.1 corrects WhatsApp's absolute-root overlap with the rail, confirmed using only
public unauthenticated geometry: at 1280px width, service left=68, rail right=68,
service right=1280. It uses a closed rail shadow root, exercises buttons through
accessibility, and initializes title counts/selected identity on live-tab adoption.
No authenticated page contents or QR images were captured. The historical fixture
performance baseline predates live-tab adoption and these layout changes.

Owner confirmed WhatsApp workspace recovery and all four service pages opening
on 2026-11-07. All logins and full-restart persistence were then owner-confirmed. If an earlier
unpacked extension was
already loaded, Reload it in chrome://extensions, then refresh service tabs only
after the owner preserves any unsent drafts. Never automatically reload their
pages or clear authentication data. Final delivery:
https://github.com/dorianganessa/fourdock-macos/releases/tag/v0.1.1-prototype.

## Publication receipt

0.1.1 prerelease published and verified (not a draft), with both architecture ZIPs,
SHA256SUMS.txt and BUILD-PROVENANCE.json. Tag target / release source:
1da09bdb8ea349172607971ce2e6b10593c6b72d; compiled artifact source is be47d46.
Public anonymous ARM download succeeded and its SHA-256 matched the recorded hash.
0.1.0 remains in history, marked superseded. Source tree is clean apart from this
final receipt update. No real account acceptance gate has been silently passed.
Next dependency: owner draft/background-notification results. All four account
logins and full-restart persistence are confirmed; original QR/passkey acceptance
remains open.

## Owner verification, 2026-11-07

PASS MANUALE CONFERMATO: Fourdock's extension workspace recovers WhatsApp already
linked and opens the other three services, reported directly by the owner. No
account content, identifiers or screenshots were requested or inspected. Scope:
session access and service opening only. The owner has been asked to complete
Telegram/Fastmail/work Gmail logins through official UI and report outcomes.
This first observation did not cover QR/passkey, restart, drafts, notifications
or real attachments. Restart was subsequently confirmed in the checkpoint below.

## Owner verification, 2026-11-07 — all services and restart

PASS MANUALE CONFERMATO: owner reported login completed for every service and
successful authenticated return for all four after the requested full exit/reopen
of the dedicated browser. Individual SSO/MFA/popup details were not reported.
The original QR/passkey requirement remains open, and native target execution is
still blocked. No account contents were inspected and no messages were sent.
Next requested checks: unsent draft across service switching and a genuine
incoming notification while minimized, with correct destination after clicking.
An initial self-message notification suggestion was corrected; it is not a valid
standalone negative test. Real-process measurement tooling is prepared; its short
validation run was uncontrolled, not an idle benchmark, and remains private.
