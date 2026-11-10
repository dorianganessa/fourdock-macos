# Chrome workspace: shortcuts and notification previews

Updated 2026-11-10, extension 0.2.0. The owner chose to return to the Chrome
workspace whose four account logins and restart persistence were confirmed on
2026-11-07. New notification/shortcut behavior still needs owner verification.
No new QR, cookie import, native execution or framework migration is involved.

## Update the existing workspace

1. Run `bash scripts/open-browser.sh` from this repository. It opens the same
   Fourdock-Browser-Probe directory as before; it does not clear browser data.
2. In that dedicated Chrome, reload Fourdock on chrome://extensions. If the
   extension was removed, Load unpacked and select this repository's extension
   directory. Its extension ID is unchanged. Accept Chrome's new notifications
   permission if requested. Removing the extension does not remove site logins.
3. Open Fourdock preferences and Open workspace. Save any unsent drafts, then
   reload each service once so the new document-start notification relay loads.
   Do not log out or reset any site/profile. Existing tabs are adopted unchanged
   until the owner chooses to reload them.
4. Check the four actual shortcut assignments. Defaults on macOS are physical
   Control+Shift+1, 2, 3, 4 for WhatsApp, Telegram, Fastmail and Gmail. Cmd+1–4
   remains available inside service pages. Conflicting/unassigned shortcuts can
   be changed with Configure shortcuts; set scope to Global. Chrome must run.
5. Test each service notification from preferences. A test contains synthetic
   text only, opens its service when clicked, and sends no message or email.
   Permit Chrome banners in macOS and check Focus if the OS shows no banner.

## Notification behavior

The page Notification constructor is relayed through chrome.notifications when
the page is a mapped top-level service document, its ordinary site notification
permission is granted, and the service's relay preference is enabled. The title
starts with `Fourdock · WhatsApp` (or the corresponding service), followed by
the original title/sender. The original body/preview remains. Icons are local
service-colored letter tiles, not fetched avatars. The original site icon/avatar
is replaced to make service identity clearer. Silent/interaction requests pass
through where Chrome supports them. The ordinary page notification is replaced,
not shown a second time.

A click first focuses/restores the existing service tab, then dispatches a click
to the originating page notification object, addressed by Chrome document ID.
The site's own handler may open the conversation; a closed/navigated originating
document cannot receive that callback, so only the service opens in that case.
Tag replacement and explicit close are forwarded. Errors/disconnection fall back
to the ordinary site notification. Turning a relay preference off restores native
site behavior for future page notifications.

Sender names/previews pass transiently to Chrome's notification API; Fourdock
does not save, log or include them in diagnostics. Session storage holds only
bounded routing metadata (service, random notification ID, tab/document IDs,
timestamp), allowing a suspended extension worker to route clicks. macOS/Chrome
may retain notification contents in their ordinary notification history. No inbox,
chat DOM, credentials, cookies or authentication APIs are inspected.

## Limits and remaining checks

- macOS attributes alerts to Chrome, including its primary application icon and
  notification settings/grouping. An extension cannot become a separate native
  notification sender. Distinguishing text/service artwork is the improvement.
- Notifications made inside a website's service worker are outside the page
  relay. They retain the ordinary site's appearance. This does not promise all
  background pushes from all four services are relayed or that no other Chrome
  profile can emit its own notification.
- A service must actually emit a page Notification. This is not an unread-count
  alert system; Fourdock does not invent message alerts or inspect messages.
- Website code can reject synthetic click events; service focusing still works,
  but exact-conversation navigation requires a real service test.
- Chrome/OS notification settings, Focus and service settings can suppress banners.
  A successful API response or test banner does not prove real incoming delivery.
- Keep the window hidden/minimized to retain live tabs. Closing it still closes
  the tabs; quitting Chrome stops the extension/global commands.

Official APIs checked 2026-11-10:
- https://developer.chrome.com/docs/extensions/reference/api/commands
- https://developer.chrome.com/docs/extensions/reference/api/notifications
- https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#work_in_isolated_worlds
