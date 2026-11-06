# Authentication investigation

Updated 2026-11-06. **WhatsApp acceptance has failed. No engine is validated.**
Only anonymous stages/results are recorded. No identifiers, QR images, credentials,
assertions, cookies, account screenshots or chat content belong in this repository.

| Trial | Observed result | Meaning |
|---|---|---|
| Existing Ferdium | QR leads to browser passkey confirmation, which fails immediately; no phone prompt | Original incident, owner reported |
| Official signed Chrome, fresh dedicated profile, no extension | QR linking hangs; retry gives inability to link on phone, before passkey | FAIL. Engine substitution has not demonstrated a fix; this is earlier than the Ferdium error |
| Linked-device capacity check | Owner confirmed capacity remains | Capacity hypothesis excluded; no devices removed |
| Existing browser baseline | An already linked regular browser session works | Preserve it. This does not prove a new pairing can succeed |
| Official phone-number linking, dedicated profile | Test requested; result pending | Change only pairing method to distinguish QR-specific failure |
| Work Gmail | Result not reported | BLOCCATO / owner verification needed |

The Chrome extension is a tested container candidate, not a proven workaround.
After two investigated explanations failed to resolve the incident, additional
context was requested in accordance with the user's debugging instructions.
Next test: a single official phone-number linking attempt, with number/code entered
only in official interfaces. It may still require the actual passkey. A successful
alternate method would not pass the explicitly requested QR-plus-passkey test.

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
