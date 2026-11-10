# Authentication investigation

Updated 2026-11-10. **All four services' logins and session persistence after a
full dedicated-browser restart are owner-confirmed. The original WhatsApp
QR/passkey acceptance remains open.**
Phone test environment reported by owner: Android, standard WhatsApp; version not
provided. The alternate phone-number flow has a reported successful result, while
the original QR-plus-passkey gate remains failed/unverified.
Only anonymous stages/results are recorded. No identifiers, QR images, credentials,
assertions, cookies, account screenshots or chat content belong in this repository.

## Official macOS app and public reports, 2026-11-10

The owner clarified that the newly mentioned native-app failure concerns
**official WhatsApp for macOS**, not our Swift probe. Do not conflate this with
Fourdock's AMFI incident or Electron's missing hybrid integration. The owner then
provided a phone screenshot from the linked-device QR scanner. Its warning is:
"Usa WhatsApp Web ufficiale per continuare"; the explanation says it appears the
official WhatsApp Web is not in use and asks the owner to continue in a browser.
Only this generic error text is recorded; the private screenshot is not published.
No passkey prompt/error is visible in this screenshot. Do not infer from this that
a passkey could never be requested later, or that the rejection's internal cause
has been identified. The phone WhatsApp version and beta status were requested
for a focused comparison and remain pending.
Read-only bundle metadata shows WhatsApp 26.45.13, build 1108933973; no official
WhatsApp profile or account data was inspected. A subsequent read-only check of
the installed bundle passed codesign --verify --deep --strict; its Developer ID
authority is WhatsApp Inc., bundle net.whatsapp.WhatsApp, and a notarization ticket
is stapled. This supports authenticity of the installed Mac bundle; it does not
explain the phone-side classification or establish why the pairing was refused.

WABetaInfo's 2026-09-01 original feature report documents the same warning UI as
an Android linked-device warning for clients considered unofficial. It reports
observing the feature in beta 2.26.35.1; that is not the owner's confirmed phone
version, and the article does not establish a false-positive bug in official Mac
26.45.13. Treat it as identification of the warning, not an authoritative diagnosis.
[Original UI report](https://wabetainfo.com/whatsapp-is-testing-a-safety-warning-for-unofficial-web-clients/).

The successful Chrome trial was official phone-number linking. It does not
establish a successful passkey ceremony. No fresh passkey result was confirmed
on Chrome, Safari or the official Mac app, and no universal platform failure can
be inferred from the current evidence.

Public first-hand reports do exist:

- A Reddit commenter describes the Mac client failing to relink while WhatsApp
  Web on the same Mac completes a passkey check. The thread contains mixed
  iPhone/Android and error reports; it establishes that users discuss a similar
  symptom, not the cause of this owner's failure.
  [Direct comment](https://www.reddit.com/r/MacOS/comments/1rftzcy/comment/ouvd0bi/).
- Another report describes a Samsung Android primary phone, successful Mac
  linking/sync, and forced logout after 30–60 seconds. That is a distinct
  post-link stage and must not be treated as the same error without confirmation.
  [First-hand report](https://www.reddit.com/r/whatsapp/comments/1v1zciq/whatsapp_on_macos_forcelogs_me_out_3060s_after/).
- WAHA issue 2138, opened 2026-06-30, documents Android accounts requiring
  passkey continuation after device pairing, including third-party engine
  compatibility problems. This is a third-party integration report, not an
  official WhatsApp Mac incident acknowledgement or a recommended client.
  [Technical issue](https://github.com/devlikeapro/waha/issues/2138).

The 2026-08-27 Google/WhatsApp case study documents real credential-provider and
cross-platform challenges, including unreliable Bluetooth dependency and confusion
between WebAuthn QR codes and WhatsApp linking QR codes. Its discussion of native
Android/iOS credentials does not establish a Mac client bug or explain this user's
error. [Primary case study](https://developer.android.com/blog/posts/how-whats-app-upgraded-to-secure-seamless-sign-in-for-1-billion-users-with-passkeys).

WhatsApp officially lists Mac as a supported linked-device platform. No official
acknowledgement of this exact owner's current failure or one ongoing global
outage was established. Similar community reports cannot establish either.
[Supported linked devices](https://faq.whatsapp.com/378279804439436/).

The next diagnostic dependency is the phone app's version/beta status and the
official pairing classification, not a new generic framework experiment. The
missing Electron hybrid path remains a distinct finding; adding it alone is not
proven to resolve this warning. No new linking attempt, profile reset, key
deletion, update/reinstall, credential bridge or network/security change was made.

| Trial | Observed result | Meaning |
|---|---|---|
| Existing Ferdium | QR leads to browser passkey confirmation, which fails immediately; no phone prompt | Original incident, owner reported |
| Official signed Chrome, fresh dedicated profile, no extension | QR linking hangs; retry gives inability to link on phone, before passkey | FAIL. Engine substitution has not demonstrated a fix; this is earlier than the Ferdium error |
| Linked-device capacity check | Owner confirmed capacity remains | Capacity hypothesis excluded; no devices removed |
| Existing browser baseline | An already linked regular browser session works | Preserve it. This does not prove a new pairing can succeed |
| Official phone-number linking, dedicated profile | Owner reported "worked", then confirmed the extension recovers the already-linked WhatsApp session on 2026-11-07 | PASS MANUALE CONFERMATO for alternate authentication and session access inside the extension workspace. Full restart persistence was subsequently owner-confirmed for all four services; passkey participation remains unconfirmed |
| Extension workspace, 2026-11-07 | Owner confirmed WhatsApp is recovered already linked and the other three services open | PASS MANUALE CONFERMATO for service opening and WhatsApp integration. Opening the other sites does not confirm their logins |
| Telegram, Fastmail and corporate Gmail login | Owner reported access completed for all services on 2026-11-07 | PASS MANUALE CONFERMATO for actual account login. Individual SSO/MFA/popup details were not reported |
| Full dedicated-browser restart, all four services | Owner confirmed all returned authenticated after the requested complete exit/reopen | PASS MANUALE CONFERMATO for session persistence on the target Mac; no profile data or account contents inspected |

The Chrome extension is now confirmed to reuse the real WhatsApp session through
the supported phone-number route. This does not prove that it resolves the
original QR/passkey failure.
After two investigated explanations failed to resolve the incident, additional
context was requested in accordance with the user's debugging instructions.
The single official phone-number attempt was reported successful. On 2026-11-07
the owner confirmed that Open workspace recovers WhatsApp already linked and
opens Telegram, Fastmail and Gmail. Preserve this dedicated-profile session.
The owner then confirmed login to all four services and successful persistence
after the requested complete exit/reopen of the dedicated browser. Whether a
passkey was involved remains unreported. No new QR, pairing, logout or profile
reset is needed. Next checks concern real drafts, background notifications,
attachments and network/sleep recovery, not account authentication retries.

Do not invent a retry cooldown or service incident, remove passkeys, clear account
data, log out of working sessions, or change managed network/security settings.
No such action has been taken. Inspect one hypothesis and its evidence at a time.

Official references:
- https://faq.whatsapp.com/378279804439436/
- https://faq.whatsapp.com/1324084875126592/
- https://faq.whatsapp.com/852892549070029/

Native signing is independent. CI compile/sign/protocol checks succeed on GitHub's
Mac; local AMFI rejects ad-hoc code on the managed target. Solving signing would
not resolve the observed phone pairing failure.
