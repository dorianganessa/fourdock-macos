# Fourdock WhatsApp candidate

This directory reuses wacli Mission Control 0.2.6 at upstream commit
`4d4ffaf0dbd9cd530f6d298e6da18c110e86e5a6`, MIT, by Ido Green.
Upstream source, README and LICENSE are retained. Fourdock additions are the
pairing adapter, explicit separate data ownership, demo fixture, browser connector,
PWA metadata and Dock badge calls. No WhatsApp protocol/chat UI was rewritten.

From this directory:

```sh
npm ci --ignore-scripts
npm run build
npm start
```

Open http://127.0.0.1:4702. The default mode is a synthetic demo, using only the
bundled fake CLI and an owned `~/.fourdock-whatsapp/demo` store. It never contacts
WhatsApp. The pairing simulation explicitly uses no real QR/passkey. The real
chat UI remains upstream Mission Control, with two synthetic conversations.

Use **Installa come app** or Chrome's normal install menu for a separate app
window/Dock entry, then **Prova notifica e badge** to test OS identity. Grant the
installed app normal macOS notification/badge permission. Chrome remains its
engine; this is not a new unsigned Swift executable. Ordinary PWA installation
on the managed target is an owner check, not assumed to succeed.

The test button now exercises the same page Notification API as incoming previews,
without waiting for service-worker activation. It reports browser show/error or
no confirmation after eight seconds, plus the app opt-in, browser permission and
app/browser window context. A browser event is not proof that a person saw a macOS
banner. The synthetic badge restores the real unread total independently.
If macOS lists only Chrome notification entries, check those registered entries;
do not assume a separate Fourdock entry already exists.

For an existing live candidate, Dockerfile.frontend-update can layer the tested
Fourdock-WhatsApp-web CI artifact (as web/ in its build context) onto an explicit
FOURDOCK_BASE_IMAGE. It changes only static assets; retain the candidate volume
and restore its prior sync state after recreation. It does not migrate the CLI,
read/copy sessions, or touch the production monitor.

## Live candidate prerequisites

Live mode requires an explicit `FOURDOCK_MODE=live` and absolute `WACLI_BIN` that
implements the owner's `auth pair` NDJSON protocol. Ordinary unmodified upstream
wacli does not implement that passkey command. The app creates a separate owned
store and refuses to replace a session.db during pairing. Do not copy production
session files or point this at the homeserver monitor. No live pairing is started
on launch; **Collega WhatsApp** is an explicit user action. Sync is stopped during
pairing and started separately after completion.

The intended real backend is a **separate Linux homeserver candidate**. The
Dockerfile copies the already patched CLI from an explicitly selected existing
image. compose.candidate.yml creates its own named volume and loopback-only
listener on port 4702, with no public router. A normal private SSH tunnel maps
that same port to 127.0.0.1 on the Mac. This does not run another modified native
executable on the managed Mac or mount/stop/update the production monitor.
Set FOURDOCK_WACLI_IMAGE privately before building the candidate. Keep the image
reference and SSH connection settings out of the public repository.

The browser helper `connector/` uses only genuine web.whatsapp.com for the
owner's passkey, requires a trusted click and required user verification, and
returns the assertion only to http://127.0.0.1:4702. It is independent of the
original Fourdock extension. Load it unpacked in the browser used by this app.
The generated connector.json pins its public extension ID. No private signing
key is stored or required for the unpacked helper.

The frontend holds a pairing capability in memory. QR/challenge/assertion traffic
is no-store and never logged or persisted by the adapter. The backend submits
responses through private child-process pipes; wacli/WhatsApp validates the
assertion and saves the new client session. Cancellation/timeouts terminate that
single attempt; no pairing/re-pairing retries are performed.

## Limits

This is WhatsApp only. Current Fourdock Chrome stays separate and unchanged.
Native system notification identity, badge visibility and real passkey success
need owner verification; API success is insufficient. The existing UI receives
events while its renderer is alive. Closing every app window does not guarantee
ongoing notifications. No real message is sent during agent tests.

Incoming-message desktop notifications are off by default upstream: enable them
in Settings after granting app permission. The test button checks OS delivery
only, not a real incoming message. The candidate starts read-only; enabling its
own send mode is separate from the production monitor's policy. Global shortcuts
from the original four-service extension do not yet target this independent PWA.

The production monitor's read-only/send policy and its working tree are untouched.
Running a separate server candidate and its live authentication still require
candidate runtime configuration; do not start another process on the monitor's
store. Private existing helper/patch sources and server configuration are not
published here.
