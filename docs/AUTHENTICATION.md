# Authentication investigation

Updated 2026-11-07. **Alternate WhatsApp login and workspace session recovery are
manually confirmed. The original QR/passkey acceptance remains open.**
Phone test environment reported by owner: Android, standard WhatsApp; version not
provided. The alternate phone-number flow has a reported successful result, while
the original QR-plus-passkey gate remains failed/unverified.
Only anonymous stages/results are recorded. No identifiers, QR images, credentials,
assertions, cookies, account screenshots or chat content belong in this repository.

| Trial | Observed result | Meaning |
|---|---|---|
| Existing Ferdium | QR leads to browser passkey confirmation, which fails immediately; no phone prompt | Original incident, owner reported |
| Official signed Chrome, fresh dedicated profile, no extension | QR linking hangs; retry gives inability to link on phone, before passkey | FAIL. Engine substitution has not demonstrated a fix; this is earlier than the Ferdium error |
| Linked-device capacity check | Owner confirmed capacity remains | Capacity hypothesis excluded; no devices removed |
| Existing browser baseline | An already linked regular browser session works | Preserve it. This does not prove a new pairing can succeed |
| Official phone-number linking, dedicated profile | Owner reported "worked", then confirmed the extension recovers the already-linked WhatsApp session on 2026-11-07 | PASS MANUALE CONFERMATO for alternate authentication and session access inside the extension workspace. Passkey participation and full restart persistence remain unconfirmed |
| Extension workspace, 2026-11-07 | Owner confirmed WhatsApp is recovered already linked and the other three services open | PASS MANUALE CONFERMATO for service opening and WhatsApp integration. Opening the other sites does not confirm their logins |
| Work Gmail | Result not reported | BLOCCATO / owner verification needed |

The Chrome extension is now confirmed to reuse the real WhatsApp session through
the supported phone-number route. This does not prove that it resolves the
original QR/passkey failure.
After two investigated explanations failed to resolve the incident, additional
context was requested in accordance with the user's debugging instructions.
The single official phone-number attempt was reported successful. On 2026-11-07
the owner confirmed that Open workspace recovers WhatsApp already linked and
opens Telegram, Fastmail and Gmail. Preserve this dedicated-profile session.
Whether a passkey was involved is still unreported. Next: complete the other three
logins, then check persistence after a controlled full restart. No new QR or
phone-number pairing attempt is needed for the already-working session.

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
