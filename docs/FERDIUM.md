# Ferdium: original WhatsApp Web and the Fourdock alternative

Checked 2026-11-12. Owner prefers repairing original WhatsApp Web; using the
already connected Fourdock client inside Ferdium is the fallback.

## Original service

The current WhatsApp recipe strips Ferdium/Electron user-agent text; its unsafe
page script throttles pushState. Neither implements phone-passkey discovery.
Ferdium PR2337 is merged, but its electron-webauthn-linux bridge is Linux-only.
Electron's hybrid PR55427 and dependency55426 remain open/unmerged; the reported
hardware test is Linux/Android/GitHub, not macOS/WhatsApp.

This is not evidence of a ready Mac recipe patch. A patched Electron runtime
would need its own accepted signature and a real owner phone test. The original
official Mac app's phone-side client warning is a separate unresolved issue;
fixing a passkey call would not establish that warning is fixed.

Sources: [Ferdium Linux bridge](https://github.com/ferdium/ferdium-app/pull/2337),
[Electron hybrid PR](https://github.com/electron/electron/pull/55427),
[WhatsApp recipe](https://github.com/ferdium/ferdium-recipes/tree/main/recipes/whatsapp).

## Reuse the already authenticated client

`integrations/ferdium/fourdock-whatsapp` is an optional recipe for the existing
official Ferdium app. It opens http://127.0.0.1:4702/ and forwards only the unread
count from our page title through Ferdium.setBadge. It does not rebuild/change
Ferdium, copy a browser session, or repair the original web.whatsapp.com service.
The same backend and private SSH login service remain necessary.

Ferdium's documented development recipe directory on macOS is
`~/Library/Application Support/Ferdium/recipes/dev/`. Place the supplied folder
there, reload/restart Ferdium, then add **Fourdock WhatsApp** from its service list.
Keep any existing service/profile unchanged. No account-storage file is needed.

The recipe's loopback restriction and badge updates have a synthetic test.
Actual native notification delivery, clicks and service switching in Ferdium
remain owner checks. Its storage/notification permission is separate from the PWA:
enable the client Desktop Notifications toggle there and permit Ferdium notices
if requested. Keep only one client window active when checking duplicate notices.
No new WhatsApp login should be needed with the existing backend session.

[Official recipe guide](https://github.com/ferdium/ferdium-recipes/blob/main/docs/integration.md),
[official development-folder script](https://github.com/ferdium/ferdium-recipes/blob/main/scripts/create.mjs).

## Client usability

Immediate text/reply/file sends now dispatch from the first Enter or Send click.
Settings offers **Chiedi conferma prima di inviare** to restore the extra dialog;
scheduled messages keep the time-selection dialog. Failed sends restore the
draft and show an error for manual retry; they are never retried automatically.
The existing server-side live-mode gate and explicit API confirmation remain.

Notifications look up only the sender's already-synced contact, cached for five
minutes with a 1.5-second lookup deadline. A local alias takes precedence, then
the synced address-book name, then the contact/chat/push-name fallback. A group
keeps its subject as the title and identifies its participant in the body.
Missing or unavailable contact names still fall back to the existing number;
this does not read or import macOS Contacts or fetch an external address book.

Emoji are ordinary Unicode text, including composed emoji and skin tones.
Use the macOS character picker (Control–Command–Space) in the message field.
